const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      required: [true, "Subtitle is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
    },
    image: {
      type: String,
      default: "/placeholder.svg",
    },
  },
  {
    timestamps: true, // ⏱️ Auto adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("News", NewsSchema);
