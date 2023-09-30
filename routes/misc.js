const express = require('express');

const { getSignedUrl, getDashboardData } = require('../controllers/misc.js');
const { protectAdmin } = require('../middlewares/auth.js');
const router = express.Router();

router.route('/get-signed-url').get(protectAdmin, getSignedUrl);
router.route('/dashboard-data').get(protectAdmin, getDashboardData);

module.exports = router;
