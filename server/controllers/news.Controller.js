const News = require("../models/News")

// @desc    Get all news
// @route   GET /api/news
// @access  Public
exports.getNews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query

    // Pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Execute query
    const news = await News.find().sort({ createdAt: -1 }).skip(skip).limit(Number.parseInt(limit))

    // Get total count
    const total = await News.countDocuments()

    res.status(200).json({
      success: true,
      count: news.length,
      pagination: {
        total,
        page: Number.parseInt(page),
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
      news,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single news
// @route   GET /api/news/:id
// @access  Public
exports.getSingleNews = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id)

    if (!news) {
      return res.status(404).json({
        success: false,
        error: "News not found",
      })
    }

    res.status(200).json({
      success: true,
      news,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create news
// @route   POST /api/news
// @access  Private/Admin
exports.createNews = async (req, res, next) => {
  try {
    const news = await News.create(req.body)

    res.status(201).json({
      success: true,
      news,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Private/Admin
exports.updateNews = async (req, res, next) => {
  try {
    let news = await News.findById(req.params.id)

    if (!news) {
      return res.status(404).json({
        success: false,
        error: "News not found",
      })
    }

    news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      news,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private/Admin
exports.deleteNews = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id)

    if (!news) {
      return res.status(404).json({
        success: false,
        error: "News not found",
      })
    }

    await news.deleteOne()

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    next(error)
  }
}
