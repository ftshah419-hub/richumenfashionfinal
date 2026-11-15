const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addProduct,
  removeProduct,
  toggleProduct
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getWishlist);
router.post("/", addProduct);
router.post("/toggle", toggleProduct);
router.delete("/:productId", removeProduct);

module.exports = router;
