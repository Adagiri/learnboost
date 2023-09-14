const asyncHandler = require('../middlewares/async');
const Marketer = require('../models/Marketer');
const { getQueryArgs } = require('../utils/general');

module.exports.getMarketers = asyncHandler(async (req, res, next) => {
  const { filter, sort, skip, limit } = getQueryArgs(req.query);

  filter.isAccountActivated = true;
  let marketers = await Marketer.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
  const marketersCount = await Marketer.countDocuments();

  marketers = marketers.map((marketer) => {
    marketer = marketer.toObject();
    marketer.id = marketer._id;
    return marketer;
  });

  res.header('X-Total-Count', marketersCount);
  return res.status(200).json(marketers);
});

module.exports.getMarketer = asyncHandler(async (req, res, next) => {
  let marketer = await Marketer.findById(req.params.marketerId);
  marketer = marketer.toObject();
  marketer.id = marketer._id;
  return res.status(200).json(marketer);
});
