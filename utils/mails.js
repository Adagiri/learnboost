const AWS = require('aws-sdk');

const createEmailParam = (from, to, subject, message) => {
  if (!from) {
    from = `Learnboost <hello@learnboost.com.ng>`;
  }

  return {
    Destination: {
      ToAddresses: typeof to === 'string' ? [to] : to,
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: message,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: from,
    ReplyToAddresses: ['no-reply@learnboost.com.ng'],
  };
};

const sendEmail = async (params) => {
  try {
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    };
    const ses = new AWS.SES({
      credentials: credentials,
      region: 'us-east-1',
    });

    await ses.sendEmail(params).promise();
  } catch (error) {
    console.log('Error occured whilst sending email through SES', error);
  }
};

module.exports = {
  sendEmail,
  createEmailParam,
};
