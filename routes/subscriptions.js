const express = require('express');

const {
  getSubscriptions,
  getSubscriptionById,
} = require('../controllers/subscriptions');
const { protect } = require('../middlewares/auth');
const router = express.Router();

router.get('/', protect, getSubscriptions);
router.get('/:subscriptionId', protect, getSubscriptionById);

module.exports = router;