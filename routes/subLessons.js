const express = require('express');

const {
  getSubLessons,
  addSubLesson,
  getSubLesson,
  editSubLesson,
  getSubLessonsForApp,
  getSubLessonProgress,
  updateSubLessonProgress,
  deleteSubLesson,
} = require('../controllers/subLessons.js');
const {
  protect,
  authorize,
  protectAdmin,
  protectUser,
} = require('../middlewares/auth.js');
const router = express.Router();

router
  .route('/')
  .get(protect, getSubLessons)
  .post(protectAdmin, authorize('Master', 'Moderator'), addSubLesson);

router.get('/app', protectUser, getSubLessonsForApp);

router
  .route('/progress/:subLessonId')
  .get(protectUser, getSubLessonProgress)
  .put(protectUser, updateSubLessonProgress);

router
  .route('/:subLessonId')
  .get(protect, getSubLesson)
  .put(protectAdmin, authorize('Master', 'Moderator'), editSubLesson)
  .delete(protectAdmin, authorize('Master', 'Moderator'), deleteSubLesson);

module.exports = router;
