const Movie = require("../models/Movie")
const Review = require("../models/Review")

// @desc    Get all movies with filters
// @route   GET /api/movies
// @access  Public
exports.getMovies = async (req, res, next) => {
  try {
    const { genre, language, year, category, page = 1, limit = 12, sort = "releaseDate" } = req.query

    // Build query
    const query = {}
    if (genre) query.genres = genre
    if (language) query.language = language
    if (year) query.year = Number.parseInt(year)
    if (category) query.category = category

    // Determine sort order
    let sortOptions = {}
    switch (sort) {
      case "title":
        sortOptions = { title: 1 }
        break
      case "rating":
        sortOptions = { rating: -1 }
        break
      case "year":
        sortOptions = { year: -1 }
        break
      default:
        sortOptions = { releaseDate: -1 }
    }

    // Pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Execute query
    const movies = await Movie.find(query).sort(sortOptions).skip(skip).limit(Number.parseInt(limit))

    // Get total count
    const total = await Movie.countDocuments(query)

    res.status(200).json({
      success: true,
      count: movies.length,
      pagination: {
        total,
        page: Number.parseInt(page),
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
      movies,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
exports.getMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id)

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: "Movie not found",
      })
    }

    res.status(200).json({
      success: true,
      movie,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get movie reviews
// @route   GET /api/movies/:id/reviews
// @access  Public
exports.getMovieReviews = async (req, res, next) => {
  try {
    const { sort = "newest", minRating = 0, page = 1, limit = 10 } = req.query

    // Build query
    const query = { movieId: req.params.id }
    if (minRating > 0) query.rating = { $gte: Number.parseInt(minRating) }

    // Determine sort order
    let sortOptions = {}
    switch (sort) {
      case "highest":
        sortOptions = { rating: -1 }
        break
      case "lowest":
        sortOptions = { rating: 1 }
        break
      case "mostHelpful":
        sortOptions = { helpfulCount: -1 }
        break
      default:
        sortOptions = { createdAt: -1 } // newest
    }

    // Pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Execute query with population
    const reviews = await Review.find(query)
      .populate("userId", "name username profileImage")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number.parseInt(limit))

    // Get total count
    const total = await Review.countDocuments(query)

    res.status(200).json({
      success: true,
      count: reviews.length,
      pagination: {
        total,
        page: Number.parseInt(page),
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
      reviews,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get filter options (genres, languages, years)
// @route   GET /api/movies/filters
// @access  Public
exports.getFilterOptions = async (req, res, next) => {
  try {
    // Get distinct genres
    const genres = await Movie.distinct("genres")

    // Get distinct languages
    const languages = await Movie.distinct("language")

    // Get min and max years
    const yearStats = await Movie.aggregate([
      {
        $group: {
          _id: null,
          minYear: { $min: "$year" },
          maxYear: { $max: "$year" },
        },
      },
    ])

    const years = []
    if (yearStats.length > 0) {
      const { minYear, maxYear } = yearStats[0]
      for (let year = maxYear; year >= minYear; year--) {
        years.push(year)
      }
    }

    res.status(200).json({
      success: true,
      filters: {
        genres: genres.sort(),
        languages: languages.sort(),
        years,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Search movies
// @route   GET /api/movies/search
// @access  Public
exports.searchMovies = async (req, res, next) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(200).json({
        success: true,
        movies: [],
      })
    }

    const movies = await Movie.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { cast: { $regex: q, $options: "i" } },
        { director: { $regex: q, $options: "i" } },
      ],
    }).limit(10)

    res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    })
  } catch (error) {
    next(error)
  }
}

