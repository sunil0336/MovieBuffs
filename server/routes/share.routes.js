const express = require("express")
const { shareMovie, shareReview } = require("../controllers/share.controller")

const router = express.Router()

// Share movie
router.get("/movie/:id", shareMovie)

// Share review
router.get("/review/:id", shareReview)

module.exports = router

