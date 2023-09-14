const asyncHandler = require('../middlewares/async');
const Category = require('../models/Category');
const Series = require('../models/Series');
const ErrorResponse = require('../utils/errorResponse');
const { getQueryArgs } = require('../utils/general');

module.exports.getSeriesForApp = asyncHandler(async (req, res, next) => {
  
  let series = await Series.find(req.query);

  return res.status(200).json(series);
});

module.exports.getSeries = asyncHandler(async (req, res, next) => {
  const { filter, sort, skip, limit } = getQueryArgs(req.query);

  let series = await Series.find(filter).sort(sort).skip(skip).limit(limit);
  const seriesCount = await Series.countDocuments();

  series = series.map((series) => {
    series = series.toObject();
    series.id = series._id;
    return series;
  });

  res.header('X-Total-Count', seriesCount);
  return res.status(200).json(series);
});

module.exports.getSeriesById = asyncHandler(async (req, res, next) => {
  let series = await Series.findById(req.params.seriesId);

  if (!series) {
    return next(new ErrorResponse(400, 'Invalid series id'));
  }
  series = series.toObject();
  series.id = series._id;
  return res.status(200).json(series);
});

module.exports.addSeries = asyncHandler(async (req, res, next) => {
  let series = await Series.create(req.body);

  await Category.findByIdAndUpdate(req.body.category, {
    $inc: { seriesCount: 1 },
  });

  series = series.toObject();
  series.id = series._id;
  res.status(200).json(series);
});

module.exports.editSeries = asyncHandler(async (req, res, next) => {
  let series = await Series.findByIdAndUpdate(req.params.seriesId, req.body);

  series = series.toObject();
  series.id = series._id;

  res.status(200).json(series);
});

module.exports.deleteSeries = asyncHandler(async (req, res, next) => {
  let series = await Series.findById(req.params.seriesId);

  if (series) {
    await series.remove();
  }

  res.status(200).json(series);
});
