const express = require('express');

const {
  initiateTransactionForSubscription,
  withdrawEarning,
  getBanks,
  getAccountDetail,
} = require('../controllers/payments');
const {
  protectUser,
  protectMarketer,
  protect,
} = require('../middlewares/auth');
const router = express.Router();

router.get(
  '/initiate-subscription-transaction',
  protectUser,
  initiateTransactionForSubscription
);

router.post('/withdraw', protectMarketer, withdrawEarning);
router.get('/banks', protect, getBanks);
router.get('/account-detail', protect, getAccountDetail);

module.exports = router;
