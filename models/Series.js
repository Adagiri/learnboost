const mongoose = require('mongoose');

const SeriesSchema = new mongoose.Schema({
  category: {
    type: mongoose.ObjectId,
    ref: 'Category',
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  banner: {
    type: String,
    required: true,
  },

  lessonsCount: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

SeriesSchema.pre('remove', async function (next) {
  next();
});

module.exports = mongoose.model('Series', SeriesSchema);
