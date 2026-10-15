
const crypto = require("crypto");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

// ======================================================
// RAZORPAY INITIALIZATION
// ======================================================

if (
  !process.env.RAZORPAY_KEY_ID ||
  !process.env.RAZORPAY_KEY_SECRET
) {
  throw new Error(
    "Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in .env"
  );
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ======================================================
// HELPER: CLEAR CART ONLY IF IT MATCHES THE ORDER
// ======================================================

const clearCartIfMatchesOrder = async (userId, order) => {
  const customer = await Customer.findById(userId);

  if (!customer || !Array.isArray(customer.cart)) {
    return;
  }

  const purchasedItems = order.items.map((item) => ({
    productId: String(item.product?._id || item.product),
    quantity: item.quantity,
  }));

  const cartItems = customer.cart.map((item) => ({
    productId: String(item.product?._id || item.product),
    quantity: item.quantity,
  }));

  const sameCart =
    purchasedItems.length === cartItems.length &&
    purchasedItems.every((purchased) =>
      cartItems.some(
        (cartItem) =>
          cartItem.productId === purchased.productId &&
          cartItem.quantity === purchased.quantity
      )
    );

  if (sameCart) {
    customer.cart = [];
    await customer.save();
    console.log("Cart cleared after verified payment.");
  } else {
    console.log(
      "Cart preserved because it no longer matches the paid order."
    );
  }
};

// ======================================================
// CREATE PAYMENT ORDER
// POST /orders/create-payment-order
// ======================================================

const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body || {};

    const requiredFields = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "pincode",
    ];

    if (
      !shippingAddress ||
      requiredFields.some(
        (field) =>
          typeof shippingAddress[field] !== "string" ||
          !shippingAddress[field].trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a complete shipping address.",
      });
    }

    if (!/^\d{10}$/.test(shippingAddress.phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain exactly 10 digits.",
      });
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain exactly 6 digits.",
      });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    if (!Array.isArray(customer.cart) || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty.",
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products in your cart no longer exist.",
        });
      }

      if (
        !Number.isInteger(cartItem.quantity) ||
        cartItem.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.name}.`,
        });
      }

      if (
        !Number.isInteger(product.stock) ||
        cartItem.quantity > product.stock
      ) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
        });
      }

      if (
        typeof product.price !== "number" ||
        !Number.isFinite(product.price) ||
        product.price <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${product.name}.`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });

      totalAmount += product.price * cartItem.quantity;
    }

    const amountInPaise = Math.round(totalAmount * 100);

    if (
      !Number.isSafeInteger(amountInPaise) ||
      amountInPaise <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount.",
      });
    }

    // Create the persistent ShopKart order using server-side prices.
    const order = await Order.create({
      user: customer._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
      },
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
      inventoryDeducted: false,
    });

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: order._id.toString(),
      });

      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return res.status(201).json({
        success: true,
        message: "Payment order created successfully.",
        order,
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.error(
        "RAZORPAY ORDER CREATION ERROR:",
        error.message
      );

      order.paymentStatus = "FAILED";
      await order.save();

      return res.status(502).json({
        success: false,
        message: "Could not initialize payment.",
      });
    }
  } catch (error) {
    console.error("CREATE PAYMENT ORDER ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create order.",
    });
  }
};

// ======================================================
// VERIFY PAYMENT
// POST /orders/verify-payment
// ======================================================

const verifyPayment = async (req, res) => {
  let session;

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body || {};

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !/^[a-f0-9]{64}$/i.test(razorpay_signature)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment verification details.",
      });
    }

    const userId = req.user._id;

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this account.",
      });
    }

    // An exact retry must never deduct stock a second time.
    if (order.paymentStatus === "PAID") {
      if (order.razorpayPaymentId === razorpay_payment_id) {
        // Best-effort retry of cart cleanup.
        try {
          await clearCartIfMatchesOrder(userId, order);
        } catch (cartError) {
          console.error("CART CLEANUP ERROR:", cartError.message);
        }

        return res.status(200).json({
          success: true,
          message: "Payment already verified.",
          order,
        });
      }

      return res.status(409).json({
        success: false,
        message: "This order has already been paid.",
      });
    }

    if (order.paymentStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "This order is not awaiting payment.",
      });
    }

    // Verify the Razorpay signature using the stored order ID.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest();

    const receivedSignature = Buffer.from(
      razorpay_signature,
      "hex"
    );

    if (
      expectedSignature.length !== receivedSignature.length ||
      !crypto.timingSafeEqual(
        expectedSignature,
        receivedSignature
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    // Independently verify payment status, amount and currency.
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== order.razorpayOrderId ||
      payment.amount !== Math.round(order.totalAmount * 100) ||
      payment.currency !== "INR" ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment is not captured or does not match this order.",
      });
    }

    /*
     * IMPORTANT:
     * Deduct inventory and mark the order paid in one transaction.
     * MongoDB transactions require a replica set or a sharded cluster.
     */
    session = await mongoose.startSession();

    let verifiedOrder = null;
    let alreadyProcessed = false;

    await session.withTransaction(async () => {
      // Re-read inside the transaction to prevent duplicate deductions.
      const currentOrder = await Order.findOne({
        _id: order._id,
        user: userId,
      }).session(session);

      if (!currentOrder) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (currentOrder.paymentStatus === "PAID") {
        if (
          currentOrder.razorpayPaymentId === razorpay_payment_id
        ) {
          alreadyProcessed = true;
          verifiedOrder = currentOrder;
          return;
        }

        throw new Error("ORDER_ALREADY_PAID");
      }

      if (currentOrder.paymentStatus !== "PENDING") {
        throw new Error("ORDER_NOT_PENDING");
      }

      if (currentOrder.inventoryDeducted) {
        throw new Error("INVENTORY_ALREADY_DEDUCTED");
      }

      // Each conditional update prevents stock from becoming negative.
      for (const item of currentOrder.items) {
        const productUpdate = await Product.updateOne(
          {
            _id: item.product,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          { session }
        );

        if (productUpdate.modifiedCount !== 1) {
          throw new Error(`INSUFFICIENT_STOCK:${item.name}`);
        }
      }

      currentOrder.paymentStatus = "PAID";
      currentOrder.status = "PLACED";
      currentOrder.razorpayPaymentId = razorpay_payment_id;
      currentOrder.inventoryDeducted = true;

      await currentOrder.save({ session });

      verifiedOrder = currentOrder;
    });

    await session.endSession();
    session = null;

    // Clear the cart only after the transaction succeeds.
    try {
      await clearCartIfMatchesOrder(userId, verifiedOrder);
    } catch (cartError) {
      console.error("CART CLEANUP ERROR:", cartError.message);
    }

    console.log("PAYMENT VERIFIED SUCCESSFULLY:", {
      orderId: String(verifiedOrder._id),
      paymentStatus: verifiedOrder.paymentStatus,
      status: verifiedOrder.status,
      inventoryDeducted: verifiedOrder.inventoryDeducted,
      alreadyProcessed,
    });

    return res.status(200).json({
      success: true,
      message: alreadyProcessed
        ? "Payment already verified."
        : "Payment verified and order placed successfully.",
      order: verifiedOrder,
    });
  } catch (error) {
    if (session) {
      await session.endSession().catch(() => {});
    }

    console.error("VERIFY PAYMENT ERROR:", error.message);

    if (error.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (error.message === "ORDER_ALREADY_PAID") {
      return res.status(409).json({
        success: false,
        message: "This order has already been paid.",
      });
    }

    if (
      error.message === "ORDER_NOT_PENDING" ||
      error.message === "INVENTORY_ALREADY_DEDUCTED"
    ) {
      return res.status(409).json({
        success: false,
        message: "The order is no longer eligible for processing.",
      });
    }

    if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
      // Razorpay has already confirmed capture at this point.
      // Do not silently mark the order paid when stock is unavailable.
      // The captured payment requires reconciliation/refund handling.
      return res.status(409).json({
        success: false,
        message:
          "Payment was captured, but stock is unavailable. The payment requires support review.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to verify payment.",
    });
  }
};

// ======================================================
// GET MY ORDERS
// GET /orders
// ======================================================

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
    });
  }
};

// ======================================================
// GET ONE ORDER OWNED BY THE AUTHENTICATED CUSTOMER
// GET /orders/:id
// ======================================================

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("GET ORDER ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order.",
    });
  }
};

// ======================================================
// BONUS: UPDATE ORDER STATUS
// PATCH /orders/:id/status
// Development-only shortcut for the lab.
// Production requires proper admin authorization.
// ======================================================

const updateOrderStatus = async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message:
          "Development status updates are disabled in production.",
      });
    }

    const { id } = req.params;
    const { status } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const allowedStatuses = [
      "CONFIRMED",
      "SHIPPED",
      "DELIVERED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid next status.",
        allowedStatuses,
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.paymentStatus !== "PAID") {
      return res.status(400).json({
        success: false,
        message:
          "Only paid orders can progress through fulfillment.",
      });
    }

    const nextStatus = {
      PLACED: "CONFIRMED",
      CONFIRMED: "SHIPPED",
      SHIPPED: "DELIVERED",
    };

    if (nextStatus[order.status] !== status) {
      return res.status(400).json({
        success: false,
        message: "Order status must advance one step at a time.",
        currentStatus: order.status,
        expectedNextStatus: nextStatus[order.status] || null,
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status.",
    });
  }
};

// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
