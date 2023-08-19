const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  series: {
    type: mongoose.ObjectId,
    ref: 'Series',
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

  totalVideoTime: {
    type: Number,
    default: 0,
  },

  subLessonsCount: {
    type: Number,
    default: 0,
  },

  level: {
    type: String,
    enum: ['Early', 'Medium', 'High'],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

LessonSchema.pre('remove', async function (next) {
  next();
});
// progress

module.exports = mongoose.model('Lesson', LessonSchema);
