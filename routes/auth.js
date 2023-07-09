const express = require('express');

const {
  sendResetPasswordCode,
  verifyResetPasswordCode,
  register,
  verifyEmail,
  login,
  deleteAccount,
  resetPassword,
} = require('../controllers/auth');
const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/reset-password/send-code', sendResetPasswordCode);
router.post('/reset-password/verify-code', verifyResetPasswordCode);
router.post('/reset-password/set-password', resetPassword);
router.delete('/', deleteAccount);

module.exports = router;
