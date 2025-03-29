const express = require("express")
const { body } = require("express-validator")
const { getReviews, getTopReviews, createReview, voteReview } = require("../controllers/review.controller")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Get all reviews
router.get("/", getReviews)

// Get top reviews
router.get("/top", getTopReviews)

// Create review
router.post(
  "/",
  [
    body("movieId").notEmpty().withMessage("Movie ID is required"),
    body("rating").isInt({ min: 1, max: 10 }).withMessage("Rating must be between 1 and 10"),
    body("title").notEmpty().withMessage("Title is required"),
    body("content").isLength({ min: 10 }).withMessage("Content must be at least 10 characters long"),
  ],
  protect,
  createReview,
)

// Vote on review
router.post("/:id/vote", protect, voteReview)

module.exports = router

