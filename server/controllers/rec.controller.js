// controllers/movieController.js

const Movie = require("../models/Movie")

exports.getRecommendations = async (req, res, next) => {
  try {
    const { movieId } = req.params
    const limit = parseInt(req.query.limit) || 6

    if (!movieId) {
      return res.status(400).json({ success: false, message: "Movie ID is required" })
    }

    // Step 1: Get current movie
    const currentMovie = await Movie.findById(movieId)

    if (!currentMovie) {
      return res.status(404).json({ success: false, message: "Movie not found" })
    }

    const genresToMatch = currentMovie.genres?.slice(0, 2) || []

    if (genresToMatch.length === 0) {
      return res.status(200).json({ success: true, recommendations: [] })
    }

    // Step 2: Fetch recommendations by matching genres
    const recommendedMovies = await Movie.find({
      _id: { $ne: movieId },
      genres: { $in: genresToMatch },
    })
      .sort({ rating: -1 })
      .limit(limit)

    res.status(200).json({
      success: true,
      recommendations: recommendedMovies,
    })
  } catch (error) {
    console.error("Recommendation error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}
