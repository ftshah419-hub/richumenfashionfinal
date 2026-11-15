const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Payment = require("../models/Payment");
const ApiError = require("../utils/ApiError");

async function createOrder(userId, { shippingAddress, paymentMethod = "COD" }) {
  if (!shippingAddress) {
    throw new ApiError(400, "Shipping address is required");
  }

  const { fullName, phone, street, city, state, pincode } = shippingAddress;
  if (!fullName || !phone || !street || !city || !state || !pincode) {
    throw new ApiError(400, "Incomplete shipping address details");
  }

  const method = paymentMethod.toUpperCase();
  if (!["RAZORPAY", "COD"].includes(method)) {
    throw new ApiError(400, "Invalid payment method. Choose RAZORPAY or COD");
  }

  // 1. Fetch user's cart with products populated
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || !cart.items || cart.items.length === 0) {
    throw new ApiError(400, "Your shopping cart is empty");
  }

  // 2. Validate stock and verify prices on the backend
  const orderItems = [];
  let subtotal = 0;
  const stockUpdates = [];

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      throw new ApiError(400, `Product "${product ? product.name : 'Unknown'}" is unavailable`);
    }

    const variant = product.variants.find(
      (v) => v._id.toString() === item.variantId.toString()
    );

    if (!variant) {
      throw new ApiError(400, `Variant for "${product.name}" no longer exists`);
    }

    if (variant.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for "${product.name}" (${variant.size} / ${variant.color}). Available: ${variant.stock}`
      );
    }

    // Live price calculation from backend
    const unitPrice =
      variant.priceOverride !== undefined && variant.priceOverride !== null
        ? variant.priceOverride
        : product.price;

    const itemTotalPrice = unitPrice * item.quantity;
    subtotal += itemTotalPrice;

    // Snapshot item
    orderItems.push({
      product: product._id,
      productName: product.name,
      variantId: variant._id,
      size: variant.size,
      color: variant.color,
      quantity: item.quantity,
      unitPrice,
      totalPrice: itemTotalPrice
    });

    stockUpdates.push({
      productId: product._id,
      variantId: variant._id,
      quantity: item.quantity
    });
  }

  // Calculate shipping charges (Free over 500)
  const shippingThreshold = 500;
  const shippingCharge = subtotal >= shippingThreshold ? 0 : 50;
  const totalAmount = subtotal + shippingCharge;

  // 3. Atomically decrement stock
  for (const update of stockUpdates) {
    const result = await Product.updateOne(
      { _id: update.productId, "variants._id": update.variantId, "variants.stock": { $gte: update.quantity } },
      { $inc: { "variants.$.stock": -update.quantity } }
    );

    if (result.modifiedCount === 0) {
      throw new ApiError(400, "Stock updated concurrently. Please review your cart and try again.");
    }
  }

  // 4. Create Order with snapshot
  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress: {
      fullName: fullName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim()
    },
    subtotal,
    shippingCharge,
    totalAmount,
    paymentMethod: method,
    paymentStatus: "PENDING",
    orderStatus: "PLACED"
  });

  // 5. Create Payment record
  await Payment.create({
    order: order._id,
    paymentMethod: method,
    amount: totalAmount,
    status: method === "COD" ? "PENDING" : "CREATED"
  });

  // 6. Clear user cart
  cart.items = [];
  await cart.save();

  return order;
}

async function getUserOrders(userId) {
  const orders = await Order.find({ user: userId })
    .populate({
      path: "items.product",
      select: "name images slug"
    })
    .sort({ createdAt: -1 })
    .lean();

  return orders;
}

async function getOrderById(userId, orderId) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const order = await Order.findOne({ _id: orderId, user: userId })
    .populate({
      path: "items.product",
      select: "name images slug brand"
    })
    .lean();

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const payment = await Payment.findOne({ order: order._id }).lean();
  order.payment = payment || null;

  return order;
}

async function cancelOrder(userId, orderId, reason) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Business rule: cancellation allowed ONLY if orderStatus is PLACED or CONFIRMED
  if (!["PLACED", "CONFIRMED"].includes(order.orderStatus)) {
    throw new ApiError(
      400,
      `Cannot cancel order in "${order.orderStatus}" state. Only PLACED or CONFIRMED orders can be cancelled.`
    );
  }

  // Restore inventory stock
  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product, "variants._id": item.variantId },
      { $inc: { "variants.$.stock": item.quantity } }
    );
  }

  order.orderStatus = "CANCELLED";
  if (order.paymentStatus === "PAID") {
    order.paymentStatus = "REFUNDED";
    await Payment.updateOne(
      { order: order._id },
      { status: "REFUNDED" }
    );
  } else {
    await Payment.updateOne(
      { order: order._id },
      { status: "FAILED" }
    );
  }

  await order.save();
  return order;
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder
};
