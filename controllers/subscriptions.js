const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const SubscriptionTransaction = require('../models/SubscriptionTransaction');
const { getQueryArgs } = require('../utils/general');

module.exports.getSubscriptions = asyncHandler(async (req, res, next) => {
  const { filter, sort, skip, limit } = getQueryArgs(req.query);

  if (req.user.accountType === 'User') {
    filter.user = req.user.id;
  }

  let subscriptions = await SubscriptionTransaction.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const userFilter = {};

  if (req.user.accountType === 'User') {
    userFilter.user = req.user.id;
  }

  const subscriptionsCount = await SubscriptionTransaction.countDocuments(
    userFilter
  );

  subscriptions = subscriptions.map((subscription) => {
    subscription = subscription.toObject();
    subscription.id = subscription._id;
    return subscription;
  });

  res.header('X-Total-Count', subscriptionsCount);
  return res.status(200).json(subscriptions);
});

module.exports.getSubscriptionById = asyncHandler(async (req, res, next) => {
  let subscription = await SubscriptionTransaction.findById(
    req.params.subscriptionId
  );

  if (!subscription) {
    return new ErrorResponse(
      404,
      `Subscription with id: ${req.params.subscriptionId} not found`
    );
  }

  subscription = subscription.toObject();
  subscription.id = subscription._id;

  return res.status(200).json(subscription);
});
