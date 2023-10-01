const { startOfWeek, startOfMonth } = require('date-fns');
const asyncHandler = require('../middlewares/async');
const Marketer = require('../models/Marketer');
const Lesson = require('../models/Lesson');
const SubLesson = require('../models/SubLesson');
const Series = require('../models/Series');
const User = require('../models/User');
const { getS3SignedUrl } = require('../utils/fileUploads');
const PaystackService = require('../services/PaystackService');
const SubscriptionTransaction = require('../models/SubscriptionTransaction');

module.exports.getSignedUrl = asyncHandler(async (req, res, next) => {
  const { contentType, key } = req.query;

  const signedUrl = getS3SignedUrl(key, contentType);
  let src = `https://${process.env.S3_FILEUPLOAD_BUCKET}.s3.amazonaws.com/${key}`;

  return res.status(200).json({ src, signedUrl });
});

module.exports.getDashboardData = asyncHandler(async (req, res, next) => {
  const currentDate = new Date();
  const beginningOfTheWeek = startOfWeek(currentDate);
  const beginningOfTheMonth = startOfMonth(currentDate);
  const usersCount = await User.countDocuments({ isAccountActivated: true });
  const marketersCount = await Marketer.countDocuments({
    isEmailVerified: true,
  });
  const pendingMarketers = await Marketer.find({
    isEmailVerified: true,
    approvalStatus: 'pending',
  })
    .sort({ _id: -1 })
    .limit(5)
    .select('name email referralCode createdAt');

  const thisWeeksUsersCount = await User.countDocuments({
    createdAt: { $gte: beginningOfTheWeek },
    isAccountActivated: true,
  });

  const recentUsers = await User.find({ isAccountActivated: true })
    .sort({ _id: -1 })
    .limit(5)
    .select('name email createdAt');

  const marketersForPayouts = await Marketer.find({
    walletBalance: { $gt: 0 },
  });

  const liquidityNeeded = marketersForPayouts.reduce(
    (acc, prev) => prev.walletBalance + acc,
    0
  );

  const subscriptionTransactions = await SubscriptionTransaction.find({
    transactionDate: { $gte: beginningOfTheMonth },
  });

  const paymentsThisMonth = subscriptionTransactions.reduce(
    (acc, prev) => prev.amount + acc,
    0
  );

  const totalLessonsCount = await Lesson.countDocuments();
  const totalSeriesCount = await Series.countDocuments();
  const totalSubLessonsCount = await SubLesson.countDocuments();
  const walletBalance = await PaystackService.getTransferBalance();

  const data = {
    thisWeeksUsersCount,
    usersCount,
    recentUsers,
    marketersCount,
    pendingMarketers,
    liquidityNeeded,
    totalLessonsCount,
    totalSeriesCount,
    totalSubLessonsCount,
    walletBalance,
    paymentsThisMonth,
  };
  return res.status(200).json({ data });
});
