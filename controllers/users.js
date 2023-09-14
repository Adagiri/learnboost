const asyncHandler = require('../middlewares/async');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { getQueryArgs } = require('../utils/general');

module.exports.getUsers = asyncHandler(async (req, res, next) => {
  const { filter, sort, skip, limit } = getQueryArgs(req.query);

  filter.isAccountActivated = true;
  let users = await User.find(filter).sort(sort).skip(skip).limit(limit);
  const usersCount = await User.countDocuments();

  users = users.map((user) => {
    user = user.toObject();
    user.id = user._id;
    return user;
  });

  res.header('X-Total-Count', usersCount);
  return res.status(200).json(users);
});

module.exports.getUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.userId);

  user = user.toObject();
  user.id = user._id;
  return res.status(200).json(user);
});

module.exports.getLoggedInUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.user.id);

  user = user.toObject();
  return res.status(200).json(user);
});

module.exports.updateUser = asyncHandler(async (req, res, next) => {
  if (req.body.email) {
    return next(new ErrorResponse(400, 'You cannot update your Email'));
  }

  let user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });

  user = user.toObject();
  return res.status(200).json(user);
});
