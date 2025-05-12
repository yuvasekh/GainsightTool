const fs = require("fs")
const path = require("path")

// Read data from a JSON file
exports.readDataFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        // If file doesn't exist, return empty array
        if (err.code === "ENOENT") {
          return resolve([])
        }
        return reject(err)
      }

      try {
        const parsedData = data ? JSON.parse(data) : []
        resolve(parsedData)
      } catch (parseErr) {
        reject(parseErr)
      }
    })
  })
}

// Write data to a JSON file
exports.writeDataFile = (filePath, data) => {
  return new Promise((resolve, reject) => {
    // Ensure directory exists
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}
