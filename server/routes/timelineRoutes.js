const express = require("express")
const { fetchTimeLine, CompanyTimeLine } = require("../controllers/timelineController")
const router = express.Router()


router.post("/", fetchTimeLine)
router.post("/companyTimeLine", CompanyTimeLine)

module.exports = router
