const mongoose = require('mongoose');
const { addMonths, addYears } = require('date-fns');
const User = require('../models/User');
const Marketer = require('../models/Marketer');
const CompanyData = require('../models/CompanyData');
const SubscriptionTransaction = require('../models/SubscriptionTransaction');
const Earning = require('../models/Earning');
const PendingWithdrawal = require('../models/PendingWithdrawal');
const Withdrawal = require('../models/Withdrawal');

module.exports.processSubscriptionTransaction = async ({
  metadata,
  channel,
  reference,
  transactionAmount,
  authorization,
}) => {
  // Start a Mongoose session to handle transactions
  const session = await mongoose.startSession();

  const BANK_TRANSFER = 'Transfer';
  const CARD = 'Card';
  try {
    // Extract user ID from metadata
    const userId = metadata.userId;

    // Find the user by their ID
    const user = await User.findById(userId);

    // If the user is not found, throw an error
    if (!user) {
      throw new Error(`User with id of ${userId} not found`);
    }

    // Get the current date
    const currentDate = new Date();
    const subscriptionType = metadata.subscriptionType;
    const firstTimeSubscribing = user.latestSubscriptionType === 'none';

    // Update user data with subscription information
    user.latestSubscriptionType = subscriptionType;
    user.subscriptionStartDate = currentDate;
    user.subscriptionEndDate =
      subscriptionType === '6_months'
        ? addMonths(currentDate, 6)
        : subscriptionType === '3_months'
        ? addMonths(currentDate, 3)
        : addYears(currentDate, 1);

    // Create a new subscription transaction ID
    const subscriptionTransactionId = new mongoose.Types.ObjectId();
    const subscriptionTransactionArgs = {
      _id: subscriptionTransactionId,
      amount: transactionAmount,
      paymentMethod: channel === 'bank_transfer' ? BANK_TRANSFER : CARD,
      reference: reference,
      user: userId,
    };

    if (channel === 'bank_transfer') {
      subscriptionTransactionArgs.bankAccountDetails = {
        account_name: authorization.sender_bank,
        account_number: authorization.sender_bank_account_number,
        account_name: authorization.sender_name,
      };
    }

    // Check if the user has a referral code
    const referralCode = user.referralCode;
    let marketer = null;
    let earningPercentage = null;
    let earningRecordArgs = null;

    if (user.referralCode) {
      // Find the marketer based on the referral code
      marketer = await Marketer.findOne({ referralCode: referralCode });
    }

    if (marketer) {
      // Retrieve company data
      let companyData = await CompanyData.findOne();
      earningPercentage = companyData.marketingEarningPercentage;

      // Calculate marketing earnings based on the percentage and transaction amount
      let marketingAmountEarned = (earningPercentage / 100) * transactionAmount;

      // Update the wallet balance of the marketer who owns the referral code
      marketer.walletBalance = marketer.walletBalance + marketingAmountEarned;
      marketer.totalEarnings = marketer.totalEarnings + marketingAmountEarned;

      if (firstTimeSubscribing) {
        marketer.referralSubscriptionCounts =
          marketer.referralSubscriptionCounts + 1;
      }

      // Create marketing earning record arguments
      earningRecordArgs = {
        user: userId,
        marketer: marketer._id,
        subscriptionTransaction: subscriptionTransactionId,
        earningPercentage: earningPercentage,
        amountEarned: marketingAmountEarned,
      };
    }

    // Use a Mongoose session to ensure transactional integrity
    await session.withTransaction(async () => {
      // Update user data
      await user.save({ session });

      // Create the subscription transaction
      await SubscriptionTransaction.create([subscriptionTransactionArgs], {
        session,
      });

      if (marketer) {
        // Update marketer data
        await marketer.save({ session });

        // Create Marketing Earning Record
        await Earning.create([earningRecordArgs], {
          session,
        });
      }
    });
  } catch (error) {
    // Log and rethrow any errors
    console.log(
      error,
      'Error occurred while processing subscription transaction webhook'
    );

    throw error;
  } finally {
    // End the Mongoose session
    session.endSession();
  }
};

module.exports.processDisbursement = async ({
  metadata,
  reference,
  transactionAmount,
  transactionDate,
  accountDetails,
}) => {
  // Start a Mongoose session to handle transactions
  const session = await mongoose.startSession();

  try {
    const marketerId = metadata.marketerId;
    const marketer = await Marketer.findById(marketerId);

    // Use a Mongoose session to ensure transactional integrity
    await session.withTransaction(async () => {
      // deduct walletBalance from marketer
      marketer.walletBalance = 0;
      await marketer.save({ session });

      // change earning statuses to "withdrawn"
      await Earning.updateMany(
        { marketer: marketerId },
        { status: 'withdrawn' },
        { session }
      );

      // delete pending withdrawals
      await PendingWithdrawal.deleteMany({ marketer: marketerId }, { session });

      // save withdrawal transactions
      const withdrawalTransaction = new Withdrawal({
        marketer: marketerId,
        amount: transactionAmount,
        reference: reference,
        paymentHandler: 'Paystack',
        accountDetails: accountDetails,
        transactionDate: transactionDate,
      });
      await withdrawalTransaction.save({ session });
    });
  } catch (error) {
    // Log and rethrow any errors
    console.log(
      error,
      'Error occurred while processing disbursement transaction webhook'
    );

    throw error;
  } finally {
    // End the Mongoose session
    session.endSession();
  }
};
