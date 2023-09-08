const asyncHandler = require('../middlewares/async');
const { getS3SignedUrl } = require('../utils/fileUploads');

module.exports.getSignedUrl = asyncHandler(async (req, res, next) => {
  const { contentType, key } = req.query;

  const signedUrl = getS3SignedUrl(key, contentType);
  let src = `https://${process.env.S3_FILEUPLOAD_BUCKET}.s3.amazonaws.com/${key}`;

  if (process.env.TEST_ENV === 'true') {
    src = `https://${process.env.S3_FILEUPLOAD_BUCKET}.s3.amazonaws.com/test/${key}`;
  }

  return res.status(200).json({ src, signedUrl });
});
