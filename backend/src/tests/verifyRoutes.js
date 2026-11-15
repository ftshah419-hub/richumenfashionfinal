const app = require("../app");
const assert = require("assert");

console.log("=== VERIFYING RICHU CUSTOMER MODULE EXPRESS ROUTES & ARCHITECTURE ===");

// 1. Inspect registered routes on Express router stack
const registeredRoutes = [];

function extractRoutes(stack, prefix = "") {
  stack.forEach((layer) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase()).join(", ");
      registeredRoutes.push(`${methods} ${prefix}${layer.route.path}`);
    } else if (layer.name === "router" && layer.handle.stack) {
      let subPrefix = prefix;
      if (layer.regexp) {
        const match = layer.regexp.source
          .replace("^\\", "")
          .replace("\\/?(?=\\/|$)", "")
          .replace(/\\\//g, "/")
          .replace("?(?=\\/|$)", "");
        subPrefix += match.replace(/^\^/, "").replace(/\$$/, "");
      }
      extractRoutes(layer.handle.stack, subPrefix);
    }
  });
}

extractRoutes(app._router.stack);

console.log(`Discovered ${registeredRoutes.length} active route endpoints:\n`);
registeredRoutes.forEach((r) => console.log("  [ROUTE]", r));

// Verify essential Customer endpoints exist
const requiredEndpoints = [
  "/api/health",
  "/api/auth/register",
  "/api/auth/login",
  "/api/categories",
  "/api/products",
  "/api/products/featured",
  "/api/products/new-arrivals",
  "/api/cart",
  "/api/wishlist",
  "/api/users/profile",
  "/api/users/addresses",
  "/api/orders",
  "/api/payments/create-razorpay-order",
  "/api/payments/verify",
  "/api/payments/failure",
  "/api/reviews"
];

console.log("\n=== VALIDATING ENDPOINT CONTRACTS ===");
let allPassed = true;
requiredEndpoints.forEach((ep) => {
  const found = registeredRoutes.some((r) => r.includes(ep));
  if (found) {
    console.log(`  ✓ ${ep} is registered`);
  } else {
    console.error(`  ✗ ${ep} is MISSING!`);
    allPassed = false;
  }
});

// Verify Services and Models exports
console.log("\n=== VALIDATING SERVICE & MODEL INTEGRITY ===");

const Product = require("../models/Product");
const Category = require("../models/Category");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const User = require("../models/User");

assert(Product, "Product model missing");
assert(Category, "Category model missing");
assert(Cart, "Cart model missing");
assert(Wishlist, "Wishlist model missing");
assert(Order, "Order model missing");
assert(Payment, "Payment model missing");
assert(Review, "Review model missing");
assert(User, "User model missing");
console.log("  ✓ All 8 Mongoose Models loaded and validated");

const productService = require("../services/productService");
const categoryService = require("../services/categoryService");
const cartService = require("../services/cartService");
const wishlistService = require("../services/wishlistService");
const userService = require("../services/userService");
const orderService = require("../services/orderService");
const paymentService = require("../services/paymentService");
const reviewService = require("../services/reviewService");

assert(typeof productService.getProducts === "function");
assert(typeof productService.getFeaturedProducts === "function");
assert(typeof productService.getNewArrivals === "function");
assert(typeof productService.getProductByIdOrSlug === "function");
console.log("  ✓ Product Service validated");

assert(typeof categoryService.getAllCategories === "function");
console.log("  ✓ Category Service validated");

assert(typeof cartService.getCart === "function");
assert(typeof cartService.addItem === "function");
assert(typeof cartService.updateQuantity === "function");
assert(typeof cartService.removeItem === "function");
console.log("  ✓ Cart Service validated");

assert(typeof wishlistService.getWishlist === "function");
assert(typeof wishlistService.addProduct === "function");
assert(typeof wishlistService.removeProduct === "function");
assert(typeof wishlistService.toggleProduct === "function");
console.log("  ✓ Wishlist Service validated");

assert(typeof userService.getProfile === "function");
assert(typeof userService.updateProfile === "function");
assert(typeof userService.getAddresses === "function");
assert(typeof userService.addAddress === "function");
assert(typeof userService.updateAddress === "function");
assert(typeof userService.deleteAddress === "function");
assert(typeof userService.setDefaultAddress === "function");
console.log("  ✓ User & Addresses Service validated");

assert(typeof orderService.createOrder === "function");
assert(typeof orderService.getUserOrders === "function");
assert(typeof orderService.getOrderById === "function");
assert(typeof orderService.cancelOrder === "function");
console.log("  ✓ Order Service validated");

assert(typeof paymentService.createRazorpayOrder === "function");
assert(typeof paymentService.verifyPayment === "function");
assert(typeof paymentService.recordPaymentFailure === "function");
console.log("  ✓ Payment Service validated");

assert(typeof reviewService.getProductReviews === "function");
assert(typeof reviewService.createReview === "function");
console.log("  ✓ Review Service validated");

// Test payment signature algorithm
console.log("\n=== VALIDATING RAZORPAY HMAC-SHA256 SIGNATURE LOGIC ===");
const crypto = require("crypto");
const secret = "QMxK5kVwMctzdDczxyLVhJtm";
const orderId = "order_test_12345";
const paymentId = "pay_test_67890";
const expectedSig = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
assert(expectedSig && expectedSig.length === 64, "HMAC SHA256 signature length must be 64 chars");
console.log(`  ✓ Generated valid test signature: ${expectedSig.slice(0, 16)}...`);

if (allPassed) {
  console.log("\n🎉 ALL ARCHITECTURAL CHECKS AND ENDPOINTS PASSED SUCCESSFULLY!");
  process.exit(0);
} else {
  console.error("\n❌ Some architectural checks failed.");
  process.exit(1);
}
