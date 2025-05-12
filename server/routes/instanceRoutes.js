const express = require("express")
const router = express.Router()
const instanceController = require("../controllers/instanceController")

// GET /api/instances - Get all instances
router.get("/", instanceController.getAllInstances)

// POST /api/instances - Add a new instance
router.post("/", instanceController.addInstance)

module.exports = router
