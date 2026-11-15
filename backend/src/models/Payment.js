const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  paymentMethod: { type: String, enum: ["RAZORPAY", "COD"], required: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["CREATED", "PENDING", "SUCCESS", "FAILED", "REFUNDED", "COLLECTED"], default: "PENDING" },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  transactionId: String
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
