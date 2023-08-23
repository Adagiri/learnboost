const mongoose = require('mongoose');

const SubLessonSchema = new mongoose.Schema({
  category: {
    type: mongoose.ObjectId,
    ref: 'Category',
    required: true,
  },

  series: {
    type: mongoose.ObjectId,
    ref: 'Series',
    required: true,
  },

  lesson: {
    type: mongoose.ObjectId,
    ref: 'Lesson',
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  video: {
    type: String,
    required: true,
  },

  videoType: {
    type: String,
    required: true,
  },

  notes: {
    type: String,
  },

  duration: {
    type: Number,
    default: 0,
  },

  size: {
    type: Number,
    default: 0,
  },

  access: {
    type: String,
    enum: ['Free', 'Premium'],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

SubLessonSchema.pre('remove', async function (next) {
  await this.model('SubLessonProgress').deleteMany({ subLesson: this._id });
  await this.model('Lesson').findByIdAndUpdate(this.lesson, {
    $inc: {
      subLessonsCount: -1,
      totalDuration: -this.duration,
      totalSize: -this.size,
    },
  });
  next();
});
// progress
// isCompleted

module.exports = mongoose.model('SubLesson', SubLessonSchema);
