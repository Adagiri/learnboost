const express = require('express');

const {
  getWithdrawals,
  getWithdrawalById,
} = require('../controllers/withdrawals.js');
const { protect } = require('../middlewares/auth.js');
const router = express.Router();

router.get('/', protect, getWithdrawals);
router.route('/:withdrawalId').get(protect, getWithdrawalById);

module.exports = router;
