const { verifyToken } = require("../utils/jwt")

// Protect routes - require authentication
exports.protect = (req, res, next) => {
  let token

  // Get token from cookies or authorization header
  if (req.cookies.token) {
    token = req.cookies.token
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to access this route",
    })
  }

  try {
    // Verify token
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      })
    }

    // Add user to request
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to access this route",
    })
  }
}

// Authorize by role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "User role not authorized to access this route",
      })
    }
    next()
  }
}

