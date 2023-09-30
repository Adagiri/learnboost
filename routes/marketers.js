const express = require('express');

const {
  getMarketers,
  getMarketer,
  getEarnings,
  getEarningById,
  updateMarketer,
  getWithdrawals,
  getWithdrawalById,
  editMarketer,
} = require('../controllers/marketers.js');
const { protect, protectAdmin } = require('../middlewares/auth.js');
const router = express.Router();

router.route('/').get(protect, getMarketers).put(protect, updateMarketer);
router.get('/earnings', protect, getEarnings);
router.route('/earnings/:earningId').get(protect, getEarningById);
router.get('/withdrawals', protect, getWithdrawals);
router.route('/withdrawals/:withdrawalId').get(protect, getWithdrawalById);
router.route('/:marketerId').get(protect, getMarketer).put(protectAdmin, editMarketer)

module.exports = router;
