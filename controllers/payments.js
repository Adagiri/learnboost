const asyncHandler = require('../middlewares/async');
const User = require('../models/User');
const { initialiseTransaction } = require('../services/PaystackService');
const ErrorResponse = require('../utils/errorResponse');

module.exports.initiateTransactionForSubscription = asyncHandler(
  async (req, res, next) => {
    const user = await User.findById(req.user.id);
    const currentDate = new Date();

    console.log(user);
    // if (
    //   user.subscriptionEndDate &&
    //   new Date(user.subscriptionEndDate) > currentDate
    // ) {
    //   return next(
    //     new ErrorResponse(
    //       400,
    //       'You still have an active subscription. Please wait till your subscription expires.'
    //     )
    //   );
    // }

    console.log('ran');
    const subscriptionType = req.query.sub_type;
    const amount = subscriptionType === '6_months' ? 1250 : 5250;
    const email = req.user.email;
    const channels = ['card', 'bank_transfer'];

    const metadata = {
      amount: amount,
      userId: req.user.id,
      subscriptionType: subscriptionType,
      purpose: 'Subscribe',
    };

    try {
      const response = await initialiseTransaction(
        amount,
        email,
        metadata,
        channels
      );

      const data = response.data.data;

      return res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  }
);
