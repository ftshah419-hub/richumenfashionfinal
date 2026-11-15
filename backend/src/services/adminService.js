const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const AdminAuditLog = require("../models/AdminAuditLog");
const ApiError = require("../utils/ApiError");

// Helper to record an audit log entry
async function logAdminAction({ adminId, action, targetType, targetId, details = "" }) {
  try {
    await AdminAuditLog.create({
      admin: adminId,
      action,
      targetType,
      targetId,
      details
    });
  } catch (error) {
    console.error("Failed to write admin audit log:", error.message);
  }
}

// Generate URL slug helper
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

/* ==========================================
   1. DASHBOARD & ANALYTICS
   ========================================== */
async function getDashboardStats() {
  const [
    totalCustomers,
    totalProducts,
    totalOrders,
    revenueAgg,
    pendingOrders,
    recentOrders,
    recentLogs,
    categoriesWithCounts
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: { $in: ["PAID", "COLLECTED"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]),
    Order.countDocuments({ orderStatus: { $in: ["PLACED", "CONFIRMED", "PROCESSING"] } }),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("user", "name email")
      .lean(),
    AdminAuditLog.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("admin", "name email")
      .lean(),
    Category.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "products"
        }
      },
      {
        $project: {
          name: 1,
          slug: 1,
          productCount: { $size: "$products" }
        }
      }
    ])
  ]);

  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

  // Monthly sales for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        orderStatus: { $ne: "CANCELLED" }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        revenue: {
          $sum: {
            $cond: [{ $in: ["$paymentStatus", ["PAID", "COLLECTED"]] }, "$totalAmount", 0]
          }
        },
        ordersCount: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  // Low stock inventory count (variants with stock <= 5)
  const lowStockProducts = await Product.find({
    "variants.stock": { $lte: 5 }
  }).countDocuments();

  return {
    metrics: {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      pendingOrders,
      lowStockProducts
    },
    recentOrders,
    recentLogs,
    monthlySales,
    categoriesWithCounts
  };
}

/* ==========================================
   2. PRODUCT MANAGEMENT
   ========================================== */
async function getProducts({ search, category, status, page = 1, limit = 20 }) {
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
      { "variants.sku": { $regex: search, $options: "i" } }
    ];
  }

  if (category) {
    query.category = category;
  }

  if (status !== undefined && status !== "") {
    query.isActive = status === "true" || status === true;
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(query)
  ]);

  return {
    products,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1
  };
}

async function getProductById(id) {
  const product = await Product.findById(id).populate("category", "name slug");
  if (!product) throw new ApiError(404, "Product not found");
  return product;
}

async function createProduct(adminId, data) {
  const { name, description, category, brand, price, images, variants, isActive } = data;

  if (!name || !price || !category) {
    throw new ApiError(400, "Product name, price, and category are required");
  }

  if (!Array.isArray(variants) || variants.length === 0) {
    throw new ApiError(400, "At least one product variant is required");
  }

  // Validate category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) throw new ApiError(400, "Invalid category specified");

  // Generate unique slug
  let slug = data.slug ? slugify(data.slug) : slugify(name);
  let slugCount = await Product.countDocuments({ slug });
  if (slugCount > 0) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  // Clean and validate variants
  const cleanedVariants = variants.map((v, index) => {
    if (!v.size || !v.color || !v.sku) {
      throw new ApiError(400, `Variant at position ${index + 1} is missing size, color, or SKU`);
    }
    return {
      size: v.size.toUpperCase(),
      color: v.color.trim(),
      sku: v.sku.trim().toUpperCase(),
      stock: Math.max(0, parseInt(v.stock, 10) || 0),
      priceOverride: v.priceOverride !== undefined && v.priceOverride !== "" ? Number(v.priceOverride) : undefined
    };
  });

  // Check for duplicate SKUs across variants within the same product
  const skus = cleanedVariants.map((v) => v.sku);
  if (new Set(skus).size !== skus.length) {
    throw new ApiError(400, "Duplicate SKUs found within product variants");
  }

  // Check SKU uniqueness in database
  const existingSku = await Product.findOne({ "variants.sku": { $in: skus } });
  if (existingSku) {
    throw new ApiError(409, "One or more SKUs are already in use by another product");
  }

  const product = await Product.create({
    name,
    slug,
    description: description || "",
    category,
    brand: brand || "RICHU",
    price: Number(price),
    images: Array.isArray(images) ? images : [],
    variants: cleanedVariants,
    isActive: isActive !== undefined ? Boolean(isActive) : true
  });

  await logAdminAction({
    adminId,
    action: "CREATE_PRODUCT",
    targetType: "PRODUCT",
    targetId: product._id,
    details: `Created product "${product.name}" with ${product.variants.length} variant(s)`
  });

  return product;
}

async function updateProduct(adminId, id, data) {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  if (data.name) product.name = data.name;
  if (data.description !== undefined) product.description = data.description;
  if (data.brand) product.brand = data.brand;
  if (data.price !== undefined) product.price = Number(data.price);
  if (data.isActive !== undefined) product.isActive = Boolean(data.isActive);
  if (Array.isArray(data.images)) product.images = data.images;

  if (data.category && data.category !== product.category.toString()) {
    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) throw new ApiError(400, "Invalid category specified");
    product.category = data.category;
  }

  if (Array.isArray(data.variants) && data.variants.length > 0) {
    const cleanedVariants = data.variants.map((v, index) => {
      if (!v.size || !v.color || !v.sku) {
        throw new ApiError(400, `Variant at position ${index + 1} is missing size, color, or SKU`);
      }
      return {
        _id: v._id || new mongoose.Types.ObjectId(),
        size: v.size.toUpperCase(),
        color: v.color.trim(),
        sku: v.sku.trim().toUpperCase(),
        stock: Math.max(0, parseInt(v.stock, 10) || 0),
        priceOverride: v.priceOverride !== undefined && v.priceOverride !== "" ? Number(v.priceOverride) : undefined
      };
    });

    const skus = cleanedVariants.map((v) => v.sku);
    if (new Set(skus).size !== skus.length) {
      throw new ApiError(400, "Duplicate SKUs found in variant list");
    }

    // Check SKU collision with other products
    const skuConflict = await Product.findOne({
      _id: { $ne: product._id },
      "variants.sku": { $in: skus }
    });
    if (skuConflict) {
      throw new ApiError(409, "One or more SKUs are already registered to another product");
    }

    product.variants = cleanedVariants;
  }

  await product.save();

  await logAdminAction({
    adminId,
    action: "UPDATE_PRODUCT",
    targetType: "PRODUCT",
    targetId: product._id,
    details: `Updated product details for "${product.name}"`
  });

  return product;
}

async function toggleProductStatus(adminId, id, isActive) {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  product.isActive = Boolean(isActive);
  await product.save();

  await logAdminAction({
    adminId,
    action: product.isActive ? "ACTIVATE_PRODUCT" : "DEACTIVATE_PRODUCT",
    targetType: "PRODUCT",
    targetId: product._id,
    details: `Changed active status to ${product.isActive}`
  });

  return product;
}

async function deleteProduct(adminId, id) {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  // Check if product is in active orders
  const activeOrder = await Order.findOne({
    "items.product": product._id,
    orderStatus: { $in: ["PLACED", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"] }
  });

  if (activeOrder) {
    throw new ApiError(
      400,
      "Cannot delete this product because it has active unfulfilled orders. Deactivate it instead."
    );
  }

  await Product.findByIdAndDelete(id);

  await logAdminAction({
    adminId,
    action: "DELETE_PRODUCT",
    targetType: "PRODUCT",
    targetId: id,
    details: `Deleted product "${product.name}" (SKU count: ${product.variants.length})`
  });

  return { success: true, message: "Product deleted successfully" };
}

/* ==========================================
   3. CATEGORY MANAGEMENT
   ========================================== */
async function getCategories() {
  const categories = await Category.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "category",
        as: "products"
      }
    },
    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        image: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        productCount: { $size: "$products" }
      }
    },
    { $sort: { createdAt: -1 } }
  ]);

  return categories;
}

async function getCategoryById(id) {
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, "Category not found");
  return category;
}

async function createCategory(adminId, { name, slug, description, image, isActive }) {
  if (!name) throw new ApiError(400, "Category name is required");

  let catSlug = slug ? slugify(slug) : slugify(name);
  if (await Category.exists({ slug: catSlug })) {
    throw new ApiError(409, "A category with this slug already exists");
  }

  const category = await Category.create({
    name,
    slug: catSlug,
    description: description || "",
    image: image || "",
    isActive: isActive !== undefined ? Boolean(isActive) : true
  });

  await logAdminAction({
    adminId,
    action: "CREATE_CATEGORY",
    targetType: "CATEGORY",
    targetId: category._id,
    details: `Created category "${category.name}"`
  });

  return category;
}

async function updateCategory(adminId, id, data) {
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, "Category not found");

  if (data.name) category.name = data.name;
  if (data.description !== undefined) category.description = data.description;
  if (data.image !== undefined) category.image = data.image;
  if (data.isActive !== undefined) category.isActive = Boolean(data.isActive);

  if (data.slug && data.slug !== category.slug) {
    const newSlug = slugify(data.slug);
    if (await Category.exists({ slug: newSlug, _id: { $ne: category._id } })) {
      throw new ApiError(409, "A category with this slug already exists");
    }
    category.slug = newSlug;
  }

  await category.save();

  await logAdminAction({
    adminId,
    action: "UPDATE_CATEGORY",
    targetType: "CATEGORY",
    targetId: category._id,
    details: `Updated category "${category.name}"`
  });

  return category;
}

async function deleteCategory(adminId, id) {
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, "Category not found");

  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete category "${category.name}" because ${productCount} product(s) are assigned to it.`
    );
  }

  await Category.findByIdAndDelete(id);

  await logAdminAction({
    adminId,
    action: "DELETE_CATEGORY",
    targetType: "CATEGORY",
    targetId: id,
    details: `Deleted category "${category.name}"`
  });

  return { success: true, message: "Category deleted successfully" };
}

/* ==========================================
   4. INVENTORY MANAGEMENT
   ========================================== */
async function getInventory({ search, lowStockOnly = false, threshold = 5, page = 1, limit = 50 }) {
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { "variants.sku": { $regex: search, $options: "i" } }
    ];
  }

  const products = await Product.find(query)
    .populate("category", "name")
    .lean();

  const inventoryItems = [];
  let totalStockCount = 0;
  let lowStockVariantCount = 0;
  let outOfStockVariantCount = 0;

  for (const product of products) {
    for (const variant of product.variants) {
      totalStockCount += variant.stock;
      const isLowStock = variant.stock <= threshold && variant.stock > 0;
      const isOutOfStock = variant.stock === 0;

      if (isLowStock) lowStockVariantCount++;
      if (isOutOfStock) outOfStockVariantCount++;

      if (lowStockOnly === "true" || lowStockOnly === true) {
        if (!isLowStock && !isOutOfStock) continue;
      }

      inventoryItems.push({
        productId: product._id,
        productName: product.name,
        categoryName: product.category?.name || "Uncategorized",
        variantId: variant._id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        stock: variant.stock,
        price: variant.priceOverride || product.price,
        isLowStock,
        isOutOfStock,
        isActive: product.isActive
      });
    }
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const total = inventoryItems.length;
  const paginatedItems = inventoryItems.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return {
    items: paginatedItems,
    summary: {
      totalVariants: inventoryItems.length,
      totalStockUnits: totalStockCount,
      lowStockVariants: lowStockVariantCount,
      outOfStockVariants: outOfStockVariantCount
    },
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1
  };
}

async function updateVariantStock(adminId, { productId, variantId, newStock, reason }) {
  if (newStock === undefined || parseInt(newStock, 10) < 0) {
    throw new ApiError(400, "Valid non-negative stock value is required");
  }

  const parsedStock = parseInt(newStock, 10);
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const variant = product.variants.id(variantId);
  if (!variant) throw new ApiError(404, "Product variant not found");

  const oldStock = variant.stock;
  variant.stock = parsedStock;
  await product.save();

  await logAdminAction({
    adminId,
    action: "UPDATE_STOCK",
    targetType: "INVENTORY",
    targetId: product._id,
    details: `Updated SKU ${variant.sku} stock from ${oldStock} to ${parsedStock}. Reason: ${reason || "Manual update"}`
  });

  return {
    productId: product._id,
    variantId: variant._id,
    sku: variant.sku,
    oldStock,
    newStock: parsedStock
  };
}

/* ==========================================
   5. ORDER MANAGEMENT
   ========================================== */
async function getOrders({ status, paymentStatus, search, page = 1, limit = 20 }) {
  const query = {};

  if (status) query.orderStatus = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;

  if (search) {
    if (mongoose.Types.ObjectId.isValid(search)) {
      query._id = search;
    } else {
      // Find matching users first
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      }).select("_id");
      const userIds = users.map((u) => u._id);
      query.user = { $in: userIds };
    }
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Order.countDocuments(query)
  ]);

  return {
    orders,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1
  };
}

async function getOrderById(id) {
  const order = await Order.findById(id)
    .populate("user", "name email phone")
    .populate("items.product", "name images price slug");

  if (!order) throw new ApiError(404, "Order not found");

  const [payment, auditLogs] = await Promise.all([
    Payment.findOne({ order: order._id }).lean(),
    AdminAuditLog.find({ targetType: "ORDER", targetId: order._id })
      .populate("admin", "name email")
      .sort({ createdAt: -1 })
      .lean()
  ]);

  return {
    order,
    payment,
    auditLogs
  };
}

async function updateOrderStatus(adminId, id, { orderStatus, notes }) {
  const validStatuses = [
    "PLACED",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED"
  ];

  if (!validStatuses.includes(orderStatus)) {
    throw new ApiError(400, `Invalid order status. Allowed: ${validStatuses.join(", ")}`);
  }

  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, "Order not found");

  const oldStatus = order.orderStatus;
  if (oldStatus === "DELIVERED" && orderStatus !== "DELIVERED") {
    throw new ApiError(400, "Cannot change status of an already delivered order");
  }

  if (oldStatus === "CANCELLED") {
    throw new ApiError(400, "Order is already cancelled");
  }

  // Business Rule: If moving to CANCELLED, restore variant stocks
  if (orderStatus === "CANCELLED" && oldStatus !== "CANCELLED") {
    for (const item of order.items) {
      if (item.product && item.variantId) {
        await Product.updateOne(
          { _id: item.product, "variants._id": item.variantId },
          { $inc: { "variants.$.stock": item.quantity } }
        );
      }
    }
  }

  order.orderStatus = orderStatus;
  await order.save();

  await logAdminAction({
    adminId,
    action: `ORDER_STATUS_${orderStatus}`,
    targetType: "ORDER",
    targetId: order._id,
    details: `Changed status from ${oldStatus} to ${orderStatus}. Notes: ${notes || "None"}`
  });

  return order;
}

async function updateOrderPaymentStatus(adminId, id, { paymentStatus }) {
  const validPaymentStatuses = ["PENDING", "PAID", "FAILED", "COLLECTED", "REFUNDED"];
  if (!validPaymentStatuses.includes(paymentStatus)) {
    throw new ApiError(400, `Invalid payment status. Allowed: ${validPaymentStatuses.join(", ")}`);
  }

  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, "Order not found");

  const oldStatus = order.paymentStatus;
  order.paymentStatus = paymentStatus;
  await order.save();

  // Update payment record if exists
  await Payment.findOneAndUpdate(
    { order: order._id },
    { status: paymentStatus === "PAID" || paymentStatus === "COLLECTED" ? "SUCCESS" : paymentStatus },
    { new: true }
  );

  await logAdminAction({
    adminId,
    action: `ORDER_PAYMENT_${paymentStatus}`,
    targetType: "ORDER",
    targetId: order._id,
    details: `Changed payment status from ${oldStatus} to ${paymentStatus}`
  });

  return order;
}

/* ==========================================
   6. CUSTOMER MANAGEMENT
   ========================================== */
async function getCustomers({ search, status, page = 1, limit = 20 }) {
  const query = { role: "customer" };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } }
    ];
  }

  if (status) {
    query.accountStatus = status;
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(query)
  ]);

  // Attach order aggregates for each customer
  const userIds = users.map((u) => u._id);
  const orderStats = await Order.aggregate([
    { $match: { user: { $in: userIds }, orderStatus: { $ne: "CANCELLED" } } },
    {
      $group: {
        _id: "$user",
        totalSpent: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 }
      }
    }
  ]);

  const statsMap = new Map();
  for (const s of orderStats) {
    statsMap.set(s._id.toString(), s);
  }

  const enrichedUsers = users.map((u) => {
    const stats = statsMap.get(u._id.toString()) || { totalSpent: 0, orderCount: 0 };
    return {
      ...u,
      totalSpent: stats.totalSpent,
      orderCount: stats.orderCount
    };
  });

  return {
    customers: enrichedUsers,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1
  };
}

async function getCustomerDetails(id) {
  const customer = await User.findById(id).select("-password").lean();
  if (!customer) throw new ApiError(404, "Customer not found");

  const orders = await Order.find({ user: customer._id })
    .sort({ createdAt: -1 })
    .lean();

  return {
    customer,
    orders
  };
}

async function updateCustomerStatus(adminId, id, { accountStatus }) {
  const valid = ["ACTIVE", "INACTIVE", "SUSPENDED"];
  if (!valid.includes(accountStatus)) {
    throw new ApiError(400, `Invalid account status. Allowed: ${valid.join(", ")}`);
  }

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");

  const oldStatus = user.accountStatus;
  user.accountStatus = accountStatus;
  await user.save();

  await logAdminAction({
    adminId,
    action: `USER_STATUS_${accountStatus}`,
    targetType: "USER",
    targetId: user._id,
    details: `Updated account status from ${oldStatus} to ${accountStatus}`
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    accountStatus: user.accountStatus
  };
}

/* ==========================================
   7. REVIEW MANAGEMENT
   ========================================== */
async function getReviews({ search, rating, page = 1, limit = 20 }) {
  const query = {};
  if (rating) query.rating = parseInt(rating, 10);

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate("user", "name email")
      .populate("product", "name images price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Review.countDocuments(query)
  ]);

  return {
    reviews,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1
  };
}

async function deleteReview(adminId, id) {
  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, "Review not found");

  await Review.findByIdAndDelete(id);

  await logAdminAction({
    adminId,
    action: "DELETE_REVIEW",
    targetType: "REVIEW",
    targetId: id,
    details: `Deleted review (Rating: ${review.rating}*) for product ${review.product}`
  });

  return { success: true, message: "Review deleted successfully" };
}

/* ==========================================
   8. AUDIT LOGS
   ========================================== */
async function getAuditLogs({ targetType, page = 1, limit = 30 }) {
  const query = {};
  if (targetType) query.targetType = targetType;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    AdminAuditLog.find(query)
      .populate("admin", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    AdminAuditLog.countDocuments(query)
  ]);

  return {
    logs,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1
  };
}

module.exports = {
  getDashboardStats,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getInventory,
  updateVariantStock,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderPaymentStatus,
  getCustomers,
  getCustomerDetails,
  updateCustomerStatus,
  getReviews,
  deleteReview,
  getAuditLogs
};
