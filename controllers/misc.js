const asyncHandler = require('../middlewares/async');
const { getS3SignedUrl } = require('../utils/fileUploads');

module.exports.getSignedUrl = asyncHandler(async (req, res, next) => {
  const { contentType, key } = req.query;
  
  const signedUrl = getS3SignedUrl(key, contentType);
  const src = `https://${process.env.S3_FILEUPLOAD_BUCKET}.s3.amazonaws.com/${key}`;

  return res.status(200).json({ src, signedUrl });
});
