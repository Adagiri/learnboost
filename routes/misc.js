const express = require('express');

const { getSignedUrl, getDashboardData } = require('../controllers/misc.js');
const { protectAdmin, protect } = require('../middlewares/auth.js');
const router = express.Router();

router.route('/get-signed-url').get(protect, getSignedUrl);
router.route('/dashboard-data').get(protect, getDashboardData);

module.exports = router;
