const mongoose = require('mongoose');

const SubscriptionTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  reference: {
    type: String,
    required: true,
  },

  paymentHandler: {
    type: String,
    enum: ['Paystack'],
    default: 'Paystack',
  },

  paymentMethod: {
    type: String,
    enum: ['Card', 'Transfer'],
  },

  bankAccountDetails: {
    bankName: String,
    accountName: String,
    accountNumber: String,
  },

  transactionDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  'SubscriptionTransaction',
  SubscriptionTransactionSchema
);
