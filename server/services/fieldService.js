const axios = require("axios")
const { readToken } = require("../utils/tokenUtils")

// Add fields to an object
exports.addFieldsToObject = async (targetUrl, targetAccessKey, objectName, columns) => {
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
      createdColumns: columns,
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
