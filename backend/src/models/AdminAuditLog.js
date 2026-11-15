const mongoose = require("mongoose");

const adminAuditLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  targetType: { type: String, enum: ["PRODUCT", "CATEGORY", "ORDER", "USER", "INVENTORY"], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("AdminAuditLog", adminAuditLogSchema);
