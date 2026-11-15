const express = require("express");
const router = express.Router();
const {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getCart);
router.post("/items", addItem);
router.put("/items/:itemId", updateQuantity);
router.delete("/items/:itemId", removeItem);
router.delete("/", clearCart);

module.exports = router;
