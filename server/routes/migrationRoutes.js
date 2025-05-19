const express = require("express")
const router = express.Router()
const migrationController = require("../controllers/migrationController")

// POST /api/migrations - Migrate fields between objects
// router.post("/", migrationController.CsvFieldsmigration)
router.post("/", migrationController.migrateFields)
module.exports = router
