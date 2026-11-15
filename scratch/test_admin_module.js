// Scratch verification script to test adminService exports and basic logic
const adminService = require("../backend/src/services/adminService");
const adminController = require("../backend/src/controllers/adminController");
const adminRoutes = require("../backend/src/routes/adminRoutes");

console.log("Checking adminService exports:");
const expectedServiceFunctions = [
  "getDashboardStats",
  "getProducts",
  "getProductById",
  "createProduct",
  "updateProduct",
  "toggleProductStatus",
  "deleteProduct",
  "getCategories",
  "getCategoryById",
  "createCategory",
  "updateCategory",
  "deleteCategory",
  "getInventory",
  "updateVariantStock",
  "getOrders",
  "getOrderById",
  "updateOrderStatus",
  "updateOrderPaymentStatus",
  "getCustomers",
  "getCustomerDetails",
  "updateCustomerStatus",
  "getReviews",
  "deleteReview",
  "getAuditLogs"
];

for (const fn of expectedServiceFunctions) {
  if (typeof adminService[fn] !== "function") {
    console.error(`MISSING service function: ${fn}`);
    process.exit(1);
  }
}
console.log(`All ${expectedServiceFunctions.length} adminService functions verified!`);

console.log("\nChecking adminController exports:");
const expectedControllerFunctions = [
  "getDashboard",
  "getProducts",
  "getProduct",
  "createProduct",
  "updateProduct",
  "toggleProductStatus",
  "deleteProduct",
  "getCategories",
  "getCategory",
  "createCategory",
  "updateCategory",
  "deleteCategory",
  "getInventory",
  "updateVariantStock",
  "getOrders",
  "getOrder",
  "updateOrderStatus",
  "updateOrderPaymentStatus",
  "getCustomers",
  "getCustomer",
  "updateCustomerStatus",
  "getReviews",
  "deleteReview",
  "getAuditLogs",
  "uploadImage"
];

for (const fn of expectedControllerFunctions) {
  if (typeof adminController[fn] !== "function") {
    console.error(`MISSING controller handler: ${fn}`);
    process.exit(1);
  }
}
console.log(`All ${expectedControllerFunctions.length} adminController handlers verified!`);

console.log("\nChecking adminRoutes stack:");
if (!adminRoutes.stack || adminRoutes.stack.length === 0) {
  console.error("adminRoutes stack is empty!");
  process.exit(1);
}
console.log(`adminRoutes registered ${adminRoutes.stack.length} route layers/middlewares.`);
console.log("ALL ADMIN MODULE VERIFICATIONS PASSED!");
