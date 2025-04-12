const express = require("express")
const {
  getMovies,
  getMovie,
  getMovieReviews,
  getFilterOptions,
  searchMovies,
  createMovie,
  updateMovie,
  deleteMovie,
} = require("../controllers/movie.controller")

const router = express.Router()

// Get all movies
router.get("/", getMovies)

// Get filter options
router.get("/filters", getFilterOptions)

// Search movies
router.get("/search", searchMovies)

// Get single movie
router.get("/:id", getMovie)

// Get movie reviews
router.get("/:id/reviews", getMovieReviews)

// Add the auth middleware
const { protect, authorize } = require("../middleware/auth")

// Admin routes
router.post("/", protect, authorize("admin"), createMovie)
router.put("/:id", protect, authorize("admin"), updateMovie)
router.delete("/:id", protect, authorize("admin"), deleteMovie)

module.exports = router
