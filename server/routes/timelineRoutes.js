const express = require("express")
const { fetchTimeLine, CompanyTimeLine, migrateTimelines } = require("../controllers/timelineController")
const { TotangoMigrateTimelines } = require("../controllers/timelineControllerTotango")
const router = express.Router()


router.post("/", fetchTimeLine)
router.post("/companyTimeLine", CompanyTimeLine)
router.post("/migratecompanyTimeLine", migrateTimelines)
router.post("/totangomigratecompanyTimeLine", TotangoMigrateTimelines)
module.exports = router
