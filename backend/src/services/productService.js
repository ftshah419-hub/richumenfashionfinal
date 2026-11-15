const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Review = require("../models/Review");
const ApiError = require("../utils/ApiError");

async function getProducts({
  search,
  category,
  size,
  color,
  minPrice,
  maxPrice,
  sort = "newest",
  page = 1,
  limit = 20
} = {}) {
  const query = { isActive: true };

  // Search filter
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { brand: searchRegex }
    ];
  }

  // Category filter (either ObjectId or slug)
  if (category && category.trim()) {
    if (mongoose.Types.ObjectId.isValid(category.trim())) {
      query.category = category.trim();
    } else {
      const cat = await Category.findOne({ slug: category.trim().toLowerCase(), isActive: true });
      if (cat) {
        query.category = cat._id;
      }
    }
  }

  // Variant size filter
  if (size && size.trim()) {
    query["variants.size"] = size.trim().toUpperCase();
  }

  // Variant color filter
  if (color && color.trim()) {
    query["variants.color"] = new RegExp(color.trim(), "i");
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      query.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      query.price.$lte = Number(maxPrice);
    }
  }

  // Sort order
  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { price: 1 };
  else if (sort === "price_desc") sortOption = { price: -1 };
  else if (sort === "name_asc") sortOption = { name: 1 };
  else if (sort === "name_desc") sortOption = { name: -1 };
  else if (sort === "newest") sortOption = { createdAt: -1 };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(query)
  ]);

  return {
    products,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum)
  };
}

async function getFeaturedProducts(limit = 8) {
  const products = await Product.find({ isActive: true })
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return products;
}

async function getNewArrivals(limit = 8) {
  const products = await Product.find({ isActive: true })
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return products;
}

async function getProductByIdOrSlug(identifier) {
  let product;
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    product = await Product.findOne({ _id: identifier, isActive: true })
      .populate("category", "name slug description")
      .lean();
  }

  if (!product) {
    product = await Product.findOne({ slug: identifier.toLowerCase().trim(), isActive: true })
      .populate("category", "name slug description")
      .lean();
  }

  if (!product) {
    throw new ApiError(404, "Product not found or unavailable");
  }

  // Review aggregate stats
  const reviewStats = await Review.aggregate([
    { $match: { product: product._id } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  product.averageRating = reviewStats.length > 0 ? Math.round(reviewStats[0].averageRating * 10) / 10 : 0;
  product.reviewCount = reviewStats.length > 0 ? reviewStats[0].reviewCount : 0;

  return product;
}

module.exports = {
  getProducts,
  getFeaturedProducts,
  getNewArrivals,
  getProductByIdOrSlug
};
