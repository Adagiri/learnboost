const mongoose = require('mongoose');

const LessonProgressSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.ObjectId,
    ref: 'Lesson',
    required: true,
  },

  user: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: true,
  },

  progress: {
    type: Number,
    default: 0,
  },
});

LessonProgressSchema.pre('remove', async function (next) {
  next();
});

module.exports = mongoose.model('LessonProgress', LessonProgressSchema);
