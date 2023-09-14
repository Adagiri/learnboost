const asyncHandler = require('../middlewares/async');
const Lesson = require('../models/Lesson');
const LessonProgress = require('../models/LessonProgress');
const SubLesson = require('../models/SubLesson');
const SubLessonProgress = require('../models/SubLessonProgress');
const ErrorResponse = require('../utils/errorResponse');
const { getQueryArgs } = require('../utils/general');

const deriveSubLessonProgress = (subLessonId, subLessonsProgresses) => {
  const doc = subLessonsProgresses.find(
    (subLessonProgress) =>
      subLessonProgress.subLesson.toString() === subLessonId.toString()
  );

  if (doc) {
    return doc.progress;
  } else {
    return 0;
  }
};

module.exports.getSubLessonsForApp = asyncHandler(async (req, res, next) => {
  let subLessons = await SubLesson.find(req.query);

  const subLessonsProgresses = await SubLessonProgress.find({
    user: req.user.id,
  });

  subLessons = subLessons.map((subLesson) => {
    subLesson = subLesson.toObject();
    subLesson.id = subLesson._id;
    subLesson.progress = deriveSubLessonProgress(
      subLesson.id,
      subLessonsProgresses
    );

    return subLesson;
  });

  return res.status(200).json(subLessons);
});

module.exports.getSubLessons = asyncHandler(async (req, res, next) => {
  const { filter, sort, skip, limit } = getQueryArgs(req.query);
  let subLessons = await SubLesson.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const subLessonProgresses = await SubLessonProgress.find({
    user: req.user.id,
  });

  subLessons = subLessons.map((subLesson) => {
    subLesson = subLesson.toObject();
    subLesson.id = subLesson._id;
    subLesson.progress = deriveSubLessonProgress(
      subLesson.id,
      subLessonProgresses
    );

    return subLesson;
  });

  res.header('X-Total-Count', subLessons.length);
  res.status(200).json(subLessons);
});

module.exports.getSubLesson = asyncHandler(async (req, res, next) => {
  let subLesson = await SubLesson.findById(req.params.subLessonId);

  if (!subLesson) {
    return next(new ErrorResponse(400, 'Invalid sub lesson id'));
  }

  subLesson = subLesson.toObject();
  subLesson.id = subLesson._id;
  res.status(200).json(subLesson);
});

module.exports.addSubLesson = asyncHandler(async (req, res, next) => {
  let subLesson = await SubLesson.create(req.body);

  await Lesson.findByIdAndUpdate(req.body.lesson, {
    $inc: {
      totalDuration: req.body.duration,
      totalSize: req.body.size,
      subLessonsCount: 1,
    },
  });

  subLesson = subLesson.toObject();
  subLesson.id = subLesson._id;
  res.status(200).json(subLesson);
});

module.exports.editSubLesson = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const subLessonId = req.params.subLessonId;
  let subLessonBeforeEdit = await SubLesson.findById(subLessonId);

  let subLesson = await SubLesson.findByIdAndUpdate(subLessonId, req.body);

  const durationDifference = req.body.duration - subLessonBeforeEdit.duration;
  const sizeDifference = req.body.size - subLessonBeforeEdit.size;

  await Lesson.findByIdAndUpdate(req.body.lesson, {
    $inc: { totalDuration: durationDifference, totalSize: sizeDifference },
  });

  subLesson = subLesson.toObject();
  subLesson.id = subLesson._id;

  return res.status(200).json(subLesson);
});

module.exports.deleteSubLesson = asyncHandler(async (req, res, next) => {
  let subLesson = await SubLesson.findByIdAndDelete(req.params.subLessonId);

  if (subLesson) {
    await subLesson.remove();
  }

  subLesson = subLesson.toObject();
  subLesson.id = subLesson._id;

  return res.status(200).json(subLesson);
});

module.exports.getSubLessonProgress = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const subLessonId = req.params.subLessonId;

  const subLessonProgress = await SubLessonProgress.findOne({
    subLesson: subLessonId,
    user: userId,
  });

  const resp = { progress: subLessonProgress?.progress || 0 };

  return res.status(200).json(resp);
});

module.exports.updateSubLessonProgress = asyncHandler(
  async (req, res, next) => {
    // Extract progress value from the request body
    const progress = Math.abs(Number(req.body.progress));

    // Get user ID from the request
    const userId = req.user.id;

    // Get sub-lesson ID from the request parameters
    const subLessonId = req.params.subLessonId;

    // Find the sub-lesson by its ID and populate its associated lesson's subLessonsCount
    const subLesson = await SubLesson.findById(subLessonId)
      .populate('lesson', 'subLessonsCount')
      .select('lesson');

    // Extract the associated lesson's ID
    const lessonId = subLesson.lesson._id;

    // Define the query for finding the sub-lesson progress
    const query = {
      subLesson: subLessonId,
      user: userId,
      lesson: subLesson.lesson,
    };

    // Find the sub-lesson progress document based on the query
    const subLessonProgress = await SubLessonProgress.findOne(query);

    if (subLessonProgress) {
      // If progress exists and the new progress is greater, update it
      if (subLessonProgress.progress < progress) {
        subLessonProgress.progress = progress;
        await subLessonProgress.save();
      }
    } else {
      // If progress doesn't exist, create a new document with the progress value
      query.progress = progress;
      await SubLessonProgress.create(query);
    }

    // Update the lesson progress of the lesson associated with the sub-lesson
    // Get all progress documents associated with the lesson and user
    const progressesDocs = await SubLessonProgress.find({
      lesson: lessonId,
      user: userId,
    }).select('progress');

    // Calculate the sum of all sub-lesson progresses for the associated lesson
    const sum = progressesDocs.reduce((total, acc) => total + acc.progress, 0);

    // Calculate the average progress for the lesson
    const average = sum / subLesson.lesson.subLessonsCount;

    // Update or create a new LessonProgress document with the calculated average
    await LessonProgress.findOneAndUpdate(
      { lesson: lessonId, user: userId },
      { progress: average },
      { upsert: true }
    );

    // Respond with the updated sub-lesson progress
    return res.status(200).json({ progress: subLessonProgress.progress });
  }
);
