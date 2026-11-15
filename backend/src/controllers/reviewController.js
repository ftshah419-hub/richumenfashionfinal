const reviewService = require("../services/reviewService");
const asyncHandler = require("../utils/asyncHandler");

const getProductReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getProductReviews(req.params.productId);
  res.json({
    success: true,
    data: result
  });
});

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: "Review submitted successfully",
    data: review
  });
});

module.exports = {
  getProductReviews,
  createReview
};
