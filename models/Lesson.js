const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
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

  title: {
    type: String,
    required: true,
  },

  banner: {
    type: String,
    required: true,
  },

  totalDuration: {
    type: Number,
    default: 0,
  },

  totalSize: {
    type: Number,
    default: 0,
  },

  subLessonsCount: {
    type: Number,
    default: 0,
  },

  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

LessonSchema.pre('remove', async function (next) {
  await this.model('SubLesson').deleteMany({ lesson: this._id });
  await this.model('Series').findByIdAndUpdate(this.series, {
    $inc: { lessonsCount: -1 },
  });
  next();
});
// progress

module.exports = mongoose.model('Lesson', LessonSchema);
