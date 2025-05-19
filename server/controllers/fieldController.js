const axios = require("axios")
const { readToken } = require("../utils/tokenUtils")
const { readDataFile } = require("../utils/fileUtils")
const path = require("path")

const instancesFilePath = path.join(__dirname, "../../data/instances.json")

// List fields for an object
exports.listFields = async (req, res) => {
  try {
    const { objectName, instanceUrl, instanceToken } = req.body;

    if (!objectName || !instanceUrl || !instanceToken) {
      return res.status(400).json({ message: "objectName, instanceUrl, and instanceToken are required" });
    }

    const config = {
      method: "get",
      url: `${instanceUrl}/v1/meta/v10/gdm/objects/${objectName}`,
      headers: {
        Cookie: instanceToken,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.request(config);
    // console.log(response.data?.data?.columns)
    const fields = response.data?.data?.columns;
    if (!fields || !Array.isArray(fields)) {
      return res.status(500).json({ message: "Invalid response format: 'fields' not found" });
    }

    // const fieldNames = fields.map(field => field.name);
    const simplifiedFields = fields.map((item, index) => ({
      id: item.name,
      name: item.name,
      label: item.label
    }));
    res.json(simplifiedFields);

  } catch (error) {
    console.error("Error listing fields:", error.message);
    res.status(500).json({
      message: "Error listing fields",
      error: error.message,
    });
  }
};


// Add a field to an object
exports.addField = async (req, res) => {
  try {
    const { objectName, displayName, fieldName } = req.body

    if (!objectName || !displayName || !fieldName) {
      return res.status(400).json({
        message: "objectName, displayName, and fieldName are required",
      })
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
      createdColumns: [
        {
          name: displayName,
          label: displayName,
          defaultValue: null,
          description: null,
          type: fieldName,
          group: "custom",
          hidden: false,
          required: false,
        },
      ],
      updatedColumns: [],
      deletedColumns: [],
    })

    const config = {
      method: "put",
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
    console.error("Error adding field:", error)
    res.status(500).json({
      message: "Error adding field",
      error: error.message,
    })
  }
}

exports.fetchFields = async (data) => {
  try {
    // console.log(data)
    const { sourceObject, sourceUrl, sourceToken } = data

    if (!sourceObject || !sourceUrl || !sourceToken) {
      return ({ message: "objectName, sourceUrl, and instanceToken are required" });
    }

    const config = {
      method: "get",
      url: `${sourceUrl}/v1/meta/v10/gdm/objects/${sourceObject}`,
      headers: {
        Cookie: sourceToken,
        "Content-Type": "application/json",
      },
    };
// console.log(config)
    const response = await axios.request(config);
    console.log(response.data)
    const fields = response.data?.data?.columns;
    const group= response.data?.data?.group
    if (!fields || !Array.isArray(fields)) {
      return ({ message: "Invalid response format: 'fields' not found" });
    }


    return {fields:fields,group:group}

  } catch (error) {
    console.error("Error listing fields:", error.message);
    return error
  }
};