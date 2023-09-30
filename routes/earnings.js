const express = require('express');

const { getEarnings, getEarningById } = require('../controllers/earnings.js');
const { protect } = require('../middlewares/auth.js');
const router = express.Router();

router.get('/', protect, getEarnings);
router.route('/:earningId').get(protect, getEarningById);

module.exports = router;
