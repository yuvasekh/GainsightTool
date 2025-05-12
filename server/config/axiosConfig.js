// Configuration settings
require("dotenv").config()

module.exports = {
  port: process.env.PORT || 5000,
  defaultInstanceUrl: process.env.DEFAULT_INSTANCE_URL || "https://demo-wigmore.gainsightcloud.com",
  defaultAccessKey: process.env.DEFAULT_ACCESS_KEY,
  nodeEnv: process.env.NODE_ENV || "development",
  dataPath: process.env.DATA_PATH || "./data",
}
