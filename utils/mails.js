const { messaging } = require('firebase-admin');
const { default: axios } = require('axios');

const createEmailParam = (from, to, subject, message) => {
  const emails = typeof to === 'string' ? [to] : to;
  var payload = {};

  payload.sender = {
    name: 'Learnboost',
    email: 'hello@learnboost.com.ng',
  };

  payload.replyTo = {
    name: 'Learnboost',
    email: 'no-reply@learnboost.com.ng',
  };

  payload.subject = subject;
  payload.htmlContent = message;

  payload.messageVersions = emails.map((email) => {
    return {
      to: [
        {
          email: email,
        },
      ],
      htmlContent: message,
      subject: subject,
    };
  });

  return payload;
};

const sendEmail = async (payload) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  const headers = {
    'api-key': BREVO_API_KEY,
    'content-type': 'application/json',
    accept: 'application/json',
  };

  try {
    const resp = await axios.post(`https://api.brevo.com/v3/smtp/email`, payload, {
      headers,
    });

    console.log(resp, 'resp')
  } catch (error) {
    console.log(error, 'error occured whilst sending email with brevo');
    throw error;
  }
};

module.exports = {
  sendEmail,
  createEmailParam,
};
