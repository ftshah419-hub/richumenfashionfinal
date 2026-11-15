const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  fullName: { type: String, trim: true },
  phone: { type: String, trim: true },
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  addressType: { type: String, enum: ["HOME", "WORK", "OTHER"], default: "HOME" },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, trim: true },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  isEmailVerified: { type: Boolean, default: false },
  accountStatus: { type: String, enum: ["ACTIVE", "INACTIVE", "SUSPENDED"], default: "ACTIVE" },
  lastLoginAt: Date,
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: Date,
  addresses: [addressSchema]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
