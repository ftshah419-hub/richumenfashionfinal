const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  recordPaymentFailure
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/create-razorpay-order", createRazorpayOrder);
router.post("/verify", verifyPayment);
router.post("/failure", recordPaymentFailure);

module.exports = router;
