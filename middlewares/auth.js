const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Marketer = require('../models/Marketer');

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
    req.user = await User.findById(decoded.id).select('name email');

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
      'Marketer_name email registeredWith accountType'
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
