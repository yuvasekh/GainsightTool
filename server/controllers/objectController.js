const axios = require("axios")
const { readToken } = require("../utils/tokenUtils")
const { readDataFile } = require("../utils/fileUtils")
const path = require("path")

const instancesFilePath = path.join(__dirname, "../../data/instances.json")

// List all objects
// const axios = require('axios');

exports.listObjects = async (req, res) => {
  try {
    const instance = req.body;

    if (!instance || !instance.instanceUrl || !instance.instanceToken) {
      return res.status(400).json({ message: "Missing instance information" });
    }

    const baseUrl = `${instance.instanceUrl}/v1/meta/objectViews/executeFilter`;
console.log(baseUrl,req.body)
    const filterBody = {
      stored: {
        filters: [
          {
            alias: "A",
            field: "OBJECT_GROUP_TYPE",
            values: ["custom", "standard", "system"],
            operator: "IN",
            actualField: null
          }
        ],
        expression: "A"
      },
      temp: null,
      search: null
    };

    // Step 1: First request to get total number of objects
    const initialResponse = await axios.post(
      baseUrl,
      filterBody,
      {
        headers: {
          "Cookie": instance.instanceToken,
          "Content-Type": "application/json",
        }
      }
    );
console.log(initialResponse?.data?.data?.totalNumberOfObjects)
    const total = initialResponse?.data?.data?.totalNumberOfObjects

    if (!total) {
      return res.status(404).json({ message: "No objects found" });
    }

    // Step 2: Request all records with pagination
    const fullResponse = await axios.post(
      baseUrl,
      filterBody,
      {
        headers: {
          "Cookie": instance.instanceToken,
          "Content-Type": "application/json",
        },
        params: {
          lite: true,
          page: 1,
          size: total,
          sortBy: '',
          orderBy: ''
        }
      }
    );
 const liteObjects = fullResponse?.data.data?.liteObjects || [];
    const filteredObjects = liteObjects.map(obj => ({
      id: obj.objectId,
      name: obj.name,
      description: obj.description
    }));

    res.json(filteredObjects);
  } catch (error) {
    console.error("Error listing objects:", error.message);
    res.status(500).json({
      message: "Error listing objects",
      error: error.message,
    });
  }
};




// Add a new object
exports.addObject = async (req, res) => {
  try {
    const { displayName, fieldName } = req.body

    if (!displayName || !fieldName) {
      return res.status(400).json({ message: "displayName and fieldName are required" })
    }

    const instances = await readDataFile(instancesFilePath)

    if (!instances || instances.length === 0) {
      return res.status(404).json({ message: "No instances found" })
    }

    // Use the first instance for now
    const instance = instances[0]

    const token = await readToken()

    const data = JSON.stringify({
      objectDetails: {
        label: displayName,
        name: fieldName,
        dataStore: "HAPOSTGRES",
        description: "",
        group: "Custom",
        originalName: fieldName,
        originalLabel: displayName,
        originalDescription: "",
        originalDataStore: "HAPOSTGRES",
        richTextMaxSize: 150000,
      },
    })

    const config = {
      method: "post",
      maxBodyLength: Number.POSITIVE_INFINITY,
      url: `${instance.instanceUrl}/v1/meta/v10/gdm/objects`,
      headers: {
        Cookie: `${token}`,
        "Content-Type": "application/json",
      },
      data: data,
    }

    const response = await axios.request(config)
    res.json(response.data)
  } catch (error) {
    console.error("Error adding object:", error)
    res.status(500).json({
      message: "Error adding object",
      error: error.message,
    })
  }
}
