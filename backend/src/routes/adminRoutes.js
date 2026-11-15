const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");

const router = express.Router();

// Enforce authentication & admin authorization across all /api/admin routes
router.use(protect);
router.use(adminOnly);

/* Dashboard */
router.get("/dashboard", adminController.getDashboard);

/* Products */
router.get("/products", adminController.getProducts);
router.get("/products/:id", adminController.getProduct);
router.post("/products", adminController.createProduct);
router.put("/products/:id", adminController.updateProduct);
router.patch("/products/:id/status", adminController.toggleProductStatus);
router.delete("/products/:id", adminController.deleteProduct);

/* Categories */
router.get("/categories", adminController.getCategories);
router.get("/categories/:id", adminController.getCategory);
router.post("/categories", adminController.createCategory);
router.put("/categories/:id", adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);

/* Inventory */
router.get("/inventory", adminController.getInventory);
router.patch("/inventory/variant-stock", adminController.updateVariantStock);

/* Orders */
router.get("/orders", adminController.getOrders);
router.get("/orders/:id", adminController.getOrder);
router.patch("/orders/:id/status", adminController.updateOrderStatus);
router.patch("/orders/:id/payment-status", adminController.updateOrderPaymentStatus);

/* Customers */
router.get("/customers", adminController.getCustomers);
router.get("/customers/:id", adminController.getCustomer);
router.patch("/customers/:id/status", adminController.updateCustomerStatus);

/* Reviews */
router.get("/reviews", adminController.getReviews);
router.delete("/reviews/:id", adminController.deleteReview);

/* Audit Logs */
router.get("/audit-logs", adminController.getAuditLogs);

/* Image Upload (Cloudinary) */
router.post("/upload", adminController.uploadImage);

module.exports = router;
