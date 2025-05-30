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
  User,
  Zap,
  Target,
  Activity,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Pause
} from "lucide-react"
import { fetchObjects, totangoapitest } from "@/api/api"

const TotangoGainsightMigration = () => {
  // Connection states
  const [totangoUrl, setTotangoUrl] = useState("https://api.totango.com")
  const [totangoToken, setTotangoToken] = useState("")
  const [gainsightUrl, setGainsightUrl] = useState("https://api.gainsight.com")
  const [gainsightToken, setGainsightToken] = useState("")
  const [gainsightUserId, setGainsightUserId] = useState("")
    const [accountIds, setAccountIds] = useState("")

  // Connection status
  const [totangoConnectionStatus, setTotangoConnectionStatus] = useState("idle")
  const [gainsightConnectionStatus, setGainsightConnectionStatus] = useState("idle")

  // Migration states
  const [migrationStatus, setMigrationStatus] = useState("idle")
  const [migrationProgress, setMigrationProgress] = useState(0)
  const [migrationResponse, setMigrationResponse] = useState(null)
  const [migrationStatuses, setMigrationStatuses] = useState([])

  // UI states
  const [showTotangoToken, setShowTotangoToken] = useState(false)
  const [showGainsightToken, setShowGainsightToken] = useState(false)
  const [activeStep, setActiveStep] = useState(1)

  // Test Totango connection
  


  // Test Gainsight connection

 const startMigration = async () => {
    try {
      const response = await fetch("https://gainsighttool-1.onrender.com/api/timeline/totangomigratecompanyTimeLine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceInstanceUrl: totangoUrl,
          sourceInstanceToken: totangoToken,
          targetInstanceUrl: gainsightUrl,
          targetInstanceToken: gainsightToken,
          gainsightUserId:gainsightUserId,
          accountIds:[accountIds]
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
  // Start migration


  // Handle Totango connection test
  const handleTotangoConnectionTest = async () => {
    if (!totangoUrl || !totangoToken) {
      alert("Please enter both Totango URL and access token")
      return
    }
    setTotangoConnectionStatus("testing")
    try {
     var res= await totangoapitest(totangoUrl, totangoToken)
      console.log(res,"yuva")
      setTotangoConnectionStatus("success")
      setActiveStep(2)
    } catch (error) {
      setTotangoConnectionStatus("error")
      console.error("Totango connection test failed:", error)
    }
  }

  // Handle Gainsight connection test
  const handleGainsightConnectionTest = async () => {
    if (!gainsightUrl || !gainsightToken || !gainsightUserId) {
      alert("Please enter Gainsight URL, access token, and user ID")
      return
    }

    setGainsightConnectionStatus("testing")

    try {
      var res=await fetchObjects(gainsightUrl, gainsightToken, gainsightUserId)
     
      setGainsightConnectionStatus("success")
      setActiveStep(3)
   

    } catch (error) {

      setGainsightConnectionStatus("error")
      console.error("Gainsight connection test failed:", error)
    }
  }

  // Handle migration start
  const handleStartMigration = async () => {
    if (!totangoUrl || !totangoToken || !gainsightUrl || !gainsightToken || !gainsightUserId) {
      alert("Please complete all connection tests before starting migration")
      return
    }

    setMigrationStatus("running")
    setMigrationProgress(0)
    setMigrationResponse(null)
    setMigrationStatuses([])

    try {
      const result = await startMigration()
      setMigrationResponse(result)
      
      // If the API returns migration statuses, use them
      if (result.migrationStatuses) {
        setMigrationStatuses(result.migrationStatuses)
      }
      
      // Simulate progress if not provided by API
      if (!result.progress) {
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 800))
          setMigrationProgress(i)
        }
      } else {
        setMigrationProgress(result.progress)
      }

      setMigrationStatus("success")
    } catch (error) {
      setMigrationStatus("error")
      console.error("Migration failed:", error)
      setMigrationResponse({ error: error.message })
    }
  }

  const getConnectionStatusIcon = (status) => {
    switch (status) {
      case "testing":
        return <Loader className="w-5 h-5 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "failed":
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "running":
      case "in_progress":
        return <Loader className="w-5 h-5 animate-spin text-blue-500" />
      case "paused":
        return <Pause className="w-5 h-5 text-yellow-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      case "failed":
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      case "running":
      case "in_progress":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "paused":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "warning":
        return "bg-orange-50 border-orange-200 text-orange-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-3 bg-orange-100 rounded-full">
              <Database className="w-8 h-8 text-orange-600" />
            </div>
            <ArrowRight className="w-6 h-8 text-gray-400" />
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="w-8 h-7 text-purple-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent mb-5">
            Totango to Gainsight Migration
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Seamlessly migrate your customer success data from Totango to Gainsight with real-time progress tracking and detailed status reports.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-300 ${
                  activeStep >= step 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-4 transition-all duration-300 ${
                    activeStep > step ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Totango Configuration */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Totango Source</h2>
                <p className="text-gray-600">Configure your Totango connection</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Totango URL</label>
                <input
                  type="text"
                  value={totangoUrl}
                  onChange={(e) => setTotangoUrl(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 bg-white/50"
                  placeholder="https://api.totango.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Access Token</label>
                <div className="relative">
                  <input
                    type={showTotangoToken ? "text" : "password"}
                    value={totangoToken}
                    onChange={(e) => setTotangoToken(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-300 bg-white/50"
                    placeholder="Enter your Totango access token"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTotangoToken(!showTotangoToken)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showTotangoToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
 <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Account ID's</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={accountIds}
                    onChange={(e) => setAccountIds(e.target.value)}
                    className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300 bg-white/50"
                    placeholder="Enter your Totango account IDs"
                  />
                </div>
              </div>
              <button
                onClick={handleTotangoConnectionTest}
                disabled={totangoConnectionStatus === "testing"}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {getConnectionStatusIcon(totangoConnectionStatus)}
                Test Totango Connection
              </button>
            </div>
          </div>

          {/* Gainsight Configuration */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Gainsight Target</h2>
                <p className="text-gray-600">Configure your Gainsight connection</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Gainsight URL</label>
                <input
                  type="text"
                  value={gainsightUrl}
                  onChange={(e) => setGainsightUrl(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300 bg-white/50"
                  placeholder="https://api.gainsight.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Access Token</label>
                <div className="relative">
                  <input
                    type={showGainsightToken ? "text" : "password"}
                    value={gainsightToken}
                    onChange={(e) => setGainsightToken(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300 bg-white/50"
                    placeholder="Enter your Gainsight access token"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGainsightToken(!showGainsightToken)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showGainsightToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">User ID</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={gainsightUserId}
                    onChange={(e) => setGainsightUserId(e.target.value)}
                    className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all duration-300 bg-white/50"
                    placeholder="Enter your Gainsight user ID"
                  />
                </div>
              </div>
                

              <button
                onClick={handleGainsightConnectionTest}
                disabled={gainsightConnectionStatus === "testing"}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {getConnectionStatusIcon(gainsightConnectionStatus)}
                Test Gainsight Connection
              </button>
            </div>
          </div>
        </div>

        {/* Migration Controls */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Start Migration</h3>
                <p className="text-gray-600">Begin the data migration process from Totango to Gainsight</p>
              </div>
            </div>
            <button
              onClick={handleStartMigration}
              disabled={migrationStatus === "running" || totangoConnectionStatus !== "success" || gainsightConnectionStatus !== "success"}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {migrationStatus === "running" ? 
                <Loader className="w-5 h-5 animate-spin" /> : 
                <Play className="w-5 h-5" />
              }
              {migrationStatus === "running" ? "Migration in Progress..." : "Start Migration"}
            </button>
          </div>

          {migrationStatus === "running" && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold text-gray-700">Migration Progress</span>
                <span className="text-lg font-bold text-gray-900">{migrationProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-4 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${migrationProgress}%` }}
                />
              </div>
            </div>
          )}

          {migrationStatus === "success" && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-green-800 font-bold text-lg">Migration completed successfully!</span>
              </div>
              <p className="text-green-700">All data has been successfully migrated from Totango to Gainsight.</p>
            </div>
          )}

          {migrationStatus === "error" && (
            <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <span className="text-red-800 font-bold text-lg">Migration failed</span>
              </div>
              <p className="text-red-700">
                {migrationResponse?.error || "An error occurred during migration. Please try again."}
              </p>
            </div>
          )}
        </div>

        {/* Migration Status Details */}
        {migrationResponse && (
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200 shadow-xl mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Migration Response</h3>
                <p className="text-gray-600">Detailed migration results and statistics</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 border">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
                {JSON.stringify(migrationResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Migration Statuses */}
        {migrationStatuses.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-200 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Migration Status Details</h3>
                <p className="text-gray-600">Real-time status of individual migration tasks</p>
              </div>
            </div>

            <div className="grid gap-4">
              {migrationStatuses.map((status, index) => (
                <div key={index} className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${getStatusColor(status.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(status.status)}
                      <div>
                        <h4 className="font-bold text-lg">{status.name || `Migration Task ${index + 1}`}</h4>
                        <p className="text-sm opacity-80">{status.description || "Data migration in progress"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg capitalize">{status.status}</div>
                      {status.recordsProcessed && (
                        <div className="text-sm opacity-80">
                          {status.recordsProcessed} records processed
                        </div>
                      )}
                      {status.timestamp && (
                        <div className="text-xs opacity-60 mt-1">
                          {new Date(status.timestamp).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {status.progress && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{status.progress}%</span>
                      </div>
                      <div className="w-full bg-white/50 rounded-full h-2">
                        <div
                          className="bg-current h-2 rounded-full transition-all duration-300"
                          style={{ width: `${status.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {status.error && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm font-medium">{status.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TotangoGainsightMigration