const asyncHandler = require('../middlewares/async');
const Category = require('../models/Category');
const { getQueryArgs } = require('../utils/general');

module.exports.getCategories = asyncHandler(async (req, res, next) => {
  const { filter, sort, skip, limit } = getQueryArgs(req.query);
  let categories = await Category.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
  const categoriesCount = await Category.countDocuments();

  categories = categories.map((category) => {
    category = category.toObject();
    category.id = category._id;
    return category;
  });

  res.header('X-Total-Count', categoriesCount);
  return res.status(200).json(categories);
});

module.exports.getCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.categoryId);

  category = category.toObject();
  category.id = category._id;
  return res.status(200).json(category);
});

module.exports.addCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);

  category = category.toObject();
  category.id = category._id;
  res.status(200).json(category);
});

module.exports.editCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(
    req.params.categoryId,
    req.body
  );

  category = category.toObject();
  category.id = category._id;

  res.status(200).json(category);
});
