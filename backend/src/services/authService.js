const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");

async function register({ name, email, password, phone }) {
  const normalizedEmail = email.toLowerCase().trim();
  if (await User.exists({ email: normalizedEmail })) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name, email: normalizedEmail, password: hashedPassword, phone, role: "customer"
  });

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token: generateToken(user)
  };
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (user.accountStatus !== "ACTIVE") {
    throw new ApiError(403, "This account is not active");
  }

  user.lastLoginAt = new Date();
  user.failedLoginAttempts = 0;
  await user.save();

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token: generateToken(user)
  };
}

module.exports = { register, login };
