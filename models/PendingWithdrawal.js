const mongoose = require('mongoose');

const PendingWithdrawalSchema = new mongoose.Schema({
  marketer: {
    type: mongoose.Types.ObjectId,
    ref: 'Marketer',
  },

  reference: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('PendingWithdrawal', PendingWithdrawalSchema);
