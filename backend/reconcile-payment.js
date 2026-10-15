
require("dotenv").config();

const Razorpay = require("razorpay");
const mongoose = require("mongoose");
const Order = require("./models/order.model");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const RAZORPAY_ORDER_ID = "order_TmzLUnsKks5QKZ";
const RAZORPAY_PAYMENT_ID = "pay_TmzLbSfounwQyx";

async function reconcilePayment() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Confirm the payment directly with Razorpay.
    const payment = await razorpay.payments.fetch(
      RAZORPAY_PAYMENT_ID
    );

    if (
      payment.id !== RAZORPAY_PAYMENT_ID ||
      payment.order_id !== RAZORPAY_ORDER_ID ||
      payment.status !== "captured" ||
      payment.currency !== "INR"
    ) {
      throw new Error(
        "Razorpay payment details did not pass verification."
      );
    }

    const order = await Order.findOne({
      razorpayOrderId: RAZORPAY_ORDER_ID,
    });

    if (!order) {
      throw new Error("Matching ShopKart order was not found.");
    }

    if (Math.round(order.totalAmount * 100) !== payment.amount) {
      throw new Error(
        "Razorpay amount does not match the ShopKart order amount."
      );
    }

    if (
      order.paymentStatus === "PAID" &&
      order.razorpayPaymentId === RAZORPAY_PAYMENT_ID
    ) {
      console.log("This payment is already reconciled.");
      return;
    }

    if (order.paymentStatus !== "PENDING") {
      throw new Error(
        `Order is not pending; current status is ${order.paymentStatus}.`
      );
    }

    // Record the verified payment.
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = RAZORPAY_PAYMENT_ID;

    await order.save();

    // Clear the cart only if its contents still match this order snapshot.
    const Customer = require("./models/customer.model");
    const customer = await Customer.findById(order.user);

    if (customer) {
      const cartMatchesOrder =
        customer.cart.length === order.items.length &&
        order.items.every((item) =>
          customer.cart.some(
            (cartItem) =>
              cartItem.product.toString() === item.product.toString() &&
              cartItem.quantity === item.quantity
          )
        );

      if (cartMatchesOrder) {
        customer.cart = [];
        await customer.save();
        console.log("Matching cart cleared.");
      } else {
        console.log(
          "Cart was left unchanged because it no longer matches this order."
        );
      }
    }

    console.log("Payment successfully reconciled.");
    console.log({
      orderAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
    });
  } catch (error) {
    console.error("RECONCILIATION FAILED:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

reconcilePayment();
