const express = require('express');

const {
  getSeries,
  addSeries,
  getSeriesById,
  editSeries,
} = require('../controllers/series.js');
const { protect, authorize, protectAdmin } = require('../middlewares/auth.js');
const router = express.Router();

router
  .route('/')
  .get(getSeries)
  .post(protectAdmin, authorize('Master', 'Moderator'), addSeries);

router
  .route('/:seriesId')
  .get(protect, getSeriesById)
  .put(protectAdmin, authorize('Master', 'Moderator'), editSeries);

module.exports = router;
