const express = require("express")
const router = express.Router()
const fieldController = require("../controllers/fieldController")

// GET /api/fields - List fields for an object
router.get("/", fieldController.listFields)

// PUT /api/fields - Add a field to an object
router.put("/", fieldController.addField)

module.exports = router
