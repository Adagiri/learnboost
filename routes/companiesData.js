const express = require('express');

const {
  getCompanyDatas,
  getCompanyData,
  editCompanyData,
} = require('../controllers/companyDatas.js');
const {
  protect,
  authorize,
  protectAdmin,
} = require('../middlewares/auth.js');
const router = express.Router();

router.route('/').get(protect, getCompanyDatas);

router
  .route('/:companyDataId')
  .get(protectAdmin, getCompanyData)
  .put(protectAdmin, authorize('Master', 'Moderator'), editCompanyData);

module.exports = router;
