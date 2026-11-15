const express = require("express");
const router = express.Router();
const {
  getProducts,
  getFeaturedProducts,
  getNewArrivals,
  getProductDetails
} = require("../controllers/productController");

router.get("/featured", getFeaturedProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/", getProducts);
router.get("/:identifier", getProductDetails);

module.exports = router;
