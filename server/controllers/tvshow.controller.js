const TvShowReview = require("../models/TvShowReview") // UPDATED: Using dedicated TvShowReview model
const TvShow = require("../models/TvShow")
const mongoose = require("mongoose")

// @desc    Get all TV shows
// @route   GET /api/tvshows
// @access  Public
exports.getTvShows = async (req, res, next) => {
  try {
    const { search, genre, sort = "newest", page = 1, limit = 12 } = req.query

    // Build query
    const query = {}
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { creators: { $regex: search, $options: "i" } },
        { cast: { $regex: search, $options: "i" } },
      ]
    }
    if (genre) query.genres = genre

    // Determine sort order
    let sortOptions = {}
    switch (sort) {
      case "title":
        sortOptions = { title: 1 }
        break
      case "rating":
        sortOptions = { rating: -1 }
        break
      case "firstAirDate":
        sortOptions = { firstAirDate: -1 }
        break
      case "oldest":
        sortOptions = { createdAt: 1 }
        break
      default:
        sortOptions = { createdAt: -1 } // newest
    }

    // Pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Execute query
    const tvshows = await TvShow.find(query).sort(sortOptions).skip(skip).limit(Number.parseInt(limit))

    // Get total count
    const total = await TvShow.countDocuments(query)

    res.status(200).json({
      success: true,
      count: tvshows.length,
      pagination: {
        total,
        page: Number.parseInt(page),
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
      tvshows,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single TV show
// @route   GET /api/tvshows/:id
// @access  Public
exports.getTvShow = async (req, res, next) => {
  try {
    const tvshow = await TvShow.findById(req.params.id)

    if (!tvshow) {
      return res.status(404).json({
        success: false,
        error: "TV show not found",
      })
    }

    res.status(200).json({
      success: true,
      tvshow,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create TV show
// @route   POST /api/tvshows
// @access  Private/Admin
exports.createTvShow = async (req, res, next) => {
  try {
    const tvshow = await TvShow.create(req.body)

    res.status(201).json({
      success: true,
      tvshow,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update TV show
// @route   PUT /api/tvshows/:id
// @access  Private/Admin
exports.updateTvShow = async (req, res, next) => {
  try {
    let tvshow = await TvShow.findById(req.params.id)

    if (!tvshow) {
      return res.status(404).json({
        success: false,
        error: "TV show not found",
      })
    }

    tvshow = await TvShow.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      tvshow,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete TV show
// @route   DELETE /api/tvshows/:id
// @access  Private/Admin
exports.deleteTvShow = async (req, res, next) => {
  try {
    const tvshow = await TvShow.findById(req.params.id)

    if (!tvshow) {
      return res.status(404).json({
        success: false,
        error: "TV show not found",
      })
    }

    // Delete all reviews for this TV show
    await TvShowReview.deleteMany({ tvShowId: req.params.id })

    // Delete the TV show
    await tvshow.deleteOne()

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get TV show reviews
// @route   GET /api/tvshows/:id/reviews
// @access  Public
exports.getTvShowReviews = async (req, res, next) => {
  try {
    const { sort = "newest", page = 1, limit = 10 } = req.query

    // Determine sort order
    let sortOptions = {}
    switch (sort) {
      case "highest":
        sortOptions = { rating: -1 }
        break
      case "lowest":
        sortOptions = { rating: 1 }
        break
      case "oldest":
        sortOptions = { createdAt: 1 }
        break
      case "mostHelpful":
        sortOptions = { helpfulCount: -1 }
        break
      default:
        sortOptions = { createdAt: -1 } // newest
    }

    // Pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // UPDATED: Using TvShowReview model instead of Review
    // Execute query with population
    const reviews = await TvShowReview.find({ tvShowId: req.params.id })
      .populate("userId", "name username profileImage")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number.parseInt(limit))

    // Get total count
    const total = await TvShowReview.countDocuments({ tvShowId: req.params.id })

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

// @desc    Search TV shows
// @route   GET /api/tvshows/search
// @access  Public
exports.searchTvShows = async (req, res, next) => {
  try {
    const { q } = req.query

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Please provide a search term",
      })
    }

    const tvshows = await TvShow.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { creators: { $regex: q, $options: "i" } },
        { cast: { $regex: q, $options: "i" } },
      ],
    }).limit(10)

    res.status(200).json({
      success: true,
      count: tvshows.length,
      tvshows,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get TV show genres
// @route   GET /api/tvshows/genres
// @access  Public
exports.getTvShowGenres = async (req, res, next) => {
  try {
    const genres = await TvShow.distinct("genres")

    res.status(200).json({
      success: true,
      count: genres.length,
      genres,
    })
  } catch (error) {
    next(error)
  }
}
