const asyncHandler = require('../middlewares/async');
const Admin = require('../models/Admin');
const ErrorResponse = require('../utils/errorResponse');
const { getQueryArgs, generateEncryptedPassword } = require('../utils/general');

module.exports.getAdmins = asyncHandler(async (req, res, next) => {
  const { filter, sort, skip, limit } = getQueryArgs(req.query);

  let admins = await Admin.find(filter).sort(sort).skip(skip).limit(limit);
  const adminsCount = await Admin.countDocuments();

  admins = admins.map((admin) => {
    admin = admin.toObject();
    admin.id = admin._id;
    return admin;
  });

  res.header('X-Total-Count', adminsCount);
  return res.status(200).json(admins);
});

module.exports.getAdmin = asyncHandler(async (req, res, next) => {
  let admin = await Admin.findById(req.params.adminId);
  admin = admin.toObject();
  admin.id = admin._id;
  return res.status(200).json(admin);
});

module.exports.addAdmin = asyncHandler(async (req, res, next) => {
  const existingAccount = await Admin.findOne({
    email: req.body.email,
  });

  if (existingAccount) {
    return next(new ErrorResponse(400, 'Email already taken'));
  }

  let admin = await Admin.create(req.body);

  admin = admin.toObject();
  admin.id = admin._id;
  return res.status(200).json(admin);
});

module.exports.editAdmin = asyncHandler(async (req, res, next) => {
  const args = req.body.password;

  if (args.password) {
    args.password = await generateEncryptedPassword(args.password);
  }
  let admin = await Admin.findByIdAndUpdate(req.params.adminId, args);

  admin = admin.toObject();
  admin.id = admin._id;

  return res.status(200).json(admin);
});
