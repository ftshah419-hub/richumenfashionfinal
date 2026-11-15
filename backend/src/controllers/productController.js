const productService = require("../services/productService");
const asyncHandler = require("../utils/asyncHandler");

const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(req.query);
  res.json({
    success: true,
    ...result
  });
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 8;
  const products = await productService.getFeaturedProducts(limit);
  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

const getNewArrivals = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 8;
  const products = await productService.getNewArrivals(limit);
  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

const getProductDetails = asyncHandler(async (req, res) => {
  const product = await productService.getProductByIdOrSlug(req.params.identifier);
  res.json({
    success: true,
    data: product
  });
});

module.exports = {
  getProducts,
  getFeaturedProducts,
  getNewArrivals,
  getProductDetails
};
