const mongoose = require("mongoose");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ======================================================
// ADD PRODUCT TO CART
// ======================================================
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // ------------------------------------------
    // Validate Product ID
    // ------------------------------------------
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // ------------------------------------------
    // Find Product
    // ------------------------------------------
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ------------------------------------------
    // Check Product Stock
    // ------------------------------------------
    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    // ------------------------------------------
    // Find Authenticated Customer
    // ------------------------------------------
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // ------------------------------------------
    // Check Existing Cart Item
    // ------------------------------------------
    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    // ------------------------------------------
    // Product Already Exists
    // ------------------------------------------
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;

      // Never exceed stock
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available`,
        });
      }

      existingItem.quantity = newQuantity;
    }

    // ------------------------------------------
    // Product Not In Cart
    // ------------------------------------------
    else {
      customer.cart.push({
        product: product._id,
        quantity: 1,
      });
    }

    // ------------------------------------------
    // Save Cart
    // ------------------------------------------
    await customer.save();

    // ------------------------------------------
    // Return Updated Cart
    // ------------------------------------------
    const updatedCustomer = await Customer.findById(
      customer._id
    ).populate({
      path: "cart.product",
      select:
        "name description price category image stock createdAt",
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ======================================================
// GET CURRENT CUSTOMER'S CART
// ======================================================
const getCart = async (req, res) => {
  try {
    // ------------------------------------------
    // Find Customer + Populate Products
    // ------------------------------------------
    const customer = await Customer.findById(
      req.user._id
    ).populate({
      path: "cart.product",
      select:
        "name description price category image stock createdAt",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // ------------------------------------------
    // Return Cart
    // ------------------------------------------
    return res.status(200).json({
      success: true,
      cart: customer.cart,
    });
  } catch (error) {
    console.error("GET CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ======================================================
// UPDATE CART QUANTITY
// ======================================================
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // ------------------------------------------
    // Validate Product ID
    // ------------------------------------------
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // ------------------------------------------
    // Validate Quantity Type
    // ------------------------------------------
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity)
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a number",
      });
    }

    // ------------------------------------------
    // Quantity Must Be At Least 1
    // ------------------------------------------
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // ------------------------------------------
    // Find Product
    // ------------------------------------------
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ------------------------------------------
    // Check Stock Limit
    // ------------------------------------------
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available`,
      });
    }

    // ------------------------------------------
    // Find Customer
    // ------------------------------------------
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // ------------------------------------------
    // Find Cart Item
    // ------------------------------------------
    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // ------------------------------------------
    // Update Quantity
    // ------------------------------------------
    cartItem.quantity = quantity;

    // ------------------------------------------
    // Save Cart
    // ------------------------------------------
    await customer.save();

    // ------------------------------------------
    // Return Updated Cart
    // ------------------------------------------
    const updatedCustomer = await Customer.findById(
      customer._id
    ).populate({
      path: "cart.product",
      select:
        "name description price category image stock createdAt",
    });

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    console.error("UPDATE CART QUANTITY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ======================================================
// REMOVE PRODUCT FROM CART
// ======================================================
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // ------------------------------------------
    // Validate Product ID
    // ------------------------------------------
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // ------------------------------------------
    // Find Customer
    // ------------------------------------------
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // ------------------------------------------
    // Find Cart Item
    // ------------------------------------------
    const cartIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    // ------------------------------------------
    // Cart Item Does Not Exist
    // ------------------------------------------
    if (cartIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // ------------------------------------------
    // Remove Cart Item
    // ------------------------------------------
    customer.cart.splice(cartIndex, 1);

    // ------------------------------------------
    // Save Cart
    // ------------------------------------------
    await customer.save();

    // ------------------------------------------
    // Return Updated Cart
    // ------------------------------------------
    const updatedCustomer = await Customer.findById(
      customer._id
    ).populate({
      path: "cart.product",
      select:
        "name description price category image stock createdAt",
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    console.error("REMOVE FROM CART ERROR:", error);

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
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
};