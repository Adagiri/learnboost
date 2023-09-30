const asyncHandler = require('../middlewares/async');
const Marketer = require('../models/Marketer');
const Withdrawal = require('../models/Withdrawal');
const Earning = require('../models/Earning');
const ErrorResponse = require('../utils/errorResponse');
const { getQueryArgs } = require('../utils/general');

module.exports.getMarketers = asyncHandler(async (req, res, next) => {
  const { filter, sort, skip, limit } = getQueryArgs(req.query);

  filter.isEmailVerified = true;
  !filter.approvalStatus && (filter.approvalStatus = { $ne: 'rejected' });

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

module.exports.updateMarketer = asyncHandler(async (req, res, next) => {
  delete req.body.password;

  let marketer = await Marketer.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
  });

  marketer = marketer.toObject();
  marketer.id = marketer._id;
  return res.status(200).json(marketer);
});

module.exports.editMarketer = asyncHandler(async (req, res, next) => {
  delete req.body.password;

  if (req.body.approvalStatus === 'approved') {
    req.body.isAccountApproved = true;
  }

  let marketer = await Marketer.findByIdAndUpdate(
    req.params.marketerId,
    req.body,
    {
      new: true,
    }
  );

  marketer = marketer.toObject();
  marketer.id = marketer._id;
  return res.status(200).json(marketer);
});
