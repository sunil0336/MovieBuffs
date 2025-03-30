const express = require("express")
const router = express.Router()
const { protect, authorize } = require("../middleware/auth")
const { getDashboardStats, getMovies, getReviews, getUsers } = require("../controllers/admin.controller")

// All routes require authentication and admin role
router.use(protect)
router.use(authorize("admin"))

// Dashboard stats
router.get("/stats", getDashboardStats)

// Movies management
router.get("/movies", getMovies)

// Reviews management
router.get("/reviews", getReviews)

// Users management
router.get("/users", getUsers)

module.exports = router

