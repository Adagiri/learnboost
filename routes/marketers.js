const express = require('express');

const {
  getMarketers,
  getMarketer,
} = require('../controllers/marketers.js');
const { protect, authorize, protectAdmin } = require('../middlewares/auth.js');
const router = express.Router();

router.route('/').get(getMarketers);

router.route('/:marketerId').get(protect, getMarketer);

module.exports = router;
