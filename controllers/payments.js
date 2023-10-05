const asyncHandler = require('../middlewares/async');
const Marketer = require('../models/Marketer');
const User = require('../models/User');
const { initialiseTransaction } = require('../services/PaystackService');
const ErrorResponse = require('../utils/errorResponse');
const PaystackService = require('../services/PaystackService');
const PendingWithdrawal = require('../models/PendingWithdrawal');
const {
  THREE_MONTHS_PRICE,
  SIX_MONTHS_PRICE,
  ONE_YEAR_PRICE,
} = require('../utils/constants');

module.exports.initiateTransactionForSubscription = asyncHandler(
  async (req, res, next) => {
    const user = await User.findById(req.user.id);
    const currentDate = new Date();

    console.log(user);
    if (
      user.subscriptionEndDate &&
      new Date(user.subscriptionEndDate) > currentDate
    ) {
      return next(
        new ErrorResponse(
          400,
          'You still have an active subscription. Please wait till your subscription expires.'
        )
      );
    }

    console.log('ran');

    const subscriptionType = req.query.sub_type;
    const amount =
      subscriptionType === '6_months'
        ? SIX_MONTHS_PRICE
        : subscriptionType === '3_months'
        ? THREE_MONTHS_PRICE
        : ONE_YEAR_PRICE;
    const email = req.user.email;
    const channels = ['card', 'bank_transfer'];

    const metadata = {
      amount: amount,
      userId: req.user.id,
      subscriptionType: subscriptionType,
      purpose: 'Subscribe',
    };

    try {
      const data = await initialiseTransaction(
        amount,
        email,
        metadata,
        channels
      );

      return res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

module.exports.withdrawEarning = asyncHandler(async (req, res, next) => {
  const marketer = await Marketer.findById(req.user.id);

  const existingTransaction = await PendingWithdrawal.findOne({
    marketer: marketer._id,
  });

  if (existingTransaction) {
    return next(
      new ErrorResponse(
        404,
        'You have a pending withdrawal request. Please try again later.'
      )
    );
  }

  const account_number = req.body.account_number;
  const bank_code = req.body.bank_code;
  const name = marketer.name;
  const metadata = {
    marketerId: marketer._id,
    marketerName: name,
    marketerEmail: marketer.email,
  };

  const recipient = await PaystackService.createTransferRecipient(
    name,
    account_number,
    bank_code,
    metadata
  );

  console.log(recipient);

  // Make transfer
  const reason = 'Marketer_Withdraw_Earnings';
  const amount = marketer.walletBalance;
  const reference = await PaystackService.disburseSingle(
    amount,
    reason,
    recipient
  );
  await PendingWithdrawal({ marketer: marketer._id, reference });

  return res.status(200).json({ success: true, marketer: marketer });
});

module.exports.getBanks = asyncHandler(async (req, res, next) => {
  let banks = await PaystackService.getBanks();

  banks = banks.map((bank) => {
    return {
      name: bank.name,
      code: bank.code,
    };
  });
  return res.status(200).json({ banks });
});

module.exports.getAccountDetail = asyncHandler(async (req, res, next) => {
  let accountDetail = await PaystackService.getAccountDetail({
    account_number: req.query.account_number,
    bank_code: req.query.bank_code,
  });

  return res.status(200).json({ accountDetail });
});
