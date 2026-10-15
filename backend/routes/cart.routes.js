const express = require("express");

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} = require("../controllers/cart.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

// Add product to cart
router.post("/:productId", addToCart);

// Get current customer's cart
router.get("/", getCart);

// Update product quantity
router.patch("/:productId", updateCartQuantity);

// Remove product from cart
router.delete("/:productId", removeFromCart);

module.exports = router;