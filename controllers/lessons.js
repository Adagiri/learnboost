const asyncHandler = require('../middlewares/async');
const Lesson = require('../models/Lesson');
const Series = require('../models/Series');
const LessonProgress = require('../models/SubLessonProgress');
const { getQueryArgs } = require('../utils/general');

const deriveLessonProgress = (lessonId, lessonsProgresses) => {
  const doc = lessonsProgresses.find(
    (lessonProgress) => lessonProgress.lesson.toString() === lessonId.toString()
  );

  if (doc) {
    return doc.progress;
  } else {
    return 0;
  }
};

module.exports.getLessons = asyncHandler(async (req, res, next) => {
  const { filter, sort, skip, limit } = getQueryArgs(req.query);

  let lessons = await Lesson.find(filter).sort(sort).skip(skip).limit(limit);

  const lessonsProgresses = await LessonProgress.find({ user: req.user.id });

  lessons = lessons.map((lesson) => {
    lesson = lesson.toObject();
    lesson.id = lesson._id;
    lesson.progress = deriveLessonProgress(lesson.id, lessonsProgresses);

    return lesson;
  });

  res.header('X-Total-Count', lessons.length);
  res.status(200).json(lessons);
});

module.exports.getLesson = asyncHandler(async (req, res, next) => {
  let lesson = await Lesson.findById(req.params.lessonId);

  const lessonId = lesson._id;
  const userId = req.user.id;

  const lessonProgress = await LessonProgress.find({
    lesson: lessonId,
    user: userId,
  });

  lesson = lesson.toObject();
  lesson.progress = lessonProgress?.progress || 0;
  lesson.id = lesson._id;
  res.status(200).json(lesson);
});

module.exports.addLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.create(req.body);

  await Series.findByIdAndUpdate(req.body.series, {
    $inc: { lessonsCount: 1 },
  });

  lesson.id = lesson._id;
  res.status(200).json(lesson);
});

module.exports.editLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findByIdAndUpdate(req.params.lessonId, req.body);

  lesson.id = lesson._id;

  res.status(200).json(lesson);
});

module.exports.getLessonProgress = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const lessonId = req.params.lessonId;

  const lessonProgress = await LessonProgress.findOne({
    lesson: lessonId,
    user: userId,
  });

  const resp = { progress: lessonProgress?.progress || 0 };

  return res.status(200).json(resp);
});

module.exports.deleteLesson = asyncHandler(async (req, res, next) => {
  let lesson = await Lesson.findById(req.params.lessonId);

  if (lesson) {
    await lesson.remove();
  }

 return res.status(200).json(lesson);
});
