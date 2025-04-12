const express = require("express")
const {
  getTvShows,
  getTvShow,
  createTvShow,
  updateTvShow,
  deleteTvShow,
  getTvShowReviews,
  searchTvShows,
  getTvShowGenres,
} = require("../controllers/tvshow.controller")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// Search route
router.get("/search", searchTvShows)

// Genres route
router.get("/genres", getTvShowGenres)

// TV show routes
router.route("/").get(getTvShows).post(protect, authorize("admin"), createTvShow)

router
  .route("/:id")
  .get(getTvShow)
  .put(protect, authorize("admin"), updateTvShow)
  .delete(protect, authorize("admin"), deleteTvShow)

// TV show reviews
router.get("/:id/reviews", getTvShowReviews)

module.exports = router
