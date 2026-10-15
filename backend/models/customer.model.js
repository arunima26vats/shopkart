const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // WISHLIST
    // ==========================================
    wishlist: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
      default: [],
    },

    // ==========================================
    // SHOPPING CART
    // ==========================================
    cart: {
      type: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },

          quantity: {
            type: Number,
            default: 1,
            min: 1,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

const Customer =
  mongoose.models.Customer ||
  mongoose.model("Customer", customerSchema);

module.exports = Customer;