const mongoose = require("mongoose")

const MovieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
    },
    genres: {
      type: [String],
      required: [true, "At least one genre is required"],
    },
    language: {
      type: String,
      required: [true, "Language is required"],
    },
    director: {
      type: String,
      required: [true, "Director is required"],
    },
    cast: {
      type: [String],
      required: [true, "At least one cast member is required"],
    },
    plot: {
      type: String,
      required: [true, "Plot is required"],
    },
    poster: {
      type: String,
      default: "/placeholder.svg",
    },
    backdrop: {
      type: String,
      default: "/placeholder.svg",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    runtime: {
      type: Number,
      required: [true, "Runtime is required"],
    },
    releaseDate: {
      type: Date,
      required: [true, "Release date is required"],
    },
    category: {
      type: String,
      enum: ["top-rated", "in-theatres", "coming-soon", "upcoming"],
      required: [true, "Category is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for reviews
MovieSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "movieId",
})

module.exports = mongoose.model("Movie", MovieSchema)

