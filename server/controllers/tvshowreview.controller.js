const TvShowReview = require("../models/TvShowReview")
const TvShow = require("../models/TvShow")
const mongoose = require("mongoose")

// @desc    Get all TV show reviews
// @route   GET /api/tvshowreviews
// @access  Public
exports.getTvShowReviews = async (req, res, next) => {
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
    const reviews = await TvShowReview.find(query)
      .populate("userId", "name username profileImage")
      .populate("tvShowId", "title firstAirDate poster")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number.parseInt(limit))

    // Get total count
    const total = await TvShowReview.countDocuments(query)

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

// @desc    Get top TV show reviews
// @route   GET /api/tvshowreviews/top
// @access  Public
exports.getTopTvShowReviews = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query

    const reviews = await TvShowReview.find({})
      .populate("userId", "name username profileImage")
      .populate("tvShowId", "title firstAirDate poster")
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

// @desc    Get single TV show review
// @route   GET /api/tvshowreviews/:id
// @access  Public
exports.getTvShowReview = async (req, res, next) => {
  try {
    const review = await TvShowReview.findById(req.params.id)
      .populate("userId", "name username profileImage")
      .populate("tvShowId", "title firstAirDate poster")
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

// @desc    Create TV show review
// @route   POST /api/tvshowreviews
// @access  Private
exports.createTvShowReview = async (req, res, next) => {
  try {
    const { tvShowId, rating, title, content, containsSpoilers } = req.body

    // Check if TV show exists
    const tvShow = await TvShow.findById(tvShowId)
    if (!tvShow) {
      return res.status(404).json({
        success: false,
        error: "TV show not found",
      })
    }

    // Check if user already reviewed this TV show
    const existingReview = await TvShowReview.findOne({
      tvShowId,
      userId: req.user.id,
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: "You have already reviewed this TV show",
      })
    }

    // Create review
    const review = await TvShowReview.create({
      tvShowId,
      userId: req.user.id,
      rating: Number.parseInt(rating),
      title,
      content,
      containsSpoilers: !!containsSpoilers,
    })

    // Populate user data
    await review.populate("userId", "name username profileImage")

    // Update TV show rating
    const allReviews = await TvShowReview.find({ tvShowId })
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / allReviews.length

    await TvShow.findByIdAndUpdate(tvShowId, { rating: averageRating })

    res.status(201).json({
      success: true,
      review,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update TV show review
// @route   PUT /api/tvshowreviews/:id
// @access  Private
exports.updateTvShowReview = async (req, res, next) => {
  try {
    const { rating, title, content, containsSpoilers } = req.body

    // Find review
    let review = await TvShowReview.findById(req.params.id)

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
    review = await TvShowReview.findByIdAndUpdate(
      req.params.id,
      {
        rating: Number.parseInt(rating),
        title,
        content,
        containsSpoilers: !!containsSpoilers,
      },
      { new: true, runValidators: true },
    ).populate("userId", "name username profileImage")

    // Update TV show rating
    const tvShowId = review.tvShowId
    const allReviews = await TvShowReview.find({ tvShowId })
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / allReviews.length

    await TvShow.findByIdAndUpdate(tvShowId, { rating: averageRating })

    res.status(200).json({
      success: true,
      review,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete TV show review
// @route   DELETE /api/tvshowreviews/:id
// @access  Private
exports.deleteTvShowReview = async (req, res, next) => {
  try {
    // Find review
    const review = await TvShowReview.findById(req.params.id)

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

    // Get TV show ID before deleting review
    const tvShowId = review.tvShowId

    // Delete review - FIXED: Using remove() method instead of deleteOne()
    await TvShowReview.findByIdAndDelete(req.params.id)

    // Update TV show rating
    const allReviews = await TvShowReview.find({ tvShowId })

    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / allReviews.length
      await TvShow.findByIdAndUpdate(tvShowId, { rating: averageRating })
    } else {
      // No reviews left, reset rating to 0
      await TvShow.findByIdAndUpdate(tvShowId, { rating: 0 })
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Like TV show review
// @route   PUT /api/tvshowreviews/:id/like
// @access  Private
exports.likeTvShowReview = async (req, res, next) => {
  try {
    const review = await TvShowReview.findById(req.params.id)

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

// @desc    Dislike TV show review
// @route   PUT /api/tvshowreviews/:id/dislike
// @access  Private
exports.dislikeTvShowReview = async (req, res, next) => {
  try {
    const review = await TvShowReview.findById(req.params.id)

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

// @desc    Add comment to TV show review
// @route   POST /api/tvshowreviews/:id/comments
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

    const review = await TvShowReview.findById(req.params.id)

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

// @desc    Delete comment from TV show review
// @route   DELETE /api/tvshowreviews/:id/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const review = await TvShowReview.findById(req.params.id)

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

// @desc    Get user TV show reviews
// @route   GET /api/tvshowreviews/user/:userId
// @access  Public
exports.getUserTvShowReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query

    // Pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Execute query with population
    const reviews = await TvShowReview.find({ userId: req.params.userId })
      .populate("tvShowId", "title firstAirDate poster")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))

    // Get total count
    const total = await TvShowReview.countDocuments({ userId: req.params.userId })

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

// @desc    Vote on TV show review (helpful/not helpful)
// @route   POST /api/tvshowreviews/:id/vote
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

    const review = await TvShowReview.findById(req.params.id)

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
