const asyncHandler = require('../middlewares/async');
const Earning = require('../models/Earning');
const ErrorResponse = require('../utils/errorResponse');
const { getQueryArgs } = require('../utils/general');

module.exports.getEarnings = asyncHandler(async (req, res, next) => {
  const { filter, sort, skip, limit } = getQueryArgs(req.query);

  if (req.user.accountType === 'Marketer') {
    filter.marketer = req.user.id;
  }

  let earnings = await Earning.find(filter).sort(sort).skip(skip).limit(limit);

  const marketerFilter = {};

  if (req.user.accountType === 'Marketer') {
    marketerFilter.marketer = req.user.id;
  }

  const earningsCount = await Earning.countDocuments(marketerFilter);

  earnings = earnings.map((earning) => {
    earning = earning.toObject();
    earning.id = earning._id;
    return earning;
  });

  res.header('X-Total-Count', earningsCount);
  return res.status(200).json(earnings);
});

module.exports.getEarningById = asyncHandler(async (req, res, next) => {
  let earning = await Earning.findById(req.params.earningId);

  if (!earning) {
    return new ErrorResponse(
      404,
      `Earning with id: ${req.params.earningId} not found`
    );
  }

  earning = earning.toObject();
  earning.id = earning._id;

  return res.status(200).json(earning);
});
