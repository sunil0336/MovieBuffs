const User = require("../models/User")
const { generateToken } = require("../utils/jwt")
const { validationResult } = require("express-validator")
const crypto = require("crypto")
const sendEmail = require("../utils/email")

// Set cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { name, email, username, password } = req.body

    // Check if email already exists
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({
        success: false,
        error: "Email already in use",
      })
    }

    // Check if username already exists
    user = await User.findOne({ username })
    if (user) {
      return res.status(400).json({
        success: false,
        error: "Username already taken",
      })
    }

    // Create user
    user = await User.create({
      name,
      email,
      username,
      password,
    })

    // Generate token
    const token = generateToken(user)

    // Set cookie and send response
    res.cookie("token", token, cookieOptions)

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      })
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      })
    }

    // Generate token
    const token = generateToken(user)

    // Set cookie and send response
    res.cookie("token", token, cookieOptions)

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  })

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  })
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
        bio: user.bio,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { email } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User with that email does not exist",
      })
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

    // Create email message
    const message = `
      You are receiving this email because you (or someone else) has requested the reset of a password.
      Please click on the following link to reset your password:
      \n\n${resetUrl}\n\n
      This link will expire in 10 minutes.
      If you did not request this, please ignore this email and your password will remain unchanged.
    `

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Token",
        message,
      })

      res.status(200).json({
        success: true,
        message: "Email sent",
      })
    } catch (error) {
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined

      await user.save({ validateBeforeSave: false })

      return res.status(500).json({
        success: false,
        error: "Email could not be sent",
      })
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Verify reset token
// @route   GET /api/auth/reset-password/:token
// @access  Public
exports.verifyResetToken = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    // Find user by token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired token",
      })
    }

    res.status(200).json({
      success: true,
      message: "Token is valid",
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    // Get hashed token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    // Find user by token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired token",
      })
    }

    // Set new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    // Generate token
    const token = generateToken(user)

    // Set cookie and send response
    res.cookie("token", token, cookieOptions)

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    })
  } catch (error) {
    next(error)
  }
}

