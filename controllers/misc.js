const { startOfWeek } = require('date-fns');
const asyncHandler = require('../middlewares/async');
const Marketer = require('../models/Marketer');
const User = require('../models/User');
const { getS3SignedUrl } = require('../utils/fileUploads');

module.exports.getSignedUrl = asyncHandler(async (req, res, next) => {
  const { contentType, key } = req.query;

  const signedUrl = getS3SignedUrl(key, contentType);
  let src = `https://${process.env.S3_FILEUPLOAD_BUCKET}.s3.amazonaws.com/${key}`;

  return res.status(200).json({ src, signedUrl });
});

module.exports.getDashboardData = asyncHandler(async (req, res, next) => {
  const currentDate = new Date();
  const beginningOfTheWeek = startOfWeek(currentDate);
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
    .select('name email referralCode');

  const thisWeeksUsersCount = await User.countDocuments({
    createdAt: { $gte: beginningOfTheWeek },
  });

  const latestUsers = await User.find()
    .sort({ _id: -1 })
    .limit(5)
    .select('name email');

  // Amount needed for payout
  // Total lessons (count)
  // Total series (count)
  // Total sublessons (count)
  // Paystack balance

  const data = {
    thisWeeksUsersCount,
    usersCount,
    latestUsers,
    marketersCount,
    pendingMarketers,
  };
  return res.status(200).json({ data });
});
