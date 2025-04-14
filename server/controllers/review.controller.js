const Review = require("../models/Review")
const Movie = require("../models/Movie")
const mongoose = require("mongoose")

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
      case "mostLiked":
        sortOptions = { "likes.length": -1 }
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
// GET /reviews/top?limit=10&sort=mostLiked / mostDisliked / highestRating
exports.getTopReviews = async (req, res, next) => {
  try {
    const { limit = 10, sort = "mostLiked" } = req.query

    let sortOption = {}

    switch (sort) {
      case "mostLiked":
        sortOption = { likesCount: -1 }
        break
      case "mostDisliked":
        sortOption = { dislikesCount: -1 }
        break
      case "topRating":
        sortOption = { rating: -1 }
        break
      default:
        sortOption = { likesCount: -1 }
    }

    // Aggregate reviews with calculated counts
    const reviews = await Review.aggregate([
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likes", []] } },
          dislikesCount: { $size: { $ifNull: ["$dislikes", []] } },
        },
      },
      { $sort: sortOption },
      { $limit: parseInt(limit) },
    ])

    // Populate movieId and userId (manual population after aggregation)
    const populatedReviews = await Review.populate(reviews, [
      { path: "movieId", select: "title poster" },
      { path: "userId", select: "name" },
    ])

    res.json({ reviews: populatedReviews })
  } catch (error) {
    next(error)
  }
}


// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("userId", "name username profileImage")
      .populate("movieId", "title year poster")
      .populate("comments.user", "name username profileImage")

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      })
    }

    res.status(200).json({
      success: true,
      review,
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

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, title, content, containsSpoilers } = req.body

    // Find review
    let review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      })
    }

    // Check if user owns the review
    if (review.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this review",
      })
    }

    // Update review
    review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        rating: Number.parseInt(rating),
        title,
        content,
        containsSpoilers: !!containsSpoilers,
      },
      { new: true, runValidators: true },
    ).populate("userId", "name username profileImage")

    // Update movie rating
    const movieId = review.movieId
    const allReviews = await Review.find({ movieId })
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / allReviews.length

    await Movie.findByIdAndUpdate(movieId, { rating: averageRating })

    res.status(200).json({
      success: true,
      review,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    // Find review
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      })
    }

    // Check if user owns the review or is admin
    if (review.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this review",
      })
    }

    // Get movie ID before deleting review
    const movieId = review.movieId

    // Delete review
    await review.deleteOne()

    // Update movie rating
    const allReviews = await Review.find({ movieId })

    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / allReviews.length
      await Movie.findByIdAndUpdate(movieId, { rating: averageRating })
    } else {
      // No reviews left, reset rating to 0
      await Movie.findByIdAndUpdate(movieId, { rating: 0 })
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Like review
// @route   PUT /api/reviews/:id/like
// @access  Private
exports.likeReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      })
    }

    // Check if review has already been liked by user
    if (review.likes.includes(req.user.id)) {
      // Remove like
      review.likes = review.likes.filter((like) => like.toString() !== req.user.id)
    } else {
      // Add like
      review.likes.push(req.user.id)

      // Remove from dislikes if present
      review.dislikes = review.dislikes.filter((dislike) => dislike.toString() !== req.user.id)
    }

    await review.save()

    res.status(200).json({
      success: true,
      likes: review.likes.length,
      dislikes: review.dislikes.length,
      userLiked: review.likes.includes(req.user.id),
      userDisliked: review.dislikes.includes(req.user.id),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Dislike review
// @route   PUT /api/reviews/:id/dislike
// @access  Private
exports.dislikeReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      })
    }

    // Check if review has already been disliked by user
    if (review.dislikes.includes(req.user.id)) {
      // Remove dislike
      review.dislikes = review.dislikes.filter((dislike) => dislike.toString() !== req.user.id)
    } else {
      // Add dislike
      review.dislikes.push(req.user.id)

      // Remove from likes if present
      review.likes = review.likes.filter((like) => like.toString() !== req.user.id)
    }

    await review.save()

    res.status(200).json({
      success: true,
      likes: review.likes.length,
      dislikes: review.dislikes.length,
      userLiked: review.likes.includes(req.user.id),
      userDisliked: review.dislikes.includes(req.user.id),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Add comment to review
// @route   POST /api/reviews/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "Comment text is required",
      })
    }

    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      })
    }

    // Add comment
    const newComment = {
      user: req.user.id,
      text,
    }

    review.comments.unshift(newComment)
    await review.save()

    // Populate user data in the new comment
    await review.populate("comments.user", "name username profileImage")

    res.status(201).json({
      success: true,
      comments: review.comments,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete comment from review
// @route   DELETE /api/reviews/:id/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      })
    }

    // Find comment
    const comment = review.comments.find((comment) => comment._id.toString() === req.params.commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      })
    }

    // Check if user is comment owner or admin
    if (comment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this comment",
      })
    }

    // Remove comment
    review.comments = review.comments.filter((comment) => comment._id.toString() !== req.params.commentId)

    await review.save()

    res.status(200).json({
      success: true,
      comments: review.comments,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get user reviews
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query

    // Pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Execute query with population
    const reviews = await Review.find({ userId: req.params.userId })
      .populate("movieId", "title year poster")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    // Get total count
    const total = await Review.countDocuments({ userId: req.params.userId })

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

