const express = require('express');

const {
  getSeries,
  addSeries,
  getSeriesById,
  editSeries,
  deleteSeries,
  getSeriesForApp,
} = require('../controllers/series.js');
const {
  protect,
  authorize,
  protectAdmin,
  protectUser,
} = require('../middlewares/auth.js');
const router = express.Router();

router
  .route('/')
  .get(protectAdmin, getSeries)
  .post(protectAdmin, authorize('Master', 'Moderator'), addSeries);

router.get('/app', protectUser, getSeriesForApp);

router
  .route('/:seriesId')
  .get(protect, getSeriesById)
  .put(protectAdmin, authorize('Master', 'Moderator'), editSeries)
  .delete(protectAdmin, authorize('Master', 'Moderator'), deleteSeries);

module.exports = router;
