require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")

// Import routes
const authRoutes = require("./routes/auth.routes")
const movieRoutes = require("./routes/movie.routes")
const reviewRoutes = require("./routes/review.routes")
const userRoutes = require("./routes/user.routes")
const shareRoutes = require('./routes/share.routes');
const adminRoutes = require("./routes/admin.routes")
const newsRoutes = require("./routes/news.Routes");

const tvShowRoutes = require("./routes/tvshow.routes")
// const errorHandler = require("./middleware/error")




// Create Express app
const app = express()

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
)

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/movies", movieRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/users", userRoutes)
app.use('/api/share', shareRoutes);
app.use('/api/users', userRoutes);
app.use("/api/admin", adminRoutes)
app.use("/api/news", newsRoutes);

app.use("/api/tvshows", tvShowRoutes)
// app.use(errorHandler)





// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Server Error",
  })
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")

    // Start server
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  })





