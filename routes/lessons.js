const express = require('express');

const {
  getLessons,
  addLesson,
  getLesson,
  editLesson,
  getLessonProgress,
  deleteLesson,
  getLessonsForApp,
  searchLesson,
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

router.get('/app', protectUser, getLessonsForApp);
router.get('/search', protectUser, searchLesson);

router.route('/progress/:lessonId').get(protectUser, getLessonProgress);

router
  .route('/:lessonId')
  .get(protect, getLesson)
  .put(protectAdmin, authorize('Master', 'Moderator'), editLesson)
  .delete(protectAdmin, authorize('Master', 'Moderator'), deleteLesson);

module.exports = router;
