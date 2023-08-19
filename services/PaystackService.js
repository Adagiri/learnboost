const axios = require('axios');
const { randomNumbers } = require('../utils/misc');

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

module.exports.handleWebhook = async (payload, res) => {
  let { event, data } = payload;

  let transactionType = 'disburse';

  if (event.startsWith('charge')) {
    transactionType = 'card';
  }

  const { amount, reference } = data;

  // Convert from kobo to naira (Amount from paystack is in -kobo-)
  const amountInNaira = Number(amount) / 100;

  // Successful paystack transaction (card or transfer)
  if (event === 'charge.success') {
    const metadata = data.metadata;
    const description = metadata?.description;
    const authorization = data.authorization;
    const customer = { email: data.customer.email };
    const paymentReference = reference;
    const transactionReference = reference;
    const paymentHandler = 'Paystack';
    const cardDetails = {
      token: authorization.authorization_code,
      cardType: authorization.card_type || authorization.brand,
      last4: authorization.last4,
      expMonth: authorization.exp_month,
      expYear: authorization.exp_year.slice(2), // It is sliced in order to convert it from the format '2022' to '22'
      bankName: authorization.bank,
      accountName: authorization.account_name,
      maskedPan: authorization.bin + '******' + authorization.last4,
      reusable: authorization.reusable,
      handler: 'Paystack',
      email: customer.email,
    };

    // Add saving - new card
    if (description === 'Fund_Saving_Via_Card') {
      await webhookAddSavingViaNewCard(
        {
          metadata,
          cardDetails,
          description,
          customer,
          amount: amountInNaira,
          paymentProviderCharge,
          paymentReference,
          transactionReference,
          paymentHandler,
        },
        res
      );
    }

    // Topup saving through card - Automated saving. This webhook runs after a successful charge is done on a users' card
    if (description === 'Topup_Saving_Via_Card') {
      await webhookTopupSavingViaCardAutodebit(
        {
          metadata,
          cardDetails,
          description,
          customer,
          amount: amountInNaira,
          paymentProviderCharge,
          paymentReference,
          transactionReference,
          paymentHandler,
        },
        res
      );
    }

    if (description === 'Fund_Saving_Via_Saved_Card') {
      // This webhook event is associated with using a saved card for making payments and all required change to the application has already been handled before response is sent back to the client. Hence, we respond to the webhook event with 200 status without carrying out any further action here.
      res.sendStatus(200);
    }

    if (description === 'Add_New_Card') {
      // Add card
      await webhookAddCard(
        {
          metadata,
          cardDetails,
          description,
          customer,
          amount: amountInNaira,
          paymentProviderCharge,
          paymentReference,
          transactionReference,
          paymentHandler,
        },
        res
      );
    }
  }

  if (event === 'charge.dispute.create') {
    const transactionId = data.id;
    const status = data.status;
    const amount = data.transaction.amount;
    const reference = data.transaction.reference;
    const refund_amount = data.refund_amount;
    const paymentHandler = 'Paystack';

    // Save the dispute & Send email alert
    webhookDisputeCreated(
      {
        transactionId,
        status,
        amount,
        reference,
        refund_amount,
        paymentHandler,
      },
      res
    );
  }

  if (event === 'charge.dispute.remind') {
    // You have not sorted out a complaint laid on your bussiness, Do something
    const transactionId = data.id;
    const status = data.status;
    const amount = data.transaction.amount;
    const reference = data.transaction.reference;
    const refund_amount = data.refund_amount;
    const paymentHandler = 'Paystack';

    // Save the dispute & Send email alert
    webhookDisputeRemind(
      {
        transactionId,
        status,
        amount,
        reference,
        refund_amount,
        paymentHandler,
      },
      res
    );
  }

  if (event === 'charge.dispute.resolve') {
    // Complaint has been sorted out
    const transactionId = data.id;
    const status = data.status;
    const amount = data.transaction.amount;
    const reference = data.transaction.reference;
    const refund_amount = data.refund_amount;
    const paymentHandler = 'Paystack';

    // Save the dispute & Send email alert
    webhookDisputeResolve(
      {
        transactionId,
        status,
        amount,
        reference,
        refund_amount,
        paymentHandler,
      },
      res
    );
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