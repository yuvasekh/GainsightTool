"use client"

import { useState, useEffect } from "react"
import {
  Database,
  Play,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowRight,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react"
import { fetchFieldNames, fetchObjects } from "@/api/api"

const DataMigrationComponent = () => {
  // Connection states
  const [sourceUrl, setSourceUrl] = useState("https://source-instance.example.com")
  const [sourceToken, setSourceToken] = useState("")
  const [targetUrl, setTargetUrl] = useState("https://target-instance.example.com")
  const [targetToken, setTargetToken] = useState("")

  // Connection status
  const [sourceConnectionStatus, setSourceConnectionStatus] = useState("idle") // idle, testing, success, error
  const [targetConnectionStatus, setTargetConnectionStatus] = useState("idle")

  // Objects and fields
  const [sourceObjects, setSourceObjects] = useState([])
  const [targetObjects, setTargetObjects] = useState([])
  const [selectedSourceObject, setSelectedSourceObject] = useState("")
  const [selectedTargetObject, setSelectedTargetObject] = useState("")
  const [sourceFields, setSourceFields] = useState([])
  const [targetFields, setTargetFields] = useState([])
  const [selectedFields, setSelectedFields] = useState([])

  // Migration states
  const [timelines, setTimelines] = useState([])
  const [migrationStatus, setMigrationStatus] = useState("idle")
  const [migrationProgress, setMigrationProgress] = useState(0)

  // UI states
  const [showSourceToken, setShowSourceToken] = useState(false)
  const [showTargetToken, setShowTargetToken] = useState(false)
  const [isFieldsModalOpen, setIsFieldsModalOpen] = useState(false)

  // Mock API functions (replace with actual API calls)
  const testConnection = async (url, token, type) => {
    try {
      const response = await fetchObjects(url, token)
      console.log(response)
      return response
    } catch (error) {
      throw error
    }
  }

  const fetchFields = async (url, token, objectName) => {
    try {
      const response = await fetchFieldNames(url, token, objectName)
      return response
    } catch (error) {
      throw error
    }
  }

  useEffect(() => {}, [sourceFields])

  const generateTimelines = async (
    sourceUrl,
    sourceToken,
    sourceObject,
    targetUrl,
    targetToken,
    targetObject,
    fields,
  ) => {
    try {
      const response = await fetch("/api/generate-timelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: { url: sourceUrl, token: sourceToken, object: sourceObject },
          target: { url: targetUrl, token: targetToken, object: targetObject },
          fields,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate timelines")

      const data = await response.json()
      return data.timelines || []
    } catch (error) {
      throw error
    }
  }

  // Updated migration function to call the actual API endpoint
  const startMigration = async () => {
    try {
      const response = await fetch("https://gainsighttool-1.onrender.com/api/timeline/migratecompanyTimeLine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceInstanceUrl: sourceUrl,
          sourceInstanceToken: sourceToken,
          targetInstanceUrl: targetUrl,
          targetInstanceToken: targetToken,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Migration failed to start")
      }

      const data = await response.json()
      return data
    } catch (error) {
      throw error
    }
  }

  // Handle source connection test
  const handleSourceConnectionTest = async () => {
    if (!sourceUrl || !sourceToken) {
      alert("Please enter both URL and access token")
      return
    }

    setSourceConnectionStatus("testing")

    try {
      // Mock delay for demo
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const objects = await testConnection(sourceUrl, sourceToken, "source")

      setSourceObjects(objects)
      setSourceConnectionStatus("success")
    } catch (error) {
      setSourceConnectionStatus("error")
      console.error("Source connection test failed:", error)
    }
  }

  // Handle target connection test
  const handleTargetConnectionTest = async () => {
    if (!targetUrl || !targetToken) {
      alert("Please enter both URL and access token")
      return
    }

    setTargetConnectionStatus("testing")

    try {
      // Mock delay for demo
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const objects = await fetchObjects(targetUrl, targetToken)

      setTargetObjects(objects)
      setTargetConnectionStatus("success")
    } catch (error) {
      setTargetConnectionStatus("error")
      console.error("Target connection test failed:", error)
    }
  }

  // Handle source object selection
  const handleSourceObjectSelect = async (objectId) => {
    setSelectedSourceObject(objectId)
    console.log(objectId, "yuva")

    try {
      // Mock delay for demo
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const fields = await fetchFields(sourceUrl, sourceToken, objectId)

      setSourceFields(fields)
    } catch (error) {
      console.error("Failed to fetch source fields:", error)
    }
  }

  // Handle target object selection
  const handleTargetObjectSelect = async (objectId) => {
    setSelectedTargetObject(objectId)

    if (!objectId) {
      setTargetFields([])
      return
    }

    try {
      // Mock delay for demo
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const fields = await fetchFieldNames(targetUrl, targetToken, objectId)

      setTargetFields(fields)
    } catch (error) {
      console.error("Failed to fetch target fields:", error)
    }
  }

  // Handle field selection
  const handleFieldToggle = (fieldId) => {
    setSelectedFields((prev) => (prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]))
  }

  // Generate migration timelines
  const handleGenerateTimelines = async () => {
    if (!selectedSourceObject || !selectedTargetObject || selectedFields.length === 0) {
      alert("Please select source object, target object, and at least one field")
      return
    }

    try {
      // Mock delay for demo
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In real implementation, use: const timelines = await generateTimelines(...);
      const mockTimelines = selectedFields.map((fieldId, index) => ({
        id: `timeline_${index + 1}`,
        sourceField: sourceFields.find((f) => f.id === fieldId)?.name || fieldId,
        targetField: targetFields.find((f) => f.id === fieldId)?.name || fieldId,
        recordCount: Math.floor(Math.random() * 1000) + 100,
        status: "pending",
      }))

      setTimelines(mockTimelines)
      setIsFieldsModalOpen(false)
    } catch (error) {
      console.error("Failed to generate timelines:", error)
      alert("Failed to generate migration timelines")
    }
  }

  // Updated start migration process to use the actual API
  const handleStartMigration = async () => {
    // Validate required fields
    if (!sourceUrl || !sourceToken || !targetUrl || !targetToken) {
      alert("Please fill in all required fields: Source URL, Source Token, Target URL, and Target Token")
      return
    }

    console.log("Migration parameters:", {
      sourceUrl,
      sourceToken,
      targetUrl,
      targetToken,
      selectedSourceObject,
      selectedTargetObject,
      selectedFields,
    })

    setMigrationStatus("running")
    setMigrationProgress(0)

    try {
      // Start the actual migration
      const result = await startMigration()

      console.log("Migration started successfully:", result)

      // Simulate progress updates (you might want to implement actual progress tracking)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setMigrationProgress(i)
      }

      setMigrationStatus("success")
      alert("Migration completed successfully!")
    } catch (error) {
      setMigrationStatus("error")
      console.error("Migration failed:", error)
      alert(`Migration failed: ${error.message}`)
    }
  }

  const getConnectionStatusIcon = (status) => {
    switch (status) {
      case "testing":
        return <Loader className="w-4 h-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <RefreshCw className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Source Authentication */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Source Authentication</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source URL</label>
            <div className="relative">
              <input
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://source-instance.example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source Access Token</label>
            <div className="relative">
              <input
                type={showSourceToken ? "text" : "password"}
                value={sourceToken}
                onChange={(e) => setSourceToken(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter source access token"
              />
              <button
                type="button"
                onClick={() => setShowSourceToken(!showSourceToken)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showSourceToken ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSourceConnectionTest}
            disabled={sourceConnectionStatus === "testing"}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {getConnectionStatusIcon(sourceConnectionStatus)}
            Test Connection
          </button>
        </div>
      </div>

      {/* Target Authentication */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-800">Target Authentication</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
            <div className="relative">
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://target-instance.example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Access Token</label>
            <div className="relative">
              <input
                type={showTargetToken ? "text" : "password"}
                value={targetToken}
                onChange={(e) => setTargetToken(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter target access token"
              />
              <button
                type="button"
                onClick={() => setShowTargetToken(!showTargetToken)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showTargetToken ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleTargetConnectionTest}
            disabled={targetConnectionStatus === "testing"}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {getConnectionStatusIcon(targetConnectionStatus)}
            Test Connection
          </button>
        </div>
      </div>

      {/* Quick Migration Button - Added for direct migration without object/field selection */}
      <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Migration</h3>
            <p className="text-sm text-gray-600">Start migration with current source and target configurations</p>
          </div>
          <button
            onClick={handleStartMigration}
            disabled={migrationStatus === "running" || !sourceUrl || !sourceToken || !targetUrl || !targetToken}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {migrationStatus === "running" ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Start Migration
          </button>
        </div>

        {migrationStatus === "running" && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Migration Progress</span>
              <span className="text-sm text-gray-600">{migrationProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${migrationProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {migrationStatus === "success" && (
          <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Migration completed successfully!</span>
            </div>
          </div>
        )}

        {migrationStatus === "error" && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Migration failed. Please try again.</span>
            </div>
          </div>
        )}
      </div>

      {/* Object Selection */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Source Object</label>
          <select
            value={selectedSourceObject}
            onChange={(e) => handleSourceObjectSelect(e.target.value)}
            disabled={sourceConnectionStatus !== "success"}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select source object</option>
            {sourceObjects.map((obj) => (
              <option key={obj.id} value={obj.name}>
                {obj.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Object</label>
          <select
            value={selectedTargetObject}
            onChange={(e) => handleTargetObjectSelect(e.target.value)}
            disabled={targetConnectionStatus !== "success"}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select target object</option>
            {targetObjects.map((obj) => (
              <option key={obj.id} value={obj.name}>
                {obj.name}
              </option>
            ))}
          </select>
        </div>
      </div> */}

      {/* Field Selection Button */}
      {selectedSourceObject && selectedTargetObject && sourceFields.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => setIsFieldsModalOpen(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Select Fields for Migration
          </button>
        </div>
      )}

      {/* Migration Timelines */}
      {timelines.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Migration Timelines</h3>
            <button
              onClick={handleStartMigration}
              disabled={migrationStatus === "running"}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {migrationStatus === "running" ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Start Migration
            </button>
          </div>

          <div className="space-y-3">
            {timelines.map((timeline) => (
              <div key={timeline.id} className="flex items-center justify-between p-3 bg-white rounded border">
                <div className="flex items-center gap-4">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{timeline.sourceField}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{timeline.targetField}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{timeline.recordCount} records</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      timeline.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : timeline.status === "running"
                          ? "bg-blue-100 text-blue-800"
                          : timeline.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {timeline.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fields Selection Modal */}
      {isFieldsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Select Fields</h3>
              <button onClick={() => setIsFieldsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {console.log(sourceFields, "fields")}
              {sourceFields.map((field) => (
                <div key={field.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onChange={() => handleFieldToggle(field.id)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={field.id} className="flex-1 cursor-pointer">
                    <div className="font-medium text-gray-800">{field.name}</div>
                    <div className="text-sm text-gray-600">Type: {field.label}</div>
                  </label>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{selectedFields.length} fields selected</span>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsFieldsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateTimelines}
                  disabled={selectedFields.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Timelines
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataMigrationComponent
