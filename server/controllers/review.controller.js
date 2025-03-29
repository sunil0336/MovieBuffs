const Review = require("../models/Review")
const Movie = require("../models/Movie")

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    const { sort = "newest", minRating = 0, page = 1, limit = 10 } = req.query

    // Build query
    const query = {}
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
      .populate("movieId", "title year poster")
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

// @desc    Get top reviews
// @route   GET /api/reviews/top
// @access  Public
exports.getTopReviews = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query

    const reviews = await Review.find({})
      .populate("userId", "name username profileImage")
      .populate("movieId", "title year poster")
      .sort({ helpfulCount: -1 })
      .limit(Number.parseInt(limit))

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { movieId, rating, title, content, containsSpoilers } = req.body

    // Check if movie exists
    const movie = await Movie.findById(movieId)
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: "Movie not found",
      })
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({
      movieId,
      userId: req.user.id,
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: "You have already reviewed this movie",
      })
    }

    // Create review
    const review = await Review.create({
      movieId,
      userId: req.user.id,
      rating: Number.parseInt(rating),
      title,
      content,
      containsSpoilers: !!containsSpoilers,
    })

    // Populate user data
    await review.populate("userId", "name username profileImage")

    // Update movie rating
    const allReviews = await Review.find({ movieId })
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / allReviews.length

    await Movie.findByIdAndUpdate(movieId, { rating: averageRating })

    res.status(201).json({
      success: true,
      review,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Vote on review (helpful/not helpful)
// @route   POST /api/reviews/:id/vote
// @access  Private
exports.voteReview = async (req, res, next) => {
  try {
    const { voteType } = req.body

    if (!voteType || (voteType !== "helpful" && voteType !== "not-helpful")) {
      return res.status(400).json({
        success: false,
        error: "Invalid vote type",
      })
    }

    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      })
    }

    // Simple implementation - in a real app, you'd track user votes in a separate collection
    if (voteType === "helpful") {
      review.helpfulCount += 1
    } else {
      review.notHelpfulCount += 1
    }

    await review.save()

    res.status(200).json({
      success: true,
      review,
    })
  } catch (error) {
    next(error)
  }
}

