const express = require('express');

const {
  getUsers,
  getUser,
  updateUser,
  getLoggedInUser,
} = require('../controllers/users.js');
const { protectUser,  protect } = require('../middlewares/auth.js');
const router = express.Router();

router.route('/').get(protect, getUsers).put(protectUser, updateUser);
router.get('/logged-in', protectUser, getLoggedInUser);
router.route('/:userId').get(protect, getUser);

module.exports = router;
