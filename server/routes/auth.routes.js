const express = require("express")
const { body } = require("express-validator")
const {
  register,
  login,
  logout,
  getCurrentUser,
  sendOTP,
  resetPassword,
  resetPasswordWithOTP,
} = require("../controllers/auth.controller")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Register user
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please include a valid email"),
    body("username")
      .notEmpty()
      .withMessage("Username is required")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[^A-Za-z0-9]/)
      .withMessage("Password must contain at least one special character"),
  ],
  register,
)

// Login user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  login,
)

// Logout user
router.post("/logout", logout)

// Get current user
router.get("/me", protect, getCurrentUser)

// Forgot password
// @route POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Please enter a valid email")],
  sendOTP
)

// @route POST /api/auth/reset-password
router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("otp").notEmpty().withMessage("OTP is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
  ],
  resetPasswordWithOTP
)



module.exports = router

