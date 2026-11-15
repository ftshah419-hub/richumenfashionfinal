const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

function formatCartResponse(cart) {
  let subtotal = 0;
  let totalItems = 0;

  const validItems = (cart.items || []).map((item) => {
    const product = item.product;
    if (!product || !product.isActive) {
      return null;
    }

    const variant = (product.variants || []).find(
      (v) => v._id.toString() === item.variantId.toString()
    );

    if (!variant) {
      return null;
    }

    const unitPrice = variant.priceOverride !== undefined && variant.priceOverride !== null
      ? variant.priceOverride
      : product.price;

    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;
    totalItems += item.quantity;

    return {
      _id: item._id,
      productId: product._id,
      productName: product.name,
      slug: product.slug,
      image: (product.images && product.images[0]) || "",
      variantId: variant._id,
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
      stock: variant.stock,
      inStock: variant.stock >= item.quantity,
      unitPrice,
      quantity: item.quantity,
      itemTotal
    };
  }).filter(Boolean);

  const shippingThreshold = 500;
  const shippingCharge = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 50;
  const finalTotal = subtotal + shippingCharge;

  return {
    _id: cart._id,
    user: cart.user,
    items: validItems,
    totalItems,
    subtotal,
    shippingCharge,
    freeShippingThreshold: shippingThreshold,
    freeShippingUnlocked: subtotal >= shippingThreshold,
    finalTotal
  };
}

async function getCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return formatCartResponse(cart);
}

async function addItem(userId, { productId, variantId, quantity = 1 }) {
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw new ApiError(404, "Product is not available");
  }

  const variant = product.variants.find((v) => v._id.toString() === variantId.toString());
  if (!variant) {
    throw new ApiError(404, "Selected variant does not exist");
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId.toString() &&
      item.variantId.toString() === variantId.toString()
  );

  if (existingItemIndex > -1) {
    const newQty = cart.items[existingItemIndex].quantity + qty;
    if (newQty > variant.stock) {
      throw new ApiError(400, `Only ${variant.stock} units available in stock`);
    }
    cart.items[existingItemIndex].quantity = newQty;
  } else {
    if (qty > variant.stock) {
      throw new ApiError(400, `Only ${variant.stock} units available in stock`);
    }
    cart.items.push({
      product: productId,
      variantId,
      quantity: qty
    });
  }

  await cart.save();
  return getCart(userId);
}

async function updateQuantity(userId, itemId, quantity) {
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = cart.items.id(itemId);
  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }

  const product = await Product.findOne({ _id: item.product, isActive: true });
  if (!product) {
    throw new ApiError(404, "Product no longer available");
  }

  const variant = product.variants.find((v) => v._id.toString() === item.variantId.toString());
  if (!variant) {
    throw new ApiError(404, "Variant not found");
  }

  if (qty > variant.stock) {
    throw new ApiError(400, `Only ${variant.stock} items remaining in stock`);
  }

  item.quantity = qty;
  await cart.save();

  return getCart(userId);
}

async function removeItem(userId, itemId) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId.toString());
  await cart.save();

  return getCart(userId);
}

async function clearCart(userId) {
  const cart = await Cart.findOne({ user: userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  return getCart(userId);
}

module.exports = {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart
};
