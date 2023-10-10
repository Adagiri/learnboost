const express = require('express');

const {
  getAdmins,
  addAdmin,
  getAdmin,
  editAdmin,
} = require('../controllers/admins.js');
const { protect, authorize, protectAdmin } = require('../middlewares/auth.js');
const { registerAdmin } = require('../controllers/auth.js');
const router = express.Router();

router
  .route('/')
  .get(protectAdmin, authorize('Master'), getAdmins)
  .post(protectAdmin, authorize('Master'), registerAdmin);

router
  .route('/:adminId')
  .get(protectAdmin, getAdmin)
  .put(protectAdmin, authorize('Master'), editAdmin);

module.exports = router;
