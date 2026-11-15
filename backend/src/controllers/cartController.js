const cartService = require("../services/cartService");
const asyncHandler = require("../utils/asyncHandler");

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  res.json({
    success: true,
    data: cart
  });
});

const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: "Item added to cart",
    data: cart
  });
});

const updateQuantity = asyncHandler(async (req, res) => {
  const cart = await cartService.updateQuantity(
    req.user._id,
    req.params.itemId,
    req.body.quantity
  );
  res.json({
    success: true,
    message: "Cart updated",
    data: cart
  });
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user._id, req.params.itemId);
  res.json({
    success: true,
    message: "Item removed from cart",
    data: cart
  });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user._id);
  res.json({
    success: true,
    message: "Cart cleared",
    data: cart
  });
});

module.exports = {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart
};
