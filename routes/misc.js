const express = require('express');

const { getSignedUrl } = require('../controllers/misc.js');
const { protect } = require('../middlewares/auth.js');
const router = express.Router();

router.route('/get-signed-url').get(protect, getSignedUrl);

module.exports = router;
