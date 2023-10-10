const express = require('express');

const {
  getCategories,
  addCategory,
  getCategory,
  editCategory,
} = require('../controllers/categories.js');
const { protect, authorize, protectAdmin } = require('../middlewares/auth.js');
const router = express.Router();

router
  .route('/')
  .get(protect, getCategories)
  // .post(protectAdmin, authorize('Master', 'Moderator'), addCategory);

router
  .route('/:categoryId')
  .get(protect, getCategory)
  .put(protectAdmin, authorize('Master', 'Moderator'), editCategory);

module.exports = router;
