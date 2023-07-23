const mongoose = require('mongoose');

const MarketerWithdrawalTransactionSchema = new mongoose.Schema({
  amount: {
    type: String,
    trim: true,
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

  paymentHandlerReference: {
    type: String,
    required: true,
  },

  transactionCharge: {
    type: Number,
    required: true,
  },

  transactionDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  'MarketerWithdrawalTransaction',
  MarketerWithdrawalTransactionSchema
);
