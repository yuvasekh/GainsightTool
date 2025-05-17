const express = require("express")
const { fetchTimeLine } = require("../controllers/timelineController")
const router = express.Router()


router.post("/", fetchTimeLine)

module.exports = router
