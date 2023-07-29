const express = require('express');

const { initiateTransactionForSubscription } = require('../controllers/payments');
const { protectUser } = require('../middlewares/auth');
const router = express.Router();

router.get('/initiate-subscription-transaction', protectUser, initiateTransactionForSubscription);

module.exports = router;
