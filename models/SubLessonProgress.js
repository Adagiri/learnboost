const mongoose = require('mongoose');

const SubLessonProgressSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.ObjectId,
    ref: 'Lesson',
    required: true,
  },

  subLesson: {
    type: mongoose.ObjectId,
    ref: 'SubLesson',
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

SubLessonProgressSchema.pre('remove', async function (next) {
  
  next();
});

module.exports = mongoose.model('SubLessonProgress', SubLessonProgressSchema);
