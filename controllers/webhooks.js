const mongoose = require('mongoose');
const { addMonths, addYears } = require('date-fns');
const User = require('../models/User');
const Marketer = require('../models/Marketer');
const CompanyData = require('../models/CompanyData');
const SubscriptionTransaction = require('../models/SubscriptionTransaction');
const MarketingEarningsRecord = require('../models/MarketingEarningsRecord');

module.exports.processSubscriptionTransactionWebhook = async ({
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

    // Update user data with subscription information
    user.latestSubscriptionType = subscriptionType;
    user.subscriptionStartDate = currentDate;
    user.subscriptionEndDate =
      subscriptionType === '6_months'
        ? addMonths(currentDate, 6)
        : addYears(currentDate, 1);

    // Create a new subscription transaction ID
    const subscriptionTransactionId = new mongoose.Types.ObjectId();
    const subscriptionTransactionArgs = {
      _id: subscriptionTransactionId,
      paymentMethod: channel === 'bank_transfer' ? BANK_TRANSFER : CARD,
      reference: reference,
      user: userId,
    };

    if (channel === 'bank_transfer') {
      subscriptionTransactionArgs.bankAccountDetails = {
        accountName: authorization.sender_bank,
        accountNumber: authorization.sender_bank_account_number,
        accountName: authorization.sender_name,
      };
    }

    // Check if the user has a referral code
    const referralCode = user.referralCode;
    let marketer = null;
    let earningPercentage = null;
    let marketingEarningRecordArgs = null;

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

      // Create marketing earning record arguments
      marketingEarningRecordArgs = {
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
        await MarketingEarningsRecord.create([marketingEarningRecordArgs], {
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
