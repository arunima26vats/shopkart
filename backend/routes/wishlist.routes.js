const express = require("express");

const {
  addToWishlist,
  getWishlist,
  getWishlistCount,
  toggleWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// All wishlist routes are protected
router.use(authMiddleware);

// Add product to wishlist
router.post("/:productId", addToWishlist);

// Get wishlist count
router.get("/count", getWishlistCount);

// Get current user's wishlist
router.get("/", getWishlist);

// Toggle product in wishlist
router.patch("/:productId/toggle", toggleWishlist);

// Remove product from wishlist
router.delete("/:productId", removeFromWishlist);

module.exports = router;