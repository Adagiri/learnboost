const express = require('express');

const {
  getLessons,
  addLesson,
  getLesson,
  editLesson,
  getLessonProgress,
} = require('../controllers/lessons.js');
const {
  protect,
  authorize,
  protectAdmin,
  protectUser,
} = require('../middlewares/auth.js');
const router = express.Router();

router
  .route('/')
  .get(protect, getLessons)
  .post(protectAdmin, authorize('Master', 'Moderator'), addLesson);

router.route('/progress/:lessonId').get(protectUser, getLessonProgress);

router
  .route('/:lessonId')
  .get(protect, getLesson)
  .put(protectAdmin, authorize('Master', 'Moderator'), editLesson);

module.exports = router;
