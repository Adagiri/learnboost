const asyncHandler = require('../middlewares/async');
const Withdrawal = require('../models/Withdrawal');
const ErrorResponse = require('../utils/errorResponse');
const { getQueryArgs } = require('../utils/general');

module.exports.getWithdrawals = asyncHandler(async (req, res, next) => {
  const { filter, sort, skip, limit } = getQueryArgs(req.query);

  if (req.user.accountType === 'Marketer') {
    filter.marketer = req.user.id;
  }

  let withdrawals = await Withdrawal.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const marketerFilter = {};

  if (req.user.accountType === 'Marketer') {
    marketerFilter.marketer = req.user.id;
  }

  const withdrawalsCount = await Withdrawal.countDocuments(marketerFilter);

  withdrawals = withdrawals.map((withdrawal) => {
    withdrawal = withdrawal.toObject();
    withdrawal.id = withdrawal._id;
    return withdrawal;
  });

  res.header('X-Total-Count', withdrawalsCount);
  return res.status(200).json(withdrawals);
});

module.exports.getWithdrawalById = asyncHandler(async (req, res, next) => {
  let withdrawal = await Withdrawal.findById(req.params.withdrawalId);

  if (!withdrawal) {
    return new ErrorResponse(
      404,
      `Withdrawal with id: ${req.params.withdrawalId} not found`
    );
  }

  withdrawal = withdrawal.toObject();
  withdrawal.id = withdrawal._id;

  return res.status(200).json(withdrawal);
});
