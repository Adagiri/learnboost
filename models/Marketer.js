const mongoose = require('mongoose');

const MarketerSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },

  accountType: {
    type: String,
    default: 'Marketer',
  },

  email: {
    type: String,
    required: [true, 'Please add an email'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },

  password: {
    type: String,
    select: false,
  },

  isAccountActivated: {
    type: Boolean,
    default: false,
  },

  referralCode: {
    type: String,
    required: true,
  },

  walletBalance: {
    type: Number,
    default: 0,
  },

  resetPasswordCode: String,
  resetPasswordToken: String,
  resetPasswordTokenExpiry: Date,

  accountActivationCode: String,
  accountActivationToken: String,
  accountActivationTokenExpiry: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

MarketerSchema.pre('remove', async function (next) {
  next();
});

module.exports = mongoose.model('Marketer', MarketerSchema);
