const crypto = require('crypto');

module.exports.randomNumbers = (length) => {
  let code = '';
  while (code.length < length) {
    code += Math.floor(Math.random() * (9 - 1 + 1)) + 1;
  }

  return code;
};

module.exports.createWebhookHash = (secretKey, payload) => {
  return crypto
    .createHmac('sha512', secretKey)
    .update(JSON.stringify(payload))
    .digest('hex');
};
