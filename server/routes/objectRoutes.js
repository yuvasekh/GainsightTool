const express = require("express")
const router = express.Router()
const objectController = require("../controllers/objectController")

// GET /api/objects - List all objects
console.log("calling")
// router.get("/", objectController.listObjects)

// POST /api/objects - Add a new object
router.post("/", objectController.addObject)
router.post("/fetch", objectController.listObjects)

module.exports = router
