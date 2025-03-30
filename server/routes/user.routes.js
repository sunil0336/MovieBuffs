// const express = require("express")
// const { protect } = require("../middleware/auth")

// const router = express.Router()

// // Routes will be implemented as needed

// module.exports = router

const express = require("express")
const { body } = require("express-validator")
const {
  getUserProfile,
  updateProfile,
  changePassword,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  checkWatchlist,
} = require("../controllers/user.controller")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Get user profile
router.get("/:id", getUserProfile)

// Update user profile
router.put(
  "/profile",
  [
    body("name").optional().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
    body("username")
      .optional()
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores"),
    body("bio").optional().isLength({ max: 200 }).withMessage("Bio cannot exceed 200 characters"),
  ],
  protect,
  updateProfile,
)

// Change password
router.put(
  "/change-password",
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
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
  protect,
  changePassword,
)

// Watchlist routes
router.get("/watchlist", protect, getWatchlist)
router.put("/watchlist/:movieId", protect, addToWatchlist)
router.delete("/watchlist/:movieId", protect, removeFromWatchlist)
router.get("/watchlist/:movieId/check", protect, checkWatchlist)

module.exports = router

