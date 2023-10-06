const asyncHandler = require('../middlewares/async');

const ErrorResponse = require('../utils/errorResponse.js');
const User = require('../models/User');
const {
  sendAccountActivationEmailForUser,
  sendWelcomeEmailForUser,
  sendResetPasswordEmailForUser,
  sendAccountActivationEmailForMarketer,
  sendResetPasswordEmailForMarketer,
  sendWelcomeEmailForMarketer,
} = require('../utils/messages');

const {
  generateVerificationCode,
  generateRandomNumbers,
  getSignedJwtToken,
  getEncryptedToken,
  confirmPassword,
  generateEncryptedPassword,
  generateRandomString,
} = require('../utils/general');
const Admin = require('../models/Admin');
const Marketer = require('../models/Marketer');

module.exports.register = asyncHandler(async (req, res, next) => {
  const args = req.body;
  const { name, email } = args;

  const existingAccount = await User.findOne({
    email: email,
    isAccountActivated: true,
  });

  if (existingAccount) {
    return next(new ErrorResponse(400, 'Email already taken'));
  }

  const { token, encryptedToken, tokenExpiry, code } = generateVerificationCode(
    20,
    10
  );

  args.password = await generateEncryptedPassword(args.password);
  args.accountActivationCode = code;
  args.accountActivationToken = encryptedToken;
  args.accountActivationTokenExpiry = tokenExpiry;

  await User.create(args);

  await sendAccountActivationEmailForUser({ email, name, code });

  return res.status(200).json({
    success: true,
    token,
  });
});

module.exports.resendEmail = asyncHandler(async (req, res, next) => {
  const args = req.body;
  const { name, email } = args;

  const existingAccount = await User.findOne({
    email: email,
    isAccountActivated: true,
  });

  if (existingAccount) {
    return next(new ErrorResponse(400, 'Email already taken'));
  }

  const { token, encryptedToken, tokenExpiry, code } = generateVerificationCode(
    20,
    10
  );

  args.password = await generateEncryptedPassword(args.password);
  args.accountActivationCode = code;
  args.accountActivationToken = encryptedToken;
  args.accountActivationTokenExpiry = tokenExpiry;

  await User.create(args);

  await sendAccountActivationEmailForUser({ email, name, code });

  return res.status(200).json({
    success: true,
    token,
  });
});

module.exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const args = req.body;

  const encryptedToken = getEncryptedToken(args.token);

  const user = await User.findOne({
    accountActivationToken: encryptedToken,
    isAccountActivated: false,
  });

  if (!user) {
    return next(new ErrorResponse(404, 'Invalid token'));
  }

  if (new Date(user.accountActivationTokenExpiry) < new Date()) {
    user.accountActivationToken = undefined;
    user.accountActivationCode = undefined;
    user.accountActivationTokenExpiry = undefined;
    await user.save();
    return next(new ErrorResponse(400, 'Registration session expired'));
  }

  if (user.accountActivationCode !== args.code) {
    return next(new ErrorResponse(400, 'Incorrect code'));
  }

  user.isAccountActivated = true;
  user.accountActivationToken = undefined;
  user.accountActivationCode = undefined;
  user.accountActivationTokenExpiry = undefined;
  await user.save();

  // Increase signup count for marketer
  await Marketer.findOneAndUpdate(
    { referralCode: user.referralCode },
    { $inc: { referralSignupsCount: 1 } }
  );

  const { email, name } = user;

  await sendWelcomeEmailForUser({ email, name });
  const authToken = getSignedJwtToken(user);

  await User.deleteMany({ email: email, isAccountActivated: false });

  res.status(200).json({
    success: true,
    authToken: authToken,
    user: user,
  });
});

module.exports.login = asyncHandler(async (req, res, next) => {
  const args = req.body;

  let user = await User.findOne({
    email: args.email,
    isAccountActivated: true,
  }).select('+password');

  if (!user) {
    return next(new ErrorResponse(400, 'Invalid credentials'));
  }

  const isPasswordMatch = await confirmPassword(user.password, args.password);

  if (!isPasswordMatch) {
    return next(new ErrorResponse(400, 'Invalid credentials'));
  }

  const authToken = getSignedJwtToken(user);

  user = user.toObject();
  delete user.password;

  return res.status(200).json({
    success: true,
    authToken: authToken,
    user: user,
  });
});

module.exports.sendResetPasswordCode = asyncHandler(async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({
    email: email,
    isAccountActivated: true,
  });

  if (!user) {
    return next(new ErrorResponse(400, 'No account with such email'));
  }

  const { token, encryptedToken, tokenExpiry, code } = generateVerificationCode(
    20,
    10
  );

  user.resetPasswordCode = code;
  user.resetPasswordToken = encryptedToken;
  user.resetPasswordTokenExpiry = tokenExpiry;
  await user.save();

  await sendResetPasswordEmailForUser(email, code);

  // Send email
  return res.status(200).json({
    success: true,
    token: token,
  });
});

module.exports.verifyResetPasswordCode = asyncHandler(
  async (req, res, next) => {
    const token = req.body.token;
    // validate arguments
    const encryptedToken = getEncryptedToken(token);

    const user = await User.findOne({
      resetPasswordToken: encryptedToken,
    });

    if (!user) {
      return next(new ErrorResponse(404, 'Invalid token'));
    }

    if (new Date(user.resetPasswordTokenExpiry) < new Date()) {
      user.resetPasswordToken = undefined;
      user.resetPasswordCode = undefined;
      user.resetPasswordTokenExpiry = undefined;
      await user.save();
      return next(new ErrorResponse(400, 'Reset password session expired'));
    }

    if (user.resetPasswordCode !== req.body.code) {
      return next(new ErrorResponse(400, 'Incorrect code'));
    }

    res.status(200).json({
      success: true,
      token: token,
    });
  }
);

module.exports.resetPassword = asyncHandler(async (req, res, next) => {
  // validate arguments
  const encryptedToken = getEncryptedToken(req.body.token);

  const user = await User.findOne({
    resetPasswordToken: encryptedToken,
  });

  if (!user) {
    return next(new ErrorResponse(404, 'Invalid token'));
  }

  if (new Date(user.resetPasswordTokenExpiry) < new Date()) {
    user.resetPasswordToken = undefined;
    user.resetPasswordCode = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();
    return next(new ErrorResponse(400, 'Reset password session expired'));
  }

  user.password = await generateEncryptedPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordCode = undefined;
  user.resetPasswordTokenExpiry = undefined;

  await user.save();

  res.status(200).json({
    success: true,
  });
});

module.exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const args = req.body;
  const { accountType, email } = args;

  // validate arguments
  const model = accountType === 'company' ? Company : User;

  const user = await model.findOne({ email: email });
  if (!user) {
    return next(
      new ErrorResponse(400, {
        messageEn: 'User not found',
        messageGe: 'Benutzer nicht gefunden',
      })
    );
  }

  await model.findByIdAndRemove(user._id);

  if (accountType === 'company') {
    return res.status(200).json({
      success: true,
      company: user,
    });
  } else {
    return res.status(200).json({
      success: true,
      user: user,
    });
  }
});

module.exports.registerAdmin = asyncHandler(async (req, res, next) => {
  const args = req.body;

  const existingAccount = await Admin.findOne({
    email: args.email,
  });

  if (existingAccount) {
    return next(new ErrorResponse(400, 'Email already taken'));
  }

  args.password = await generateEncryptedPassword(args.password);

  await Admin.create(args);

  return res.status(200).json({
    success: true,
  });
});

module.exports.loginAdmin = asyncHandler(async (req, res, next) => {
  const args = req.body;

  let admin = await Admin.findOne({
    email: args.email,
  }).select('+password');

  if (!admin) {
    return next(new ErrorResponse(400, 'Invalid credentials'));
  }

  const isPasswordMatch = await confirmPassword(admin.password, args.password);

  if (!isPasswordMatch) {
    return next(new ErrorResponse(400, 'Invalid credentials'));
  }

  const token = getSignedJwtToken(admin);

  const options = {
    // Expires in 24 hours
    expires: new Date(Date.now() + 3600 * 24 * 1000),
    httpOnly: true,
    secure: true,
    path: '/',
  };

  admin = admin.toObject();
  delete admin.password;

  res.cookie('token', token, options);

  return res.status(200).json({
    success: true,
    token: token,
    user: admin,
  });
});

module.exports.registerMarketer = asyncHandler(async (req, res, next) => {
  const args = req.body;
  const { name, email } = args;

  const existingAccount = await Marketer.findOne({
    email: email,
    isEmailVerified: true,
  });

  if (existingAccount) {
    return next(new ErrorResponse(400, 'Email already taken'));
  }

  const { token, encryptedToken, tokenExpiry } = generateVerificationCode(
    20,
    10
  );
  args.password = await generateEncryptedPassword(args.password);
  args.accountActivationToken = encryptedToken;
  args.accountActivationTokenExpiry = tokenExpiry;
  args.referralCode = generateRandomString(7);

  await Marketer.create(args);

  await sendAccountActivationEmailForMarketer({ email, token });

  return res.status(200).json({
    success: true,
    token,
  });
});

module.exports.verifyEmailForMarketer = asyncHandler(async (req, res, next) => {
  const args = req.body;

  const encryptedToken = getEncryptedToken(args.token);

  const marketer = await Marketer.findOne({
    accountActivationToken: encryptedToken,
    isEmailVerified: false,
  });

  if (!marketer) {
    return next(new ErrorResponse(404, 'Invalid token'));
  }

  if (new Date(marketer.accountActivationTokenExpiry) < new Date()) {
    marketer.accountActivationToken = undefined;
    marketer.accountActivationTokenExpiry = undefined;
    await marketer.save();
    return next(new ErrorResponse(400, 'Registration session expired'));
  }

  marketer.isEmailVerified = true;
  marketer.accountActivationToken = undefined;
  marketer.accountActivationTokenExpiry = undefined;
  await marketer.save();

  const { email, name } = marketer;

  await sendWelcomeEmailForMarketer({ email, name });
  const authToken = getSignedJwtToken(marketer);

  await Marketer.deleteMany({ email: email, isEmailVerified: false });

  res.status(200).json({
    success: true,
    authToken: authToken,
    marketer: marketer,
  });
});

module.exports.loginMarketer = asyncHandler(async (req, res, next) => {
  const args = req.body;

  let marketer = await Marketer.findOne({
    email: args.email,
    isEmailVerified: true,
  }).select('+password');

  if (!marketer) {
    return next(new ErrorResponse(400, 'Invalid credentials'));
  }

  const isPasswordMatch = await confirmPassword(
    marketer.password,
    args.password
  );

  if (!isPasswordMatch) {
    return next(new ErrorResponse(400, 'Invalid credentials'));
  }

  if (!marketer.isAccountApproved) {
    return next(new ErrorResponse(403, 'Your account have not been approved'));
  }

  const authToken = getSignedJwtToken(marketer);

  marketer = marketer.toObject();
  delete marketer.password;
  return res.status(200).json({
    success: true,
    authToken: authToken,
    marketer: marketer,
  });
});

module.exports.forgotPasswordMarketer = asyncHandler(async (req, res, next) => {
  const email = req.body.email;
  const marketer = await Marketer.findOne({
    email: email,
    isEmailVerified: true,
    isAccountApproved: true,
  });

  if (!marketer) {
    return next(new ErrorResponse(400, 'No account with such email'));
  }

  const { token, encryptedToken, tokenExpiry } = generateVerificationCode(
    20,
    10
  );

  marketer.resetPasswordToken = encryptedToken;
  marketer.resetPasswordTokenExpiry = tokenExpiry;
  await marketer.save();

  await sendResetPasswordEmailForMarketer(email, token);

  // Send email
  return res.status(200).json({
    success: true,
  });
});

module.exports.resetPasswordMarketer = asyncHandler(async (req, res, next) => {
  const args = req.body;
  // validate arguments

  const encryptedToken = getEncryptedToken(args.token);

  const marketer = await Marketer.findOne({
    resetPasswordToken: encryptedToken,
  });

  if (!marketer) {
    return next(new ErrorResponse(404, 'Invalid token'));
  }

  if (new Date(marketer.resetPasswordTokenExpiry) < new Date()) {
    marketer.resetPasswordToken = undefined;
    marketer.resetPasswordCode = undefined;
    marketer.resetPasswordTokenExpiry = undefined;
    await marketer.save();
    return next(new ErrorResponse(400, 'Reset password session expired'));
  }

  marketer.password = await generateEncryptedPassword(args.password);
  marketer.resetPasswordToken = undefined;
  marketer.resetPasswordTokenExpiry = undefined;

  await marketer.save();

  return res.status(200).json({
    success: true,
  });
});
