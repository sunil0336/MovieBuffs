const express = require("express")
// const { getNews, getSingleNews, createNews, updateNews, deleteNews } = require("../controllers/news.controller")
const { getNews, getSingleNews, createNews, updateNews, deleteNews } = require("../controllers/news.Controller")
const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// Public routes
router.get("/", getNews)
router.get("/:id", getSingleNews)

// Admin routes
router.post("/", protect, authorize("admin"), createNews)
router.put("/:id", protect, authorize("admin"), updateNews)
router.delete("/:id", protect, authorize("admin"), deleteNews)

module.exports = router
