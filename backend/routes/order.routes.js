
const express = require("express");

const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/order.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// All order routes require authentication.
router.use(authMiddleware);

// Checkout and payment.
router.post("/create-payment-order", createPaymentOrder);
router.post("/verify-payment", verifyPayment);

// Bonus: development-only order status progression.
router.patch("/:id/status", updateOrderStatus);

// Order history and individual order details.
router.get("/", getMyOrders);
router.get("/:id", getOrderById);

module.exports = router;
