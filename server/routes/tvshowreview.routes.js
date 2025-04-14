const express = require("express")
const { body } = require("express-validator")
const {
  getTvShowReviews,
  getTopTvShowReviews,
  getTvShowReview,
  createTvShowReview,
  updateTvShowReview,
  deleteTvShowReview,
  likeTvShowReview,
  dislikeTvShowReview,
  addComment,
  deleteComment,
  getUserTvShowReviews,
  voteReview,
} = require("../controllers/tvshowreview.controller")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Get all TV show reviews
router.get("/", getTvShowReviews)

// Get top TV show reviews
router.get("/top", getTopTvShowReviews)

// Get user TV show reviews
router.get("/user/:userId", getUserTvShowReviews)

// Get single TV show review
router.get("/:id", getTvShowReview)

// Create TV show review
router.post(
  "/",
  [
    body("tvShowId").notEmpty().withMessage("TV Show ID is required"),
    body("rating").isInt({ min: 1, max: 10 }).withMessage("Rating must be between 1 and 10"),
    body("title").notEmpty().withMessage("Title is required"),
    body("content").isLength({ min: 10 }).withMessage("Content must be at least 10 characters long"),
  ],
  protect,
  createTvShowReview,
)

// Update TV show review
router.put(
  "/:id",
  [
    body("rating").isInt({ min: 1, max: 10 }).withMessage("Rating must be between 1 and 10"),
    body("title").notEmpty().withMessage("Title is required"),
    body("content").isLength({ min: 10 }).withMessage("Content must be at least 10 characters long"),
  ],
  protect,
  updateTvShowReview,
)

// Delete TV show review
router.delete("/:id", protect, deleteTvShowReview)

// Like TV show review
router.put("/:id/like", protect, likeTvShowReview)

// Dislike TV show review
router.put("/:id/dislike", protect, dislikeTvShowReview)

// Add comment to TV show review
router.post("/:id/comments", [body("text").notEmpty().withMessage("Comment text is required")], protect, addComment)

// Delete comment from TV show review
router.delete("/:id/comments/:commentId", protect, deleteComment)

// Vote on TV show review
router.post("/:id/vote", protect, voteReview)

module.exports = router
