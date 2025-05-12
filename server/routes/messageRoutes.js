const express = require("express")
const router = express.Router()
const messageController = require("../controllers/messageController")

// POST /api/message - Process a message
router.post("/", messageController.processMessage)

module.exports = router
