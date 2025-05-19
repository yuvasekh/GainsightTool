const axios = require("axios")
const { readToken } = require("../utils/tokenUtils")
const fieldController = require("./fieldController")
const fs = require("fs")
const csv = require("csv-parser");
const { parse } = require('csv-parse');
// const csv = require("csv-parser")
// Migrate fields between objects
// exports.migrateFields = async (req, res) => {
//   try {
//     const { targetUrl, accessKey: targetAccessKey, targetObject, sourceObject } = req.body

//     // Basic validation
//     if (!targetUrl || !targetAccessKey || !targetObject || !sourceObject) {
//       return res.status(400).json({
//         error: "Missing required fields in request body.",
//       })
//     }

//     // Fetch fields from source object
//     const fields = await fieldController.fetchFields(sourceObject)
//     const fieldList = fields?.data?.[0]?.fields || []
//     const objectType = fields?.data?.[0]?.objectType || "Unknown"

//     const formattedFields = []

//     // Format fields for migration
//     fieldList.forEach((item) => {
//       if (item.meta?.fieldGroupType !== "SYSTEM") {
//         formattedFields.push({
//           name: item.fieldName,
//           label: item.label,
//           defaultValue: item.defaultValue || null,
//           description: item.description || null,
//           type: item.dataType,
//           group: objectType,
//           hidden: false,
//           required: item.meta?.dataType || false,
//         })
//       }
//     })

//     // Add fields to target object
//     const response = await addFieldsToObject(targetUrl, targetAccessKey, targetObject, formattedFields)

//     res.json(response)
//   } catch (error) {
//     console.error("Migration failed:", error)
//     res.status(500).json({
//       error: "Migration failed",
//       details: error.message,
//     })
//   }
// }
exports.migrateFields = async (req, res) => {
  try {
    const {
      targetUrl,
     targetToken,
      targetObject,
      sourceObject,
      selectedFields = [],
    } = req.body;
// console.log(req.body,"yuva")
    if (!targetUrl || !targetToken || !targetObject || !sourceObject) {
      return res.status(400).json({
        error: "Missing required fields in request body.",
      });
    }

    // Fetch all fields from the source object
    const responseFields = await fieldController.fetchFields(req.body);
    console.log(responseFields,"fields")
    const fieldList = responseFields?.fields
    const objectType =responseFields?.group

    // Build a Set of selected field names (from sourceObject)
    const selectedFieldNames = new Set(selectedFields.map(f => f.name));
console.log(selectedFieldNames,"selectedFieldNames")
console.log(fieldList,"fieldList")
    // Filter and format only selected fields from the fetched list
    const formattedFields = fieldList
      .filter(field => selectedFieldNames.has(field.name))
      .filter(field => field.group !== "SYSTEM") // Exclude system fields
      .map(field => ({
        name: field.name,
        label: field.label,
        defaultValue: field.defaultValue || null,
        description: field.description || null,
        type: field.type,
        group: objectType,
        hidden: field.hidden,
        required: field.required || false,
      }));
console.log(formattedFields,"king")
    if (formattedFields.length === 0) {
      return res.status(400).json({
        error: "No valid selected fields found in source object.",
      });
    }

    // Add selected fields to the target object
    const response = await addFieldsToObject(
      targetUrl,
      targetToken,
      targetObject,
      formattedFields
    );

    res.json(response);
  } catch (error) {
    console.error("Migration failed:", error);
    res.status(500).json({
      error: "Migration failed",
      details: error.message,
    });
  }
};

exports.CsvFieldsmigration = async (req, res) => {
  try {
    const { targetUrl, accessKey: targetAccessKey, targetObject, sourceObject } = req.body;

    if (!targetUrl || !targetAccessKey || !targetObject || !sourceObject || !req.files?.[0]) {
      return res.status(400).json({
        error: "Missing required fields or CSV file.",
      });
    }

    const csvFileBuffer = req.files[0].buffer;
    const fields = await fieldController.fetchFields(sourceObject);
    const fieldList = fields?.data?.[0]?.fields || [];
    const objectType = fields?.data?.[0]?.objectType || "Unknown";

    // Build the complete formatted fields list
    const formattedFields = fieldList
      .filter(item => item.meta?.fieldGroupType !== "SYSTEM")
      .map(item => ({
        name: item.fieldName,
        label: item.label,
        defaultValue: item.defaultValue || null,
        description: item.description || null,
        type: item.dataType,
        group: objectType,
        hidden: false,
        required: item.meta?.dataType || false,
      }));
      console.log(formattedFields)
    // Parse the CSV to extract field names with status "yes"
    const yesFieldNames = new Set();

    // const parseStream = parse({ columns: true, skip_empty_lines: true });
    const parseStream = parse({ columns: true, skip_empty_lines: true });

    parseStream.on('data', (row) => {
      console.log(row,"row")
      if (row.status?.toLowerCase() === 'yes') {
        yesFieldNames.add(row.name);
      }
    });

    parseStream.on('end', async () => {
      try {
        // Filter the formattedFields based on CSV
        const filterFields = formattedFields.filter(field => yesFieldNames.has(field.name));

        console.log("Filtered Fields:", filterFields);

        // Optional: send to target system here
        const response = await addFieldsToObject(targetUrl, targetAccessKey, targetObject, filterFields);
console.log(response,"response")
        res.json({ success: true, response });
      } catch (error) {
        console.error("Error processing fields:", error);
        res.status(500).json({
          error: "Failed to process filtered fields",
          details: error.message,
        });
      }
    });

    // Start parsing the CSV buffer
    parseStream.write(csvFileBuffer);
    parseStream.end();

  } catch (error) {
    console.error("Migration failed:", error);
    res.status(500).json({
      error: "Migration failed",
      details: error.message,
    });
  }
};





// Helper function to add fields to an object
async function addFieldsToObject(targetUrl, targetAccessKey, objectName, columnNames) {
  try {
    if (!targetUrl) {
      targetUrl = "https://demo-wigmore.gainsightcloud.com"
    }

 

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
console.log(data,"yuva999")
    const config = {
      method: "put",
      maxBodyLength: Number.POSITIVE_INFINITY,
      url: `${targetUrl}/v1/meta/v10/gdm/objects`,
      headers: {
        Cookie: `${targetAccessKey}`,
        "Content-Type": "application/json",
      },
      data: data,
    }

    const response = await axios.request(config)
    return response.data
  } catch (error) {
    console.error("Error adding fields to object:", error)
    throw error.message
  }
}
async function getFields(instanceUrl,accesskey,objectName) {
  
      const config = {
        method: "get",
        maxBodyLength: Number.POSITIVE_INFINITY,
        url: `${instanceUrl}/v1/meta/v10/gdm/objects/${objectName}/describe?ic=true&idd=true`,
        headers: {
          Cookie: accesskey,
          "Content-Type": "application/json",
        },
      }
  
      const response = await axios.request(config)
      return response.data
  
}