const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

module.exports.generateRandomNumbers = (length) => {
  let code = '';
  while (code.length < length) {
    code += Math.floor(Math.random() * (9 - 1 + 1)) + 1;
  }

  return code;
};

module.exports.generateRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

const getLimit = (_start, _end) => {
  const start = Math.abs(parseInt(_start, 10)) || 0;
  const end = Math.abs(parseInt(_end, 10)) || 10;

  if (start === 0) {
    return end;
  } else {
    return end - start - 1;
  }
};

const getSkip = (start) => {
  const skip = Math.abs(parseInt(start, 10)) || 0;

  if (skip === 0) {
    return 0;
  } else {
    return skip - 1;
  }
};

module.exports.getQueryArgs = (args) => {
  const filter = args || {};
  // Transform the query if the property 'id' was added
  if (filter.id) {
    console.log(typeof filter.id);
    filter._id = Array.isArray(filter.id)
      ? filter.id.map((_id) => mongoose.Types.ObjectId(_id))
      : mongoose.Types.ObjectId(filter.id);

    delete filter.id;
  }
  // Transform the query if the property 'ids' was added
  if (filter.ids) {
    filter._id = { $in: filter.ids.map((id) => mongoose.Types.ObjectId(id)) };
    delete filter.ids;
  }

  // Make sure deleted documents are not selected
  filter.deleted = { $ne: true };

  // Set pagination fields
  const limit = getLimit(args._start, args._end);
  const skip = getSkip(args._start);

  // Transform sort field
  const sort = {};
  if (args._sort) {
    if (args._sort === 'id') {
      sort['_id'] = args._order === 'ASC' ? 1 : -1;
    } else {
      sort[args._sort] = args._order === 'ASC' ? 1 : -1;
    }
  } else {
    sort.createdAt = -1;
  }

  return { filter, skip, limit, sort };
};

module.exports.confirmPassword = async function (
  originalPassword,
  inputedPassword
) {
  return bcrypt.compare(inputedPassword, originalPassword);
};

module.exports.getSignedJwtToken = function (user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      accountType: user.accountType,
      role: user.role,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRY_TIME,
    }
  );
};

module.exports.generateVerificationCode = (bytes, expiryInMins) => {
  const token = crypto.randomBytes(bytes).toString('hex');

  const tokenExpiry = expiryInMins
    ? new Date(Date.now() + expiryInMins * 60 * 1000)
    : null;

  const encryptedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const code = this.generateRandomNumbers(4);

  return { token, encryptedToken, tokenExpiry, code };
};

module.exports.getEncryptedToken = (token) => {
  const encryptedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  return encryptedToken;
};

module.exports.generateEncryptedPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  const encryptedPassword = await bcrypt.hash(password, salt);

  return encryptedPassword;
};
