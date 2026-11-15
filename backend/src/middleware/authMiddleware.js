const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  const user = await User.findById(payload.sub).select("_id name email role accountStatus");
  if (!user || user.accountStatus !== "ACTIVE") {
    return res.status(401).json({ success: false, message: "Account unavailable" });
  }

  req.user = user;
  next();
});

module.exports = { protect };
