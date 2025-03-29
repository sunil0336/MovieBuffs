const express = require("express")
const {
  getMovies,
  getMovie,
  getMovieReviews,
  getFilterOptions,
  searchMovies,
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

module.exports = router

