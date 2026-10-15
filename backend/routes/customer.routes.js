const express = require("express");

const {
  registerCustomer,
  loginCustomer,
  getMe,
  logoutCustomer,
  changePassword,
} = require("../controllers/customer.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// ======================================================
// PUBLIC ROUTES
// ======================================================

router.post("/register", registerCustomer);

router.post("/login", loginCustomer);

// ======================================================
// PROTECTED ROUTES
// ======================================================

router.get("/me", authMiddleware, getMe);

router.post("/logout", authMiddleware, logoutCustomer);

router.patch(
  "/change-password",
  authMiddleware,
  changePassword
);

module.exports = router;