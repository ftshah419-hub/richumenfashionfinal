const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

async function getWishlist(userId) {
  let wishlist = await Wishlist.findOne({ user: userId }).populate({
    path: "products",
    match: { isActive: true },
    populate: { path: "category", select: "name slug" }
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }

  // Filter out any null products in case any were removed or deactivated
  const validProducts = (wishlist.products || []).filter(Boolean);

  return {
    _id: wishlist._id,
    user: wishlist.user,
    products: validProducts,
    totalItems: validProducts.length
  };
}

async function addProduct(userId, productId) {
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw new ApiError(404, "Product not found or unavailable");
  }

  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = new Wishlist({ user: userId, products: [] });
  }

  const isAlreadyPresent = wishlist.products.some(
    (id) => id.toString() === productId.toString()
  );

  if (!isAlreadyPresent) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  return getWishlist(userId);
}

async function removeProduct(userId, productId) {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId.toString()
  );
  await wishlist.save();

  return getWishlist(userId);
}

async function toggleProduct(userId, productId) {
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw new ApiError(404, "Product not found or unavailable");
  }

  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = new Wishlist({ user: userId, products: [] });
  }

  const index = wishlist.products.findIndex(
    (id) => id.toString() === productId.toString()
  );

  let added = false;
  if (index > -1) {
    wishlist.products.splice(index, 1);
  } else {
    wishlist.products.push(productId);
    added = true;
  }

  await wishlist.save();
  const updated = await getWishlist(userId);
  return { ...updated, added };
}

module.exports = {
  getWishlist,
  addProduct,
  removeProduct,
  toggleProduct
};
