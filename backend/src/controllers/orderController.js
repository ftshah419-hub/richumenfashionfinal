const orderService = require("../services/orderService");
const asyncHandler = require("../utils/asyncHandler");

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: order
  });
});

const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user._id);
  res.json({
    success: true,
    count: orders.length,
    data: orders
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.user._id, req.params.orderId);
  res.json({
    success: true,
    data: order
  });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(
    req.user._id,
    req.params.orderId,
    req.body.reason
  );
  res.json({
    success: true,
    message: "Order cancelled successfully",
    data: order
  });
});

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder
};
