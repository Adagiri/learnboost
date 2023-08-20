const asyncHandler = require('../middlewares/async');
const Category = require('../models/Category');

module.exports.getCategories = asyncHandler(async (req, res, next) => {
  let categories = await Category.find();

  res.header('X-Total-Count', categories.length);
  res.status(200).json(categories);
});

module.exports.getCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.categoryId);

  category.id = category._id;
  res.status(200).json(category);
});

module.exports.addCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);

  category.id = category._id;
  res.status(200).json(category);
});

module.exports.editCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(
    req.params.categoryId,
    req.body
  );

  category.id = category._id;

  res.status(200).json(category);
});
