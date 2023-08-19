const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Marketer = require('../models/Marketer');
const Admin = require('../models/Admin');

module.exports.protectAdmin = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse(401, 'Please log in to continue'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await Admin.findById(decoded.id).select(
      'name email accountType role'
    );

    if (!req.user) {
      return next(new ErrorResponse(403, 'You are not authorized'));
    }
    req.user.id = req.user._id;

    next();
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse(500, 'Network error'));
  }
});

module.exports.protectUser = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse(401, 'Please log in to continue'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id).select(
      'name email accountType role'
    );

    if (!req.user) {
      return next(new ErrorResponse(403, 'You are not authorized'));
    }
    req.user.id = req.user._id;

    next();
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse(500, 'Network error'));
  }
});

module.exports.protectMarketer = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new ErrorResponse(401, {
        messageEn: 'Please log in to continue',
        messageGe: 'bitte einloggen zum Fortfahren',
      })
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await Marketer.findById(decoded.id).select(
      'Marketer_name email accountType role registeredWith accountType'
    );
    if (!req.user) {
      return next(
        new ErrorResponse(403, {
          messageEn: 'You are not authorized',
          messageGe: 'Sie sind nicht berechtigt',
        })
      );
    }

    req.user.id = req.user._id;
    next();
  } catch (err) {
    console.log(err);
    return next(
      new ErrorResponse(500, {
        messageEn: 'Network error',
        messageGe: 'Netzwerkfehler',
      })
    );
  }
});

module.exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse(401, 'Please log in to continue'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const accountType = decoded.accountType;

    if (accountType === 'Admin') {
      req.user = await Admin.findById(decoded.id).select(
        'name email accountType role'
      );
    }

    if (accountType === 'User') {
      req.user = await User.findById(decoded.id).select(
        'name email accountType role'
      );
    }

    if (accountType === 'Marketer') {
      req.user = await Marketer.findById(decoded.id).select(
        'name email accountType role'
      );
    }

    if (!req.user) {
      return next(new ErrorResponse(401, 'Please log in to continue'));
    }

    req.user.id = req.user._id;

    next();
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse(500, 'Network error'));
  }
});

module.exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(403, `Unauthorized`));
    }
    next();
  };
};
