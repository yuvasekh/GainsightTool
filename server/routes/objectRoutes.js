const express = require("express")
const router = express.Router()
const objectController = require("../controllers/objectController")

// GET /api/objects - List all objects
console.log("calling")
router.get("/", objectController.listObjects)

// POST /api/objects - Add a new object
router.post("/", objectController.addObject)

module.exports = router
