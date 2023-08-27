const axios = require('axios');
const { randomNumbers } = require('../utils/misc');
const {
  processSubscriptionTransactionWebhook,
} = require('../controllers/webhooks');
const { sendWebhookErrorToDeveloper } = require('../utils/messages');
const WebhookError = require('../models/WebhookError');

module.exports.initialiseTransaction = async (
  amount,
  email,
  metadata,
  channels
) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const baseUrl = process.env.PAYSTACK_BASE_URL;

  const headers = {
    Authorization: 'Bearer ' + secretKey,
    'Content-Type': 'application/json',
  };

  const amountInKobo = amount * 100;
  const data = {
    email,
    amount: amountInKobo,
    metadata: metadata ? metadata : undefined,
    channels: channels ? channels : undefined,
    reference: randomNumbers(20).toString(),
  };

  return axios.post(baseUrl + '/transaction/initialize', data, {
    headers,
  });
};

module.exports.handleWebhook = async (payload) => {
  let { event, data } = payload;

  console.log(event, 'event');
  // console.log(data, 'data');

  let transactionType = 'disburse';

  if (event.startsWith('charge')) {
    transactionType = 'card';
  }

  // Convert from kobo to naira (Amount from paystack is in -kobo-)
  const transactionAmount = Number(data.amount) / 100;

  // Successful paystack transaction (card or transfer)
  if (event === 'charge.success') {
    try {
      await processSubscriptionTransactionWebhook({
        metadata: data.metadata,
        channel: data.channel,
        reference: data.reference,
        transactionAmount: transactionAmount,
        authorization: data.authorization,
      });
    } catch (error) {
      const subject =
        'Error During Processing of Successful Subscription Transaction';

      // Save error to DB
      await WebhookError.create({
        subject: subject,
        error: error,
        type: 'SubscriptionTransaction',
        reference: data.reference,
      });

      // Send email to developers
      await sendWebhookErrorToDeveloper({
        subject: subject,
        error: error,
      });

      throw error;
    }
  }
};

// FOR DISBURSEMENTS
// transfer.failed;
// transfer.success;
// transfer.reversed;

// FOR CARD
// charge.success

// FOR BANK TRANSFER

// POSSIBLE DISPUTES
// charge.dispute.create
// charge.dispute.remind
// charge.dispute.resolve
