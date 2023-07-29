const axios = require('axios');
const { randomNumbers } = require('../utils/misc');

module.exports.initialiseTransaction = async (
  amount,
  email,
  metadata,
  channels
) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const baseUrl = process.env.PAYSTACK_BASE_URL;

  const headers = {
    Authorization: 'Bearer ' + secretKey,
    'Content-Type': 'application/json',
  };

  const amountInKobo = amount * 100;
  const data = {
    email,
    amount: amountInKobo,
    metadata: metadata ? metadata : undefined,
    channels: channels ? channels : undefined,
    reference: randomNumbers(20).toString(),
  };

  return axios.post(baseUrl + '/transaction/initialize', data, {
    headers,
  });
};
