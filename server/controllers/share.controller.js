const Movie = require("../models/Movie")
const Review = require("../models/Review")
const { createCanvas, loadImage } = require("canvas")
const fs = require("fs")
const path = require("path")

// @desc    Generate shareable image for a movie
// @route   GET /api/share/movie/:id
// @access  Public
exports.shareMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id)

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: "Movie not found",
      })
    }

    // Create canvas
    const canvas = createCanvas(800, 600)
    const ctx = canvas.getContext("2d")

    // Draw background
    ctx.fillStyle = "#4c1d95"
    ctx.fillRect(0, 0, 800, 600)

    // Draw movie poster
    try {
      const posterPath = movie.poster.startsWith("/")
        ? path.join(__dirname, "..", "public", movie.poster)
        : movie.poster

      const image = await loadImage(posterPath)
      ctx.drawImage(image, 50, 100, 200, 300)
    } catch (error) {
      console.error("Error loading poster image:", error)
      // Draw placeholder if image fails to load
      ctx.fillStyle = "#5b21b6"
      ctx.fillRect(50, 100, 200, 300)
      ctx.fillStyle = "#ffffff"
      ctx.font = "20px Arial"
      ctx.fillText("No Image", 100, 250)
    }

    // Draw movie details
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 30px Arial"
    ctx.fillText(movie.title, 300, 150)

    ctx.font = "20px Arial"
    ctx.fillText(`Year: ${movie.year}`, 300, 200)
    ctx.fillText(`Rating: ${movie.rating.toFixed(1)}/10`, 300, 230)
    ctx.fillText(`Director: ${movie.director}`, 300, 260)
    ctx.fillText(`Language: ${movie.language}`, 300, 290)

    // Draw genres
    ctx.fillText("Genres:", 300, 330)
    movie.genres.forEach((genre, index) => {
      ctx.fillStyle = "#facc15"
      ctx.fillRect(300 + index * 110, 340, 100, 30)
      ctx.fillStyle = "#000000"
      ctx.fillText(genre, 310 + index * 110, 360)
    })

    // Draw website info
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 20px Arial"
    ctx.fillText("Crictistaan - Movie Reviews", 300, 500)

    // Convert canvas to buffer
    const buffer = canvas.toBuffer("image/png")

    // Set response headers
    res.set({
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${movie.title.replace(/\s+/g, "_")}_share.png"`,
    })

    // Send image
    res.send(buffer)
  } catch (error) {
    next(error)
  }
}

// @desc    Generate shareable image for a review
// @route   GET /api/share/review/:id
// @access  Public
exports.shareReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("userId", "name username")
      .populate("movieId", "title poster year")

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      })
    }

    // Create canvas
    const canvas = createCanvas(800, 600)
    const ctx = canvas.getContext("2d")

    // Draw background
    ctx.fillStyle = "#4c1d95"
    ctx.fillRect(0, 0, 800, 600)

    // Draw movie poster
    try {
      const posterPath = review.movieId.poster.startsWith("/")
        ? path.join(__dirname, "..", "public", review.movieId.poster)
        : review.movieId.poster

      const image = await loadImage(posterPath)
      ctx.drawImage(image, 50, 100, 150, 225)
    } catch (error) {
      console.error("Error loading poster image:", error)
      // Draw placeholder if image fails to load
      ctx.fillStyle = "#5b21b6"
      ctx.fillRect(50, 100, 150, 225)
      ctx.fillStyle = "#ffffff"
      ctx.font = "16px Arial"
      ctx.fillText("No Image", 80, 210)
    }

    // Draw movie title
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 24px Arial"
    ctx.fillText(review.movieId.title, 250, 120)
    ctx.font = "18px Arial"
    ctx.fillText(`(${review.movieId.year})`, 250, 150)

    // Draw rating
    ctx.fillStyle = "#facc15"
    ctx.font = "bold 36px Arial"
    ctx.fillText(`${review.rating}/10`, 250, 200)

    // Draw review title
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 22px Arial"
    ctx.fillText(review.title, 50, 370)

    // Draw review content (with word wrap)
    ctx.font = "16px Arial"
    const maxWidth = 700
    const lineHeight = 24
    const words = review.content.split(" ")
    let line = ""
    let y = 400

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " "
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line, 50, y)
        line = words[i] + " "
        y += lineHeight

        // Limit to 3 lines
        if (y > 450) {
          ctx.fillText(line + "...", 50, y)
          break
        }
      } else {
        line = testLine
      }
    }

    if (y <= 450) {
      ctx.fillText(line, 50, y)
    }

    // Draw reviewer info
    ctx.fillStyle = "#cccccc"
    ctx.font = "16px Arial"
    ctx.fillText(`Review by: ${review.userId.name || review.userId.username}`, 50, 520)

    // Draw website info
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 18px Arial"
    ctx.fillText("Crictistaan - Movie Reviews", 50, 560)

    // Convert canvas to buffer
    const buffer = canvas.toBuffer("image/png")

    // Set response headers
    res.set({
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="review_${review._id}.png"`,
    })

    // Send image
    res.send(buffer)
  } catch (error) {
    next(error)
  }
}
