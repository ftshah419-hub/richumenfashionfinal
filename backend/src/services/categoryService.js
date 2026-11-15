const Category = require("../models/Category");
const ApiError = require("../utils/ApiError");

async function getAllCategories() {
  return await Category.find({ isActive: true }).sort({ name: 1 });
}

async function getCategoryBySlug(slug) {
  const category = await Category.findOne({ slug: slug.toLowerCase().trim(), isActive: true });
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  return category;
}

module.exports = {
  getAllCategories,
  getCategoryBySlug
};
