const axios = require('axios');
const { randomNumbers } = require('../utils/misc');
const {
  processSubscriptionTransaction,
  processDisbursement,
} = require('../controllers/webhooks');
const {
  sendErrorToDeveloper,
  sendNotificationEmailToAUser,
} = require('../utils/messages');
const WebhookError = require('../models/WebhookError');
const { generateRandomString } = require('../utils/general');
const PendingWithdrawal = require('../models/PendingWithdrawal');

const transferFailureContent = (name) => `
Dear ${name},

We regret to inform you that we encountered an issue while processing your recent withdrawal request. Unfortunately, we were unable to complete the transaction at this time.

We kindly request you to initiate the withdrawal process again. If the issue persists or if you have any questions, please don't hesitate to reach out to our support team. We are here to assist you and ensure a smooth transaction experience.

Thank you for your understanding and cooperation.

Best regards,
LearnBoost
`;

module.exports.initialiseTransaction = async (
  amount,
  email,
  metadata,
  channels
) => {
  try {
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

    const response = await axios.post(
      baseUrl + '/transaction/initialize',
      data,
      {
        headers,
      }
    );

    return response.data.data;
  } catch (error) {
    console.log('Error Occured Whilst Initiating Transaction: ', error);
    throw error.response?.data;
  }
};

module.exports.createTransferRecipient = async (
  name,
  account_number,
  bank_code,
  metadata
) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const baseUrl = process.env.PAYSTACK_BASE_URL;

  try {
    const headers = {
      Authorization: 'Bearer ' + secretKey,
      'Content-Type': 'application/json',
    };

    const data = {
      type: 'nuban',
      name,
      account_number,
      bank_code,
      currency: 'NGN',
    };

    metadata && (data.metadata = metadata);

    const response = await axios.post(baseUrl + '/transferrecipient', data, {
      headers,
    });

    return response.data.data.recipient_code;
  } catch (error) {
    console.log('Error Occured Whilst Creating Transfer Recipient: ', error);
    throw error.response?.data;
  }
};

module.exports.disburseSingle = async (amount, reason, recipient) => {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const baseUrl = process.env.PAYSTACK_BASE_URL;

    const headers = {
      Authorization: 'Bearer ' + secretKey,
      'Content-Type': 'application/json',
    };

    const amountInKobo = amount * 100;
    const data = {
      source: 'balance',
      reason,
      amount: amountInKobo,
      recipient,
      reference: generateRandomString(20),
    };

    const response = await axios.post(baseUrl + '/transfer', data, {
      headers,
    });

    return response.data.data.reference;
  } catch (error) {
    console.log('Error Occured During Disbursement: ', error);

    const err = error.response?.data.message;

    if (err === 'Your balance is not enough to fulfil this request') {
      await sendErrorToDeveloper({
        subject: 'Disbursement Failed',
        error: err,
      });

      throw new Error('Please retry in 30 minutes');
    }
    throw error.response?.data;
  }
};

module.exports.getBanks = async () => {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const baseUrl = process.env.PAYSTACK_BASE_URL;

    const headers = {
      Authorization: 'Bearer ' + secretKey,
      'Content-Type': 'application/json',
    };

    const response = await axios.get(baseUrl + '/bank', {
      headers,
    });

    return response.data.data;
  } catch (error) {
    console.log('Error Occured Whilst Fetching Banks: ', error);

    throw error.response?.data;
  }
};

module.exports.getTransferBalance = async () => {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const baseUrl = process.env.PAYSTACK_BASE_URL;

    const headers = {
      Authorization: 'Bearer ' + secretKey,
      'Content-Type': 'application/json',
    };

    const response = await axios.get(baseUrl + '/balance', {
      headers,
    });

    return response.data.data[0].balance;
  } catch (error) {
    console.log('Error Occured Whilst Fetching Banks: ', error);

    throw error.response?.data;
  }
};

module.exports.getAccountDetail = async ({ account_number, bank_code }) => {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const baseUrl = process.env.PAYSTACK_BASE_URL;

    const headers = {
      Authorization: 'Bearer ' + secretKey,
      'Content-Type': 'application/json',
    };

    const response = await axios.get(
      baseUrl +
        `/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        headers,
      }
    );

    return response.data.data;
  } catch (error) {
    console.log('Error Occured Whilst Account Details: ', error);

    throw error.response?.data;
  }
};

module.exports.handleWebhook = async (payload) => {
  let { event, data } = payload;

  console.log(event, 'event');


  // Convert from kobo to naira (Amount from paystack is in -kobo-)
  const transactionAmount = Number(data.amount) / 100;

  // Successful paystack transaction (card or transfer)
  if (event === 'charge.success') {
    try {
      await processSubscriptionTransaction({
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
      await sendErrorToDeveloper({
        subject: subject,
        error: error,
      });

      throw error;
    }
  }

  if (event.startsWith('transfer')) {
    const metadata = data.recipient.metadata;
    try {
      if (event === 'transfer.success') {
        await processDisbursement({
          metadata: metadata,
          reference: data.reference,
          transactionAmount: transactionAmount,
          transactionDate: data.created_at,
          accountDetails: data.recipient.details,
        });
      }

      if (event === 'transfer.failed' || event === 'transfer.reversed') {
        await PendingWithdrawal.deleteMany({
          marketer: metadata?.marketerId,
        });
        const subject =
          'Important: Issue with Your Recent Withdrawal Transaction';
        await sendNotificationEmailToAUser({
          subject,
          content: transferFailureContent(metadata?.marketerName),
          email: metadata?.marketerEmail,
        });
      }
    } catch (error) {
      const subject = 'Error During Processing of Disbursement Transaction';

      // Save error to DB
      await WebhookError.create({
        subject: subject,
        error: error,
        type: 'DisbursementTransaction',
        reference: data.reference,
      });

      // Send email to developers
      await sendErrorToDeveloper({
        subject: subject,
        error: error,
      });

      throw error;
    }
    console.log('webhook received');
  }
};

// POSSIBLE DISPUTES
// charge.dispute.create
// charge.dispute.remind
// charge.dispute.resolve
