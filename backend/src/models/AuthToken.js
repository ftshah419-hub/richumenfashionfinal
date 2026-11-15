const mongoose = require("mongoose");

const authTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true },
  purpose: {
    type: String,
    enum: ["PASSWORD_RESET", "EMAIL_VERIFICATION", "REFRESH_SESSION", "ACCESS_TOKEN"],
    required: true
  },
  expiresAt: { type: Date, required: true },
  usedAt: Date
}, { timestamps: true });

authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AuthToken", authTokenSchema);
