const fs = require("fs")
const path = require("path")

const tokenFilePath = path.join(__dirname, "../../data/token.json")

// Read token from file
exports.readToken = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(tokenFilePath, "utf8", (err, data) => {
      if (err) {
        // If file doesn't exist, return null
        if (err.code === "ENOENT") {
          return resolve(null)
        }
        return reject(err)
      }

      try {
        const tokenData = JSON.parse(data)
        resolve(tokenData?.token)
      } catch (parseErr) {
        reject(parseErr)
      }
    })
  })
}

// Write token to file
exports.writeToken = (token) => {
  return new Promise((resolve, reject) => {
    // Ensure directory exists
    const dir = path.dirname(tokenFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFile(tokenFilePath, JSON.stringify({ token }, null, 2), (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}
