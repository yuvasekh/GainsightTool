const { startAgent } = require("../services/agentService")
const { addFieldsToObject } = require("../services/fieldService")

// Process a message
exports.processMessage = async (req, res) => {
  try {
    const { message, messages } = req.body

    if (!message) {
      return res.status(400).json({ message: "Message is required" })
    }

    const response = await startAgent(message, messages)

    if (response.hasOwnProperty("functionCall")) {
      const info = response.functionCall.args

      const columns = [
        {
          name: info.fieldName,
          label: info.fieldName,
          defaultValue: null,
          description: null,
          type: info.dataType,
          group: "CUSTOM",
          hidden: false,
          required: false,
        },
      ]

      try {
        await addFieldsToObject(null, null, info.objectName, columns)
        res.send("Successfully created")
      } catch (err) {
        console.error(err.message)
        res.send("Failed creation")
      }
    } else {
      res.send(response.text)
    }
  } catch (error) {
    console.error("Error processing message:", error)
    res.status(500).json({
      message: "Error processing message",
      error: error.message,
    })
  }
}
