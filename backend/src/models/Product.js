const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  size: { type: String, enum: ["S", "M", "L", "XL", "XXL"], required: true },
  color: { type: String, required: true, trim: true },
  sku: { type: String, required: true, trim: true, uppercase: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  priceOverride: { type: Number, min: 0 }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: "" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  brand: { type: String, default: "RICHU" },
  price: { type: Number, required: true, min: 0 },
  images: [{ type: String }],
  variants: {
    type: [variantSchema],
    validate: v => Array.isArray(v) && v.length > 0
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ "variants.sku": 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Product", productSchema);
