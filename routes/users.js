const express = require('express');

const { getUsers, getUser } = require('../controllers/users.js');
const { protect, authorize, protectAdmin } = require('../middlewares/auth.js');
const router = express.Router();

router.route('/').get(getUsers);

router.route('/:userId').get(protect, getUser);

module.exports = router;
