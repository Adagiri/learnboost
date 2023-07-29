const asyncHandler = require('../middlewares/async');
const { initialiseTransaction } = require('../services/PaystackService');

module.exports.initiateTransactionForSubscription = asyncHandler(
  async (req, res, next) => {
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
