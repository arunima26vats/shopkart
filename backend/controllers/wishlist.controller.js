const mongoose = require("mongoose");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ======================================================
// ADD PRODUCT TO WISHLIST
// ======================================================
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate Product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Check whether product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get current customer
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Prevent duplicate wishlist entries
    const alreadyExists = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Product already exists in wishlist",
      });
    }

    // Add product reference
    customer.wishlist.push(product._id);

    await customer.save();

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      saved: true,
    });
  } catch (error) {
    console.error("ADD TO WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ======================================================
// GET CURRENT CUSTOMER'S WISHLIST
// ======================================================
const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name description price category image stock createdAt",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ======================================================
// GET WISHLIST COUNT
// ======================================================
const getWishlistCount = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).select(
      "wishlist"
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
    });
  } catch (error) {
    console.error("GET WISHLIST COUNT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ======================================================
// TOGGLE PRODUCT IN WISHLIST
// ======================================================
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate Product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Get current customer
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check whether product is already in wishlist
    const wishlistIndex = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    // --------------------------------------------------
    // PRODUCT IS ALREADY SAVED → REMOVE IT
    // --------------------------------------------------
    if (wishlistIndex !== -1) {
      customer.wishlist.splice(wishlistIndex, 1);

      await customer.save();

      return res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
        saved: false,
      });
    }

    // --------------------------------------------------
    // PRODUCT IS NOT SAVED → CHECK PRODUCT EXISTS
    // --------------------------------------------------
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Add product reference
    customer.wishlist.push(product._id);

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      saved: true,
    });
  } catch (error) {
    console.error("TOGGLE WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ======================================================
// REMOVE PRODUCT FROM WISHLIST
// ======================================================
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate Product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Get current customer
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Find product in wishlist
    const wishlistIndex = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    // Product is not in wishlist
    if (wishlistIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    // Remove product reference
    customer.wishlist.splice(wishlistIndex, 1);

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      saved: false,
    });
  } catch (error) {
    console.error("REMOVE FROM WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ======================================================
// EXPORT CONTROLLERS
// ======================================================
module.exports = {
  addToWishlist,
  getWishlist,
  getWishlistCount,
  toggleWishlist,
  removeFromWishlist,
};