const mongoose = require('mongoose');

const SubLessonSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.ObjectId,
    ref: 'SubLesson',
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  src: {
    type: String,
    required: true,
  },

  notes: {
    type: String,
  },

  videoTime: {
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
  next();
});
// progress
// isCompleted

module.exports = mongoose.model('SubLesson', SubLessonSchema);
