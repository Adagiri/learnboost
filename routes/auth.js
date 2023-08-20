const express = require('express');

const {
  sendResetPasswordCode,
  verifyResetPasswordCode,
  register,
  verifyEmail,
  login,
  deleteAccount,
  resetPassword,
  loginAdmin,
  registerAdmin,
  loginMarketer,
  registerMarketer,
  verifyEmailMarketer,
} = require('../controllers/auth');
const router = express.Router();

router.post('/admin/login', loginAdmin);
router.post('/admin/register', registerAdmin);

router.post('/marketer/login', loginMarketer);
router.post('/marketer/register', registerMarketer);
router.post('/marketer/verify-email', verifyEmailMarketer);


router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/reset-password/send-code', sendResetPasswordCode);
router.post('/reset-password/verify-code', verifyResetPasswordCode);
router.post('/reset-password/set-password', resetPassword);
router.delete('/', deleteAccount);

module.exports = router;
