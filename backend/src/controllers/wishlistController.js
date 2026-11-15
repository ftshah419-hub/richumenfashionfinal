const wishlistService = require("../services/wishlistService");
const asyncHandler = require("../utils/asyncHandler");

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.getWishlist(req.user._id);
  res.json({
    success: true,
    data: wishlist
  });
});

const addProduct = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: "Product ID is required" });
  }
  const wishlist = await wishlistService.addProduct(req.user._id, productId);
  res.json({
    success: true,
    message: "Product added to wishlist",
    data: wishlist
  });
});

const removeProduct = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.removeProduct(req.user._id, req.params.productId);
  res.json({
    success: true,
    message: "Product removed from wishlist",
    data: wishlist
  });
});

const toggleProduct = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: "Product ID is required" });
  }
  const result = await wishlistService.toggleProduct(req.user._id, productId);
  res.json({
    success: true,
    message: result.added ? "Added to wishlist" : "Removed from wishlist",
    data: result
  });
});

module.exports = {
  getWishlist,
  addProduct,
  removeProduct,
  toggleProduct
};
