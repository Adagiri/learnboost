const asyncHandler = require('../middlewares/async');
const Category = require('../models/Category');
const Series = require('../models/Series');

module.exports.getSeries = asyncHandler(async (req, res, next) => {
  let series = await Series.find().select('-_id -__v');

  res.header('X-Total-Count', series.length);
  res.status(200).json(series);
});

module.exports.getSeriesById = asyncHandler(async (req, res, next) => {
  let series = await Series.findById(req.params.seriesId);

  series.id = series._id;
  res.status(200).json(series);
});

module.exports.addSeries = asyncHandler(async (req, res, next) => {
  const series = await Series.create(req.body);

  await Category.findByIdAndUpdate(req.body.category, {
    $inc: { seriesCount: 1 },
  });

  series.id = series._id;
  res.status(200).json(series);
});

module.exports.editSeries = asyncHandler(async (req, res, next) => {
  const series = await Series.findByIdAndUpdate(req.params.seriesId, req.body);

  series.id = series._id;

  res.status(200).json(series);
});
