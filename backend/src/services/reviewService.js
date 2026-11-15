const mongoose = require("mongoose");
const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

async function getProductReviews(productId) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const reviews = await Review.find({ product: productId })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .lean();

  const totalReviews = reviews.length;
  let totalRating = 0;
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const r of reviews) {
    totalRating += r.rating;
    if (ratingDistribution[r.rating] !== undefined) {
      ratingDistribution[r.rating]++;
    }
  }

  const averageRating = totalReviews > 0 ? Math.round((totalRating / totalReviews) * 10) / 10 : 0;

  return {
    productId,
    totalReviews,
    averageRating,
    ratingDistribution,
    reviews
  };
}

async function createReview(userId, { productId, rating, comment }) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const numRating = Number(rating);
  if (!numRating || numRating < 1 || numRating > 5) {
    throw new ApiError(400, "Rating must be an integer between 1 and 5");
  }

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw new ApiError(404, "Product not found or unavailable");
  }

  // Apply verified-purchase rule:
  // Check if customer previously placed an order containing this product that wasn't cancelled
  const verifiedOrder = await Order.findOne({
    user: userId,
    "items.product": productId,
    orderStatus: { $ne: "CANCELLED" }
  });

  const isVerifiedPurchase = Boolean(verifiedOrder);

  // Upsert review (1 per customer per product)
  const review = await Review.findOneAndUpdate(
    { user: userId, product: productId },
    {
      rating: Math.round(numRating),
      comment: (comment || "").trim(),
      isVerifiedPurchase
    },
    { upsert: true, new: true, runValidators: true }
  ).populate("user", "name");

  return review;
}

module.exports = {
  getProductReviews,
  createReview
};
