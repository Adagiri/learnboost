const asyncHandler = require('../middlewares/async');

const ErrorResponse = require('../utils/errorResponse.js');
const User = require('../models/User');
const {
  sendAccountActivationEmailForUser,
  sendWelcomeEmailForUser,
  sendAccountActivationEmailForCompany,
  sendWelcomeEmailForCompany,
  sendResetPasswordEmailForCompany,
  sendResetPasswordEmailForUser,
} = require('../utils/messages');

const {
  generateVerificationCode,
  generateRandomNumbers,
  getSignedJwtToken,
  getEncryptedToken,
  confirmPassword,
  generateEncryptedPassword,
} = require('../utils/general');

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

  const { email, name } = user;

  await sendWelcomeEmailForUser({ email, name });
  const authToken = getSignedJwtToken(user);

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

  return res.status(200).json({
    success: true,
    authToken: authToken,
    user: user,
  });
});

module.exports.sendResetPasswordCode = asyncHandler(async (req, res, next) => {
  const args = req.body;
  const { accountType, email } = args;

  // validate arguments
  const model = accountType === 'company' ? Company : User;

  const user = await model.findOne({
    email: email,
    registeredWith: 'email',
    isAccountActivated: true,
  });

  if (!user) {
    return next(
      new ErrorResponse(400, {
        messageEn: 'No account with such email',
        messageGe: 'Kein Konto mit einer solchen E-Mail',
      })
    );
  }

  const { token, encryptedToken, tokenExpiry, code } = generateVerificationCode(
    20,
    10
  );

  user.resetPasswordCode = code;
  user.resetPasswordToken = encryptedToken;
  user.resetPasswordTokenExpiry = tokenExpiry;
  await user.save();

  if (accountType === 'company') {
    await sendResetPasswordEmailForCompany(email, code);
  } else {
    await sendResetPasswordEmailForUser(email, code);
  }

  // Send email
  return res.status(200).json({
    success: true,
    token: token,
  });
});

module.exports.verifyResetPasswordCode = asyncHandler(
  async (req, res, next) => {
    const args = req.body;
    const { accountType } = args;
    // validate arguments
    const model = accountType === 'company' ? Company : User;
    const encryptedToken = getEncryptedToken(args.token);

    const user = await model.findOne({
      resetPasswordToken: encryptedToken,
    });

    console.log(user);

    if (!user) {
      return next(
        new ErrorResponse(404, {
          messageEn: 'Invalid token',
          messageGe: 'Ungültiges Token',
        })
      );
    }

    if (new Date(user.resetPasswordTokenExpiry) < new Date()) {
      user.resetPasswordToken = undefined;
      user.resetPasswordCode = undefined;
      user.resetPasswordTokenExpiry = undefined;
      await user.save();
      return next(
        new ErrorResponse(400, {
          messageEn: 'Reset password session expired',
          messageGe:
            'Die Sitzung zum Zurücksetzen des Passworts ist abgelaufen',
        })
      );
    }

    if (user.resetPasswordCode !== args.code) {
      return next(
        new ErrorResponse(400, {
          messageEn: 'Incorrect code',
          messageGe: 'Falscher Code',
        })
      );
    }

    res.status(200).json({
      success: true,
      token: args.token,
    });
  }
);

module.exports.resetPassword = asyncHandler(async (req, res, next) => {
  const args = req.body;
  const { accountType } = args;
  // validate arguments
  const model = accountType === 'company' ? Company : User;
  const encryptedToken = getEncryptedToken(args.token);

  const user = await model.findOne({
    resetPasswordToken: encryptedToken,
  });

  if (!user) {
    return next(
      new ErrorResponse(404, {
        messageEn: 'Invalid token',
        messageGe: 'Ungültiges Token',
      })
    );
  }

  if (new Date(user.resetPasswordTokenExpiry) < new Date()) {
    user.resetPasswordToken = undefined;
    user.resetPasswordCode = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();
    return next(
      new ErrorResponse(400, {
        messageEn: 'Reset password session expired',
        messageGe: 'Die Sitzung zum Zurücksetzen des Passworts ist abgelaufen',
      })
    );
  }

  user.password = await generateEncryptedPassword(args.password);
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
