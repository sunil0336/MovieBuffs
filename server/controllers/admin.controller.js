const Movie = require("../models/Movie")
const Review = require("../models/Review")
const User = require("../models/User")

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get counts
    const totalMovies = await Movie.countDocuments()
    const totalReviews = await Review.countDocuments()
    const totalUsers = await User.countDocuments()

    // Get recent movies
    const recentMovies = await Movie.find().sort({ createdAt: -1 }).limit(5)

    // Get top rated movies
    const topRatedMovies = await Movie.find({ rating: { $gt: 0 } })
      .sort({ rating: -1 })
      .limit(5)

    // Get most reviewed movies
    const reviewCounts = await Review.aggregate([
      {
        $group: {
          _id: "$movieId",
          reviewCount: { $sum: 1 },
        },
      },
      { $sort: { reviewCount: -1 } },
      { $limit: 6 },
    ])

    // Get movie details for most reviewed
    const movieIds = reviewCounts.map((item) => item._id)
    const mostReviewedMoviesData = await Movie.find({ _id: { $in: movieIds } })

    // Combine review counts with movie data
    const mostReviewedMovies = reviewCounts.map((item) => {
      const movieData = mostReviewedMoviesData.find((movie) => movie._id.toString() === item._id.toString())
      return {
        ...movieData.toObject(),
        reviewCount: item.reviewCount,
      }
    })

    res.status(200).json({
      success: true,
      totalMovies,
      totalReviews,
      totalUsers,
      recentMovies,
      topRatedMovies,
      mostReviewedMovies,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get admin movies
// @route   GET /api/admin/movies
// @access  Private/Admin
exports.getMovies = async (req, res, next) => {
  try {
    const { search, genre, year, sort = "newest", page = 1, limit = 10 } = req.query

    // Build query
    const query = {}
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { director: { $regex: search, $options: "i" } },
        { cast: { $regex: search, $options: "i" } },
      ]
    }
    if (genre) query.genres = genre
    if (year) query.year = Number.parseInt(year)

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
      case "oldest":
        sortOptions = { createdAt: 1 }
        break
      default:
        sortOptions = { createdAt: -1 } // newest
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

// @desc    Get admin reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getReviews = async (req, res, next) => {
  try {
    const { search, minRating, sort = "newest", page = 1, limit = 10 } = req.query

    // Build query
    const query = {}
    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { content: { $regex: search, $options: "i" } }]
    }
    if (minRating) query.rating = { $gte: Number.parseInt(minRating) }

    // Determine sort order
    let sortOptions = {}
    switch (sort) {
      case "oldest":
        sortOptions = { createdAt: 1 }
        break
      case "highest":
        sortOptions = { rating: -1 }
        break
      case "lowest":
        sortOptions = { rating: 1 }
        break
      case "mostLiked":
        sortOptions = { "likes.length": -1 }
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

// @desc    Get admin users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, sort = "newest", page = 1, limit = 10 } = req.query

    // Build query
    const query = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }
    if (role) query.role = role

    // Determine sort order
    let sortOptions = {}
    switch (sort) {
      case "oldest":
        sortOptions = { createdAt: 1 }
        break
      case "name":
        sortOptions = { name: 1 }
        break
      case "mostReviews":
        // This requires aggregation, handled separately
        sortOptions = { createdAt: -1 }
        break
      default:
        sortOptions = { createdAt: -1 } // newest
    }

    // Pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Special case for sorting by review count
    if (sort === "mostReviews") {
      // Get review counts per user
      const reviewCounts = await Review.aggregate([
        {
          $group: {
            _id: "$userId",
            reviewCount: { $sum: 1 },
          },
        },
        { $sort: { reviewCount: -1 } },
      ])

      // Get user IDs in order
      const userIds = reviewCounts.map((item) => item._id)

      // Apply other filters
      let filteredUsers
      if (Object.keys(query).length > 0) {
        filteredUsers = await User.find(query).select("-password -resetPasswordToken -resetPasswordExpire")
        // Filter and sort by review count
        filteredUsers = filteredUsers
          .filter((user) => userIds.includes(user._id))
          .sort((a, b) => {
            const aIndex = userIds.indexOf(a._id)
            const bIndex = userIds.indexOf(b._id)
            return aIndex - bIndex
          })
      } else {
        // Get users by IDs in order
        filteredUsers = await User.find({ _id: { $in: userIds } }).select(
          "-password -resetPasswordToken -resetPasswordExpire",
        )
        // Sort by review count
        filteredUsers.sort((a, b) => {
          const aIndex = userIds.indexOf(a._id)
          const bIndex = userIds.indexOf(b._id)
          return aIndex - bIndex
        })
      }

      // Apply pagination
      const total = filteredUsers.length
      const paginatedUsers = filteredUsers.slice(skip, skip + Number.parseInt(limit))

      // Add review counts to user objects
      const usersWithReviewCounts = paginatedUsers.map((user) => {
        const reviewData = reviewCounts.find((item) => item._id.toString() === user._id.toString())
        return {
          ...user.toObject(),
          reviewCount: reviewData ? reviewData.reviewCount : 0,
        }
      })

      return res.status(200).json({
        success: true,
        count: usersWithReviewCounts.length,
        pagination: {
          total,
          page: Number.parseInt(page),
          pages: Math.ceil(total / Number.parseInt(limit)),
        },
        users: usersWithReviewCounts,
      })
    }

    // Regular query execution
    const users = await User.find(query)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number.parseInt(limit))

    // Get total count
    const total = await User.countDocuments(query)

    // Get review counts for these users
    const userIds = users.map((user) => user._id)
    const reviewCounts = await Review.aggregate([
      {
        $match: { userId: { $in: userIds } },
      },
      {
        $group: {
          _id: "$userId",
          reviewCount: { $sum: 1 },
        },
      },
    ])

    // Add review counts to user objects
    const usersWithReviewCounts = users.map((user) => {
      const reviewData = reviewCounts.find((item) => item._id.toString() === user._id.toString())
      return {
        ...user.toObject(),
        reviewCount: reviewData ? reviewData.reviewCount : 0,
      }
    })

    res.status(200).json({
      success: true,
      count: usersWithReviewCounts.length,
      pagination: {
        total,
        page: Number.parseInt(page),
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
      users: usersWithReviewCounts,
    })
  } catch (error) {
    next(error)
  }
}

