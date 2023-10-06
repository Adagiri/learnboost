const asyncHandler = require('../middlewares/async');
const CompanyData = require('../models/CompanyData');
const ErrorResponse = require('../utils/errorResponse');
const { getQueryArgs } = require('../utils/general');

module.exports.getCompanyDatas = asyncHandler(async (req, res, next) => {
  const { filter, sort, skip, limit } = getQueryArgs(req.query);

  let companyDatas = await CompanyData.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  companyDatas = companyDatas.map((data) => {
    data = data.toObject();
    data.id = data._id;
    return data
  });

  res.header('X-Total-Count', companyDatas.length);
  res.status(200).json(companyDatas);
});

module.exports.getCompanyData = asyncHandler(async (req, res, next) => {
  let companyData = await CompanyData.findById(req.params.companyDataId);

  if (!companyData) {
    return next(new ErrorResponse(400, 'Invalid companyData id'));
  }

  companyData = companyData.toObject();
  companyData.id = companyData._id;
  res.status(200).json(companyData);
});

module.exports.editCompanyData = asyncHandler(async (req, res, next) => {
  let companyData = await CompanyData.findByIdAndUpdate(
    req.params.companyDataId,
    req.body
  );

  companyData = companyData.toObject();
  companyData.id = companyData._id;

  res.status(200).json(companyData);
});
