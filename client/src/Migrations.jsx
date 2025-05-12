"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, CloudIcon as CloudSync, RefreshCw, Download, Shield, Link, FileText, CheckCircle2, XCircle } from 'lucide-react'
import { createMigration, fetchObjects } from "./api/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "./hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

const MigrationPage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [targetUrl, setTargetUrl] = useState("")
  const [accessKey, setAccessKey] = useState("")
  const [sourceObject, setSourceObject] = useState("")
  const [targetObject, setTargetObject] = useState("")
  const [targetObjectsList, setTargetObjectsList] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [failedFields, setFailedFields] = useState([])
  const [isMigrating, setIsMigrating] = useState(false)

  // Fetch Target Objects
  const fetchTargetObjects = async () => {
    if (!targetUrl || !accessKey) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter Target URL and Access Key",
      })
      return
    }

    setLoading(true)
    try {
      // Example API request — replace with your actual backend endpoint
      const response = await fetchObjects()
      const temp = response?.data?.[0]?.objectList?.map((item) => item.objectName) || []
      console.log(temp)
      setTargetObjectsList(temp)
      toast({
        title: "Success",
        description: "Target objects fetched successfully",
      })
    } catch (error) {
      console.error("Error fetching target objects:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch target objects",
      })
    } finally {
      setLoading(false)
    }
  }

  const simulateMigration = async (fields) => {
    setIsMigrating(true)
    setLogs(["Starting migration..."])
    setProgress(0)
    setFailedFields([])

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]

      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate delay per field

      if (field === "GS Modified Date") {
        // ❌ Simulate an error for this field
        setLogs(prev => [...prev, `❌ Failed to migrate '${field}' (System Field - Skipped).`])
        setFailedFields(prev => [...prev, field])
      } else {
        // ✅ Normal field migration
        setLogs(prev => [...prev, `✅ Successfully migrated field '${field}'.`])
      }

      setProgress(Math.round(((i + 1) / fields.length) * 100))
    }

    setLogs(prev => [...prev, `🎉 Migration from '${sourceObject}' to '${targetObject}' completed.`])
    toast({
      title: "Success",
      description: "Migration completed!",
    })
    setIsMigrating(false)
  }

  const handleStartMigration = async () => {
    if (!sourceObject || !targetObject || !targetUrl || !accessKey) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill all fields!",
      })
      return
    }

    // Simulate field migration list
    const fieldsToMigrate = [
      "Customer Name",
      "Email",
      "Billing Address",
      "Created Date",
      "Modified By",
      "Score",
      "GS Modified Date", // Let's assume this will fail (example of error)
    ]
    
    try {
      await simulateMigration(fieldsToMigrate)
      var res = await createMigration(sourceObject, targetObject, targetUrl, accessKey)
      console.log(res, "migration response")
    } catch (err) {
      console.error("Migration error:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Migration failed. Please try again.",
      })
    }
  }

  return (
    <div className="flex-1 bg-background p-6 overflow-auto w-[80vw]">
      <div className="max-w-7xl mx-auto">
        {/* Header Navigation */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 text-muted-foreground hover:text-primary"
          onClick={() => navigate("/objects")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Objects
        </Button>

        {/* Main Title Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
            <CloudSync className="h-8 w-8 text-primary" />
            Data Migration Center
          </h1>
          <p className="text-muted-foreground">Securely transfer object configurations between instances</p>
        </div>

        {/* Migration Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Connection Status */}
                <Alert variant="default" className="bg-primary/10 border-primary/20">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">Secure Connection</h3>
                      <AlertDescription className="text-sm text-muted-foreground">
                        TLS 1.3 encrypted migration
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>

                {/* Target Configuration */}
                <div className="space-y-4">
                  <h3 className="font-medium">Target Instance</h3>
                  <div className="flex items-center space-x-2">
                    <Link className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                      placeholder="https://target.instance.com"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                      type="password"
                      placeholder="Access key"
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                    />
                  </div>
                </div>

                {/* Object Mapping */}
                <div className="space-y-4">
                  <h3 className="font-medium">Object Mapping</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      value={sourceObject}
                      onValueChange={setSourceObject}
                      disabled={targetObjectsList.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Source object" />
                      </SelectTrigger>
                      <SelectContent>
                        {targetObjectsList.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={targetObject}
                      onValueChange={setTargetObject}
                      disabled={targetObjectsList.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Target object" />
                      </SelectTrigger>
                      <SelectContent>
                        {targetObjectsList.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="default"
                    className="gap-2"
                    disabled={loading}
                    onClick={fetchTargetObjects}
                  >
                    <CloudSync className="h-4 w-4" />
                    {loading ? "Discovering..." : "Discover Targets"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setTargetObjectsList([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Migration Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6 h-full flex flex-col">
                {/* Migration Controls */}
                <div className="space-y-4">
                  <Button
                    variant="default"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                    onClick={handleStartMigration}
                    disabled={!sourceObject || !targetObject}
                  >
                    Initiate Migration
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="gap-2"
                      disabled={failedFields.length === 0}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry Failed ({failedFields.length})
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      disabled={logs.length === 0}
                    >
                      <Download className="h-4 w-4" />
                      Export Logs
                    </Button>
                  </div>
                </div>

                {/* Migration Visualizer */}
                <div className="flex-1 min-h-[150px] flex flex-col justify-center">
                  {isMigrating ? (
                    <div className="space-y-4">
                      <Progress value={progress} className="h-2" />
                      <div className="text-center">
                        <div className="text-lg font-medium">
                          Migrating {sourceObject}
                          <span className="mx-2">→</span>
                          {targetObject}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Processing {progress}% complete
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <FileText className="h-10 w-10 mr-3 opacity-40" />
                      <span>Migration session will appear here</span>
                    </div>
                  )}
                </div>

                {/* Logs Preview */}
                {logs.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Recent Activity</h4>
                      <Badge variant="outline">{logs.length} events</Badge>
                    </div>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {logs.map((log, index) => (
                          <div
                            key={index}
                            className={`text-sm p-2 rounded flex items-start gap-2 ${
                              log.includes("❌")
                                ? "bg-destructive/10 text-destructive"
                                : log.includes("🎉")
                                ? "bg-primary/10 text-primary"
                                : "bg-green-500/10 text-green-600"
                            }`}
                          >
                            {log.includes("❌") ? (
                              <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            ) : log.includes("🎉") ? (
                              <CloudSync className="h-4 w-4 mt-0.5 shrink-0" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                            )}
                            <span>{log.replace(/[❌✅🎉]/g, "")}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default MigrationPage
