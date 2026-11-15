const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");
const { validateRegistration, validateLogin, validateChangePassword } = require("../validators/authValidator");

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(validateRegistration(req.body));
  res.status(201).json({ success: true, ...result });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(validateLogin(req.body), "customer");
  res.status(200).json({ success: true, ...result });
});

const adminLogin = asyncHandler(async (req, res) => {
  const result = await authService.login(validateLogin(req.body), "admin");
  res.status(200).json({ success: true, ...result });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: authService.serializeUser(req.user) });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id, req.accessToken);
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user._id, validateChangePassword(req.body));
  res.status(200).json({ success: true, message: "Password changed successfully", ...result });
});

module.exports = { register, login, adminLogin, me, logout, changePassword };
