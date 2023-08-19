const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },

  accountType: {
    type: String,
    default: 'User',
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

  lastSubscription: {
    type: String,
    enum: ['none', '6_months', '1_year'],
    default: 'none',
  },

  subscriptionStartDate: {
    type: Date,
  },

  subscriptionEndDate: {
    type: Date,
  },

  referralCode: String,

  agreedToTerms: {
    type: Boolean,
    default: true,
    select: false,
  },

  accountActivationCode: String,
  accountActivationToken: String,
  accountActivationTokenExpiry: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('remove', async function (next) {
  
  next();
});

module.exports = mongoose.model('User', UserSchema);
