const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },

  accountType: {
    type: String,
    default: 'Admin',
  },

  role: {
    type: String,
    enum: ['Moderator', 'Master'],
    default: 'Moderator',
  },

  phone: {
    type: String,
    trim: true,
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
  resetPasswordCode: String,
  resetPasswordToken: String,
  resetPasswordTokenExpiry: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

AdminSchema.pre('remove', async function (next) {
  next();
});

module.exports = mongoose.model('Admin', AdminSchema);
