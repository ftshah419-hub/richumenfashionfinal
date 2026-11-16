const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuthToken = require("../models/AuthToken");
const generateToken = require("../utils/generateToken");
const hashToken = require("../utils/hashToken");
const ApiError = require("../utils/ApiError");

const passwordSaltRounds = 12;

function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    accountStatus: user.accountStatus,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt
  };
}

function getSessionExpiry(token) {
  const payload = jwt.decode(token);
  if (!payload || !payload.exp) throw new Error("Unable to determine access-token expiry");
  return new Date(payload.exp * 1000);
}

async function issueAccessSession(user) {
  const token = generateToken(user);
  await AuthToken.create({
    user: user._id,
    tokenHash: hashToken(token),
    purpose: "ACCESS_TOKEN",
    expiresAt: getSessionExpiry(token)
  });
  return token;
}

async function register({ name, email, password, phone }) {
  if (await User.exists({ email })) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, passwordSaltRounds),
    phone,
    role: "customer"
  });

  return {
    user: serializeUser(user),
    token: await issueAccessSession(user)
  };
}

function getMaxFailedAttempts() {
  const value = Number(process.env.AUTH_MAX_FAILED_ATTEMPTS || 5);
  return Number.isInteger(value) && value > 0 ? value : 5;
}

function getLockMinutes() {
  const value = Number(process.env.AUTH_LOCK_MINUTES || 15);
  return Number.isFinite(value) && value > 0 ? value : 15;
}

async function recordFailedLogin(user) {
  if (!user) return;

  user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
  if (user.failedLoginAttempts >= getMaxFailedAttempts()) {
    user.lockedUntil = new Date(Date.now() + getLockMinutes() * 60 * 1000);
  }
  await user.save();
}

async function login({ email, password }, requiredRole = "customer") {
  const user = await User.findOne({ email }).select("+password");
  const now = new Date();

  if (user?.lockedUntil && user.lockedUntil > now) {
    throw new ApiError(429, "Too many failed login attempts. Please try again later");
  }
  if (user?.lockedUntil && user.lockedUntil <= now) {
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    await recordFailedLogin(user);
    throw new ApiError(401, "Invalid email or password");
  }
  if (user.accountStatus !== "ACTIVE") {
    throw new ApiError(403, "This account is not active");
  }
  if (requiredRole && user.role !== requiredRole) {
    throw new ApiError(403, "This account is not authorized for this portal");
  }

  user.lastLoginAt = now;
  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  await user.save();

  return {
    user: serializeUser(user),
    token: await issueAccessSession(user)
  };
}

async function logout(userId, token) {
  await AuthToken.findOneAndUpdate(
    { user: userId, tokenHash: hashToken(token), purpose: "ACCESS_TOKEN", usedAt: null },
    { usedAt: new Date() }
  );
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select("+password");
  if (!user || user.accountStatus !== "ACTIVE") {
    throw new ApiError(401, "Account unavailable");
  }
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    throw new ApiError(401, "Current password is incorrect");
  }
  if (await bcrypt.compare(newPassword, user.password)) {
    throw new ApiError(422, "New password must be different from the current password");
  }

  user.password = await bcrypt.hash(newPassword, passwordSaltRounds);
  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  await user.save();
  await AuthToken.updateMany(
    { user: user._id, purpose: "ACCESS_TOKEN", usedAt: null },
    { usedAt: new Date() }
  );

  return { user: serializeUser(user), token: await issueAccessSession(user) };
}

async function isAccessSessionActive(userId, token) {
  return Boolean(await AuthToken.exists({
    user: userId,
    tokenHash: hashToken(token),
    purpose: "ACCESS_TOKEN",
    usedAt: null,
    expiresAt: { $gt: new Date() }
  }));
}

module.exports = { register, login, logout, changePassword, isAccessSessionActive, serializeUser };
