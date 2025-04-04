const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  description: String,
  author: String, // 👈 added author
  image: String, // 👈 added image
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const News = mongoose.model("News", newsSchema);

module.exports = News; // ✅ Use CommonJS export
