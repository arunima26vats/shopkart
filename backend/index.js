require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const orderRoutes = require("./routes/order.routes");
require("dotenv").config();

const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");

const app = express();

// ======================================================
// CORS
// ======================================================

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as PowerShell/Postman/server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      // Echo the requesting frontend origin.
      return callback(null, origin);
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],

    exposedHeaders: [
      "Content-Length",
    ],
  })
);

// ======================================================
// BODY PARSERS
// ======================================================

app.use(express.json());

app.use(cookieParser());

// ======================================================
// ROUTES
// ======================================================

app.use("/customers", customerRoutes);

app.use("/products", productRoutes);

app.use("/wishlist", wishlistRoutes);

app.use("/cart", cartRoutes);

app.use("/orders", orderRoutes);

// ======================================================
// ROOT
// ======================================================

app.get("/", (req, res) => {
  res.send("ShopKart API is running!");
});

// ======================================================
// DATABASE + SERVER
// ======================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });