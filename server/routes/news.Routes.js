const express = require("express")
const { getLatestNews } = require("../controllers/news.Controller.js");

const router = express.Router();

router.get("/latest", getLatestNews);

// export default router;
module.exports = router

