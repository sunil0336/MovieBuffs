const User = require("../models/User")
const { generateToken } = require("../utils/jwt")
const { validationResult } = require("express-validator")
const bcrypt = require("bcryptjs")

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

/////////////////////////////

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

// @desc    Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.sendOTP = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    const otp = generateOTP()
    const otpExpire = Date.now() + 10 * 60 * 1000 // 10 mins

    user.otp = otp
    user.otpExpire = otpExpire
    await user.save()

    console.log(`Generated OTP for ${email}:`, otp)

    res.status(200).json({ success: true, message: "OTP generated. Check console for testing." })
  } catch (error) {
    next(error)
  }
}

// @desc    Verify OTP and reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPasswordWithOTP = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { email, otp, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    if (!user.otp || user.otpExpire < Date.now() || user.otp !== otp) {
      return res.status(400).json({ success: false, error: "Invalid or expired OTP" })
    }

    user.password = password
    user.otp = undefined
    user.otpExpire = undefined

    await user.save()

    res.status(200).json({ success: true, message: "Password reset successful" })
  } catch (error) {
    next(error)
  }
}



// exports.forgotPassword = async (req, res, next) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });

//   if (!user) {
//     return res.status(404).json({ success: false, error: "User not found" });
//   }

//   // Generate 6-digit OTP
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   user.otp = otp;
//   user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
//   await user.save();

//   console.log("OTP for password reset:", otp);

//   res.status(200).json({
//     success: true,
//     message: "OTP has been generated and logged to the server.",
//   });
// };


// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
