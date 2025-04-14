const mongoose = require("mongoose")

const TvShowSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    overview: {
      type: String,
      required: [true, "Please add an overview"],
      trim: true,
    },
    poster: {
      type: String,
    },
    backdrop: {
      type: String,
    },
    firstAirDate: {
      type: Date,
    },
    lastAirDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Ended", "Returning Series", "Canceled", "In Production"],
    },
    genres: {
      type: [String],
    },
    networks: {
      type: [String],
    },
    creators: {
      type: [String],
    },
    cast: {
      type: [String],
    },
    numberOfSeasons: {
      type: Number,
      default: 1,
    },
    numberOfEpisodes: {
      type: Number,
      default: 0,
    },
    episodeRunTime: {
      type: Number,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    trailer: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("TvShow", TvShowSchema)
