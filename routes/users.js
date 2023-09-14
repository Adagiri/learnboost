const express = require('express');

const {
  getUsers,
  getUser,
  updateUser,
  getLoggedInUser,
} = require('../controllers/users.js');
const { protectUser, protectAdmin } = require('../middlewares/auth.js');
const router = express.Router();

router.route('/').get(protectAdmin, getUsers).put(protectUser, updateUser);
router.get('/logged-in', protectUser, getLoggedInUser);
router.route('/:userId').get(protectAdmin, getUser);

module.exports = router;
