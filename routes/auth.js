const express = require('express');

const {
  sendResetPasswordCode,
  verifyResetPasswordCode,
  register,
  verifyEmail,
  login,
  resendEmail,
  deleteAccount,
  resetPassword,
  loginAdmin,
  registerAdmin,
  loginMarketer,
  registerMarketer,
  verifyEmailForMarketer,
  forgotPasswordMarketer,
  resetPasswordMarketer,
} = require('../controllers/auth');
const router = express.Router();

router.post('/admin/login', loginAdmin);
router.post('/admin/register', registerAdmin);

router.post('/marketers/login', loginMarketer);
router.post('/marketers/register', registerMarketer);
router.post('/marketers/verify-email', verifyEmailForMarketer);
router.post('/marketers/forgot-password', forgotPasswordMarketer);
router.post('/marketers/reset-password', resetPasswordMarketer);

router.post('/register', register);
router.post('/resend-email', resendEmail);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/reset-password/send-code', sendResetPasswordCode);
router.post('/reset-password/verify-code', verifyResetPasswordCode);
router.post('/reset-password/set-password', resetPassword);
router.delete('/', deleteAccount);

module.exports = router;
