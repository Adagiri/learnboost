const AWS = require('aws-sdk');

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
};

AWS.config.apiVersions = {
  s3: '2006-03-01',
};

const ses = new AWS.SES({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

var s3 = new AWS.S3({
  credentials,
});

const uploadFile = (params) => {
  // var params = { Bucket: 'bucket', Key: 'key', Body: stream };

  return s3.upload(params);
};


module.exports = {
  ses,
  uploadFile,
};
