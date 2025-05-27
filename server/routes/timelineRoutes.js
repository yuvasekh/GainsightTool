const express = require("express")
const { fetchTimeLine, CompanyTimeLine, migrateTimelines } = require("../controllers/timelineController")
const router = express.Router()


router.post("/", fetchTimeLine)
router.post("/companyTimeLine", CompanyTimeLine)
router.post("/migratecompanyTimeLine", migrateTimelines)

module.exports = router
