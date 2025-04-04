const News = require("../models/News.js");

const getLatestNews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5; // Default to 5 news articles
    const news = await News.find().sort({ createdAt: -1 }).limit(limit); // Fetch multiple news

    // console.log("Fetched News:", news);
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
};

module.exports = {
  getLatestNews,
};
