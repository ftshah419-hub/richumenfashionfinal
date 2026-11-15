const asyncHandler = require("../utils/asyncHandler");
const adminService = require("../services/adminService");
const cloudinaryService = require("../services/cloudinaryService");

/* Dashboard */
const getDashboard = asyncHandler(async (req, res) => {
  const data = await adminService.getDashboardStats();
  res.json({ success: true, ...data });
});

/* Products */
const getProducts = asyncHandler(async (req, res) => {
  const result = await adminService.getProducts(req.query);
  res.json({ success: true, ...result });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await adminService.getProductById(req.params.id);
  res.json({ success: true, product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await adminService.createProduct(req.user._id, req.body);
  res.status(201).json({ success: true, product, message: "Product created successfully" });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await adminService.updateProduct(req.user._id, req.params.id, req.body);
  res.json({ success: true, product, message: "Product updated successfully" });
});

const toggleProductStatus = asyncHandler(async (req, res) => {
  const product = await adminService.toggleProductStatus(req.user._id, req.params.id, req.body.isActive);
  res.json({ success: true, product, message: `Product ${product.isActive ? "activated" : "deactivated"} successfully` });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const result = await adminService.deleteProduct(req.user._id, req.params.id);
  res.json(result);
});

/* Categories */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await adminService.getCategories();
  res.json({ success: true, categories });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await adminService.getCategoryById(req.params.id);
  res.json({ success: true, category });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await adminService.createCategory(req.user._id, req.body);
  res.status(201).json({ success: true, category, message: "Category created successfully" });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await adminService.updateCategory(req.user._id, req.params.id, req.body);
  res.json({ success: true, category, message: "Category updated successfully" });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const result = await adminService.deleteCategory(req.user._id, req.params.id);
  res.json(result);
});

/* Inventory */
const getInventory = asyncHandler(async (req, res) => {
  const result = await adminService.getInventory(req.query);
  res.json({ success: true, ...result });
});

const updateVariantStock = asyncHandler(async (req, res) => {
  const result = await adminService.updateVariantStock(req.user._id, req.body);
  res.json({ success: true, ...result, message: "Variant stock updated successfully" });
});

/* Orders */
const getOrders = asyncHandler(async (req, res) => {
  const result = await adminService.getOrders(req.query);
  res.json({ success: true, ...result });
});

const getOrder = asyncHandler(async (req, res) => {
  const data = await adminService.getOrderById(req.params.id);
  res.json({ success: true, ...data });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await adminService.updateOrderStatus(req.user._id, req.params.id, req.body);
  res.json({ success: true, order, message: `Order status updated to ${order.orderStatus}` });
});

const updateOrderPaymentStatus = asyncHandler(async (req, res) => {
  const order = await adminService.updateOrderPaymentStatus(req.user._id, req.params.id, req.body);
  res.json({ success: true, order, message: `Payment status updated to ${order.paymentStatus}` });
});

/* Customers */
const getCustomers = asyncHandler(async (req, res) => {
  const result = await adminService.getCustomers(req.query);
  res.json({ success: true, ...result });
});

const getCustomer = asyncHandler(async (req, res) => {
  const data = await adminService.getCustomerDetails(req.params.id);
  res.json({ success: true, ...data });
});

const updateCustomerStatus = asyncHandler(async (req, res) => {
  const result = await adminService.updateCustomerStatus(req.user._id, req.params.id, req.body);
  res.json({ success: true, ...result, message: `Customer account is now ${result.accountStatus}` });
});

/* Reviews */
const getReviews = asyncHandler(async (req, res) => {
  const result = await adminService.getReviews(req.query);
  res.json({ success: true, ...result });
});

const deleteReview = asyncHandler(async (req, res) => {
  const result = await adminService.deleteReview(req.user._id, req.params.id);
  res.json(result);
});

/* Audit Logs */
const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await adminService.getAuditLogs(req.query);
  res.json({ success: true, ...result });
});

/* Image Upload (Cloudinary) */
const uploadImage = asyncHandler(async (req, res) => {
  const { image, folder } = req.body;
  if (!image) {
    return res.status(400).json({ success: false, message: "Image data is required" });
  }
  const url = await cloudinaryService.uploadImage(image, folder || "richu/admin");
  res.json({ success: true, url, message: "Image uploaded successfully" });
});

module.exports = {
  getDashboard,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getInventory,
  updateVariantStock,
  getOrders,
  getOrder,
  updateOrderStatus,
  updateOrderPaymentStatus,
  getCustomers,
  getCustomer,
  updateCustomerStatus,
  getReviews,
  deleteReview,
  getAuditLogs,
  uploadImage
};
