const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const controller = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const configuredRateLimit = Number(process.env.AUTH_RATE_LIMIT_MAX || 15);
const publicAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number.isInteger(configuredRateLimit) && configuredRateLimit > 0 ? configuredRateLimit : 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts. Please try again later" }
});

router.post("/register", publicAuthLimiter, controller.register);
router.post("/login", publicAuthLimiter, controller.login);
router.post("/admin/login", publicAuthLimiter, controller.adminLogin);
router.get("/me", protect, controller.me);
router.post("/logout", protect, controller.logout);
router.put("/change-password", protect, controller.changePassword);

module.exports = router;
