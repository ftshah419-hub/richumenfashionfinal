const categoryService = require("../services/categoryService");
const asyncHandler = require("../utils/asyncHandler");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  res.json({
    success: true,
    data: category
  });
});

module.exports = {
  getCategories,
  getCategoryBySlug
};
