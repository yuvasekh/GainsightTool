const axios = require("axios")
const { readToken } = require("../utils/tokenUtils")
const fieldController = require("./fieldController")

// Migrate fields between objects
exports.migrateFields = async (req, res) => {
  try {
    const { targetUrl, accessKey: targetAccessKey, targetObject, sourceObject } = req.body

    // Basic validation
    if (!targetUrl || !targetAccessKey || !targetObject || !sourceObject) {
      return res.status(400).json({
        error: "Missing required fields in request body.",
      })
    }

    // Fetch fields from source object
    const fields = await fieldController.fetchFields(sourceObject)
    const fieldList = fields?.data?.[0]?.fields || []
    const objectType = fields?.data?.[0]?.objectType || "Unknown"

    const formattedFields = []

    // Format fields for migration
    fieldList.forEach((item) => {
      if (item.meta?.fieldGroupType !== "SYSTEM") {
        formattedFields.push({
          name: item.fieldName,
          label: item.label,
          defaultValue: item.defaultValue || null,
          description: item.description || null,
          type: item.dataType,
          group: objectType,
          hidden: false,
          required: item.meta?.dataType || false,
        })
      }
    })

    // Add fields to target object
    const response = await addFieldsToObject(targetUrl, targetAccessKey, targetObject, formattedFields)

    res.json(response)
  } catch (error) {
    console.error("Migration failed:", error)
    res.status(500).json({
      error: "Migration failed",
      details: error.message,
    })
  }
}

// Helper function to add fields to an object
async function addFieldsToObject(targetUrl, targetAccessKey, objectName, columnNames) {
  try {
    if (!targetUrl) {
      targetUrl = "https://demo-wigmore.gainsightcloud.com"
    }

    const token = await readToken()

    const data = JSON.stringify({
      objectDetails: {
        label: objectName,
        name: objectName,
        dataStore: "HAPOSTGRES",
        description: "",
        group: "Custom",
        originalName: objectName,
        originalLabel: objectName,
        originalDescription: "",
        originalDataStore: "HAPOSTGRES",
        richTextMaxSize: 150000,
      },
      createdColumns: columnNames,
      updatedColumns: [],
      deletedColumns: [],
    })

    const config = {
      method: "put",
      maxBodyLength: Number.POSITIVE_INFINITY,
      url: `${targetUrl}/v1/meta/v10/gdm/objects`,
      headers: {
        Cookie: `${token}`,
        "Content-Type": "application/json",
      },
      data: data,
    }

    const response = await axios.request(config)
    return response.data
  } catch (error) {
    console.error("Error adding fields to object:", error)
    throw error
  }
}
