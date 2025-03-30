const User = require("../models/User")
const Review = require("../models/Review")
const Movie = require("../models/Movie")
const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password -resetPasswordToken -resetPasswordExpire")

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { name, username, bio, profileImage } = req.body

    // Check if username is already taken (if changed)
    if (username) {
      const existingUser = await User.findOne({ username })
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({
          success: false,
          error: "Username already taken",
        })
      }
    }

    // Update user
    const updatedFields = {}
    if (name) updatedFields.name = name
    if (username) updatedFields.username = username
    if (bio !== undefined) updatedFields.bio = bio
    if (profileImage !== undefined) updatedFields.profileImage = profileImage

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedFields },
      { new: true, runValidators: true },
    ).select("-password -resetPasswordToken -resetPasswordExpire")

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { currentPassword, newPassword } = req.body

    // Get user
    const user = await User.findById(req.user.id)

    // Check current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Add movie to watchlist
// @route   PUT /api/users/watchlist/:movieId
// @access  Private
exports.addToWatchlist = async (req, res, next) => {
  try {
    // Check if movie exists
    const movie = await Movie.findById(req.params.movieId)
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: "Movie not found",
      })
    }

    // Get user
    const user = await User.findById(req.user.id)

    // Check if movie is already in watchlist
    if (user.watchlist.includes(req.params.movieId)) {
      return res.status(400).json({
        success: false,
        error: "Movie already in watchlist",
      })
    }

    // Add to watchlist
    user.watchlist.push(req.params.movieId)
    await user.save()

    res.status(200).json({
      success: true,
      message: "Movie added to watchlist",
      watchlist: user.watchlist,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Remove movie from watchlist
// @route   DELETE /api/users/watchlist/:movieId
// @access  Private
exports.removeFromWatchlist = async (req, res, next) => {
  try {
    // Get user
    const user = await User.findById(req.user.id)

    // Check if movie is in watchlist
    if (!user.watchlist.includes(req.params.movieId)) {
      return res.status(400).json({
        success: false,
        error: "Movie not in watchlist",
      })
    }

    // Remove from watchlist
    user.watchlist = user.watchlist.filter((movie) => movie.toString() !== req.params.movieId)
    await user.save()

    res.status(200).json({
      success: true,
      message: "Movie removed from watchlist",
      watchlist: user.watchlist,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get user watchlist
// @route   GET /api/users/watchlist
// @access  Private
exports.getWatchlist = async (req, res, next) => {
  try {
    // Get user with populated watchlist
    const user = await User.findById(req.user.id).populate("watchlist")

    res.status(200).json({
      success: true,
      watchlist: user.watchlist,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Check if movie is in user's watchlist
// @route   GET /api/users/watchlist/:movieId/check
// @access  Private
exports.checkWatchlist = async (req, res, next) => {
  try {
    // Get user
    const user = await User.findById(req.user.id)

    // Check if movie is in watchlist
    const isInWatchlist = user.watchlist.includes(req.params.movieId)

    res.status(200).json({
      success: true,
      isInWatchlist,
    })
  } catch (error) {
    next(error)
  }
}

