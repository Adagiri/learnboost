const mongoose = require('mongoose');

const MarketingEarningsRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  marketer: {
    type: mongoose.Types.ObjectId,
    ref: 'Marketer',
    required: true,
  },

  subscriptionTransaction: {
    type: mongoose.Types.ObjectId,
    ref: 'SubscriptionTransaction',
    required: true,
  },

  earningPercentage: {
    type: Number,
    required: true,
  },

  amountEarned: {
    type: Number,
    required: true,
  },

  transactionDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  'MarketingEarningsRecord',
  MarketingEarningsRecordSchema
);
