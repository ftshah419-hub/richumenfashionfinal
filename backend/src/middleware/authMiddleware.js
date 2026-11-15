const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER || "richu-api",
      audience: process.env.JWT_AUDIENCE || "richu-web"
    });
  } catch (error) {
    const message = error.name === "TokenExpiredError" ? "Access token has expired" : "Invalid access token";
    return res.status(401).json({ success: false, message });
  }

  if (!payload.sub) return res.status(401).json({ success: false, message: "Invalid access token" });

  const user = await User.findById(payload.sub)
    .select("_id name email phone role isEmailVerified accountStatus lastLoginAt createdAt");
  if (!user || user.accountStatus !== "ACTIVE") {
    return res.status(401).json({ success: false, message: "Account unavailable" });
  }
  if (!(await authService.isAccessSessionActive(user._id, token))) {
    return res.status(401).json({ success: false, message: "Session has expired or been revoked" });
  }

  req.user = user;
  req.accessToken = token;
  next();
});

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "You do not have permission to access this resource" });
    }
    next();
  };
}

module.exports = { protect, authorize };
