const fs = require("fs")
const path = require("path")
const { readDataFile, writeDataFile } = require("../utils/fileUtils")

const instancesFilePath = path.join(__dirname, "../../data/instances.json")

// Get all instances
exports.getAllInstances = async (req, res) => {
  try {
    const instances = await readDataFile(instancesFilePath)
    res.json(instances)
  } catch (error) {
    console.error("Error reading instances:", error)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

// Add a new instance
exports.addInstance = async (req, res) => {
  try {
    const { instanceUrl, accesskey } = req.body

    if (!instanceUrl || !accesskey) {
      return res.status(400).json({ message: "instanceUrl and accesskey are required" })
    }

    const newInstance = { instanceUrl, accesskey }

    // Read existing instances
    let instances = []
    try {
      instances = await readDataFile(instancesFilePath)
    } catch (error) {
      // If file doesn't exist or is empty, start with empty array
      console.log("No existing instances file, creating new one")
    }

    // Add new instance
    instances.push(newInstance)

    // Write updated instances back to file
    await writeDataFile(instancesFilePath, instances)

    res.json({ message: "Instance added successfully" })
  } catch (error) {
    console.error("Error adding instance:", error)
    res.status(500).json({ message: "Internal Server Error" })
  }
}
