const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  seriesCount: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Category', CategorySchema);
