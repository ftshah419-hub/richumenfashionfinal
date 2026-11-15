const paymentService = require("../services/paymentService");
const asyncHandler = require("../utils/asyncHandler");

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const result = await paymentService.createRazorpayOrder(req.user._id, req.body);
  res.json({
    success: true,
    data: result
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.verifyPayment(req.user._id, req.body);
  res.json({
    success: true,
    message: "Payment verified successfully",
    data: result
  });
});

const recordPaymentFailure = asyncHandler(async (req, res) => {
  const result = await paymentService.recordPaymentFailure(req.user._id, req.body);
  res.json({
    success: true,
    message: "Payment failure recorded",
    data: result
  });
});

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  recordPaymentFailure
};
