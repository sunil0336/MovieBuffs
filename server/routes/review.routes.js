const express = require("express")
const { body } = require("express-validator")
const {
  getReviews,
  getTopReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  dislikeReview,
  addComment,
  deleteComment,
  getUserReviews,
  voteReview,
} = require("../controllers/review.controller")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Get all reviews
router.get("/", getReviews)

// Get top reviews
router.get("/top", getTopReviews)

// Get user reviews
router.get("/user/:userId", getUserReviews)

// Get single review
router.get("/:id", getReview)

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

// Update review
router.put(
  "/:id",
  [
    body("rating").isInt({ min: 1, max: 10 }).withMessage("Rating must be between 1 and 10"),
    body("title").notEmpty().withMessage("Title is required"),
    body("content").isLength({ min: 10 }).withMessage("Content must be at least 10 characters long"),
  ],
  protect,
  updateReview,
)

// Delete review
router.delete("/:id", protect, deleteReview)

// Like review
router.put("/:id/like", protect, likeReview)

// Dislike review
router.put("/:id/dislike", protect, dislikeReview)

// Add comment to review
router.post("/:id/comments", [body("text").notEmpty().withMessage("Comment text is required")], protect, addComment)

// Delete comment from review
router.delete("/:id/comments/:commentId", protect, deleteComment)

// Vote on review
router.post("/:id/vote", protect, voteReview)

module.exports = router

