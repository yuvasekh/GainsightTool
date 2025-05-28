"use client"

import { useState, useEffect } from "react"
import { CalendarClock, MessageCircle, User, Building, Edit, Check, FileText, Settings } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

import { useNavigate } from "react-router-dom"
import { fetchTimelineData } from "@/api/api"

// Storage keys for persistence
const STORAGE_KEYS = {
  ACTIVITIES: "timeline_activities",
  CONFIG: "timeline_config",
  PAGINATION: "timeline_pagination",
}

export default function ActivityTimeline() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize] = useState(20)

  // New state for instance configuration
  const [instanceUrl, setInstanceUrl] = useState("https://demo-wigmore.gainsightcloud.com")
  const [instanceToken, setInstanceToken] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)
  const [showConfig, setShowConfig] = useState(true)

  const router = useNavigate()

  // Load persisted data on component mount
  useEffect(() => {
    loadPersistedData()
  }, [])

  // Save data whenever important state changes
  useEffect(() => {
    if (isConfigured) {
      saveConfigToStorage()
    }
  }, [instanceUrl, instanceToken, isConfigured])

  useEffect(() => {
    if (activities.length > 0) {
      saveActivitiesToStorage()
    }
  }, [activities])

  useEffect(() => {
    savePaginationToStorage()
  }, [currentPage, totalPages])

  // Fetch activities when page changes or when first configured
  useEffect(() => {
    if (isConfigured && currentPage >= 0) {
      fetchActivities(currentPage)
    }
  }, [currentPage, isConfigured])

  const loadPersistedData = () => {
    try {
      // Load configuration
      const savedConfig = sessionStorage.getItem(STORAGE_KEYS.CONFIG)
      if (savedConfig) {
        const config = JSON.parse(savedConfig)
        setInstanceUrl(config.instanceUrl || "https://demo-wigmore.gainsightcloud.com")
        setInstanceToken(config.instanceToken || "")
        setIsConfigured(config.isConfigured || false)
        setShowConfig(!config.isConfigured)
      }

      // Load activities
      const savedActivities = sessionStorage.getItem(STORAGE_KEYS.ACTIVITIES)
      if (savedActivities) {
        const activitiesData = JSON.parse(savedActivities)
        setActivities(activitiesData)
      }

      // Load pagination
      const savedPagination = sessionStorage.getItem(STORAGE_KEYS.PAGINATION)
      if (savedPagination) {
        const pagination = JSON.parse(savedPagination)
        setCurrentPage(pagination.currentPage || 0)
        setTotalPages(pagination.totalPages || 0)
      }
    } catch (error) {
      console.error("Error loading persisted data:", error)
      // If there's an error loading data, clear storage
      clearPersistedData()
    }
  }

  const saveConfigToStorage = () => {
    try {
      const config = {
        instanceUrl,
        instanceToken,
        isConfigured,
        timestamp: Date.now(),
      }
      sessionStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config))
    } catch (error) {
      console.error("Error saving config to storage:", error)
    }
  }

  const saveActivitiesToStorage = () => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities))
    } catch (error) {
      console.error("Error saving activities to storage:", error)
    }
  }

  const savePaginationToStorage = () => {
    try {
      const pagination = {
        currentPage,
        totalPages,
        timestamp: Date.now(),
      }
      sessionStorage.setItem(STORAGE_KEYS.PAGINATION, JSON.stringify(pagination))
    } catch (error) {
      console.error("Error saving pagination to storage:", error)
    }
  }

  const clearPersistedData = () => {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        sessionStorage.removeItem(key)
      })
    } catch (error) {
      console.error("Error clearing persisted data:", error)
    }
  }

  const fetchActivities = async (page) => {
    if (!instanceUrl || !instanceToken) {
      setError("Please provide both instance URL and token")
      return
    }

    // Don't fetch if we already have data for this page and it's recent
    const savedActivities = sessionStorage.getItem(STORAGE_KEYS.ACTIVITIES)
    const savedPagination = sessionStorage.getItem(STORAGE_KEYS.PAGINATION)

    if (savedActivities && savedPagination && !loading) {
      const pagination = JSON.parse(savedPagination)
      const timeDiff = Date.now() - (pagination.timestamp || 0)

      // If data is less than 5 minutes old and we're on the same page, don't refetch
      if (timeDiff < 5 * 60 * 1000 && pagination.currentPage === page && activities.length > 0) {
        console.log("Using cached data")
        return
      }
    }

    try {
      setLoading(true)
      setError(null)
      const response = await fetchTimelineData(instanceUrl, instanceToken)
      console.log(response)
      setActivities(response.data.content)
      setTotalPages(response.data.page.totalElements)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching timeline data:", err)
      setError("Failed to load timeline data. Please check your credentials and try again.")
      setLoading(false)
    }
  }

  const handleConnect = () => {
    if (!instanceUrl.trim() || !instanceToken.trim()) {
      setError("Please provide both instance URL and token")
      return
    }

    setIsConfigured(true)
    setShowConfig(false)
    setCurrentPage(0)
    // Clear old data when connecting with new credentials
    setActivities([])
  }

  const handleDisconnect = () => {
    setIsConfigured(false)
    setShowConfig(true)
    setActivities([])
    setError(null)
    setCurrentPage(0)
    setTotalPages(0)
    // Clear persisted data when disconnecting
    clearPersistedData()
  }

  const handleRefresh = () => {
    // Clear cached data and force refresh
    sessionStorage.removeItem(STORAGE_KEYS.ACTIVITIES)
    sessionStorage.removeItem(STORAGE_KEYS.PAGINATION)
    fetchActivities(currentPage)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleCompanyClick = (companyId, companyName) => {
    router(`/company/${companyId}`, {
      state: {
        instanceUrl,
        instanceToken,
        companyName,
      },
    })
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "MEETING":
        return <CalendarClock className="h-5 w-5 text-blue-500" />
      case "UPDATE":
        return <MessageCircle className="h-5 w-5 text-green-500" />
      case "MILESTONE":
        return <FileText className="h-5 w-5 text-purple-500" />
      default:
        return <MessageCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "EDITED":
        return (
          <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
            <Edit className="h-3 w-3 mr-1" /> Edited
          </Badge>
        )
      case "POSTED":
        return (
          <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
            <Check className="h-3 w-3 mr-1" /> Posted
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <Card className="p-6">
        <Collapsible open={showConfig} onOpenChange={setShowConfig}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Instance Configuration
            </h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {showConfig ? "Hide" : "Show"} Config
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="instanceUrl">Instance URL</Label>
                <Input
                  id="instanceUrl"
                  type="url"
                  placeholder="https://your-instance.gainsightcloud.com"
                  value={instanceUrl}
                  onChange={(e) => setInstanceUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instanceToken">Instance Token</Label>
                <Input
                  id="instanceToken"
                  type="password"
                  placeholder="Enter your instance token"
                  value={instanceToken}
                  onChange={(e) => setInstanceToken(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-2">
              {!isConfigured ? (
                <Button onClick={handleConnect} disabled={loading || !instanceUrl || !instanceToken}>
                  {loading ? "Connecting..." : "Connect"}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleRefresh} disabled={loading}>
                    {loading ? "Refreshing..." : "Refresh Data"}
                  </Button>
                  <Button variant="outline" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {isConfigured && !showConfig && (
          <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
            <p className="text-sm text-green-700">✅ Connected to: {instanceUrl}</p>
            {activities.length > 0 && (
              <p className="text-xs text-green-600 mt-1">
                Data cached • Last updated: {new Date().toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && activities.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Activities List */}
      {isConfigured && activities.length > 0 && (
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-2">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Updating data...
              </div>
            </div>
          )}

          {activities.map((activity) => (
            <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="mt-1">{getActivityIcon(activity.note.type)}</div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <div className="flex items-center">
                      <h3 className="font-medium">{activity.note.subject}</h3>
                      {getStatusBadge(activity.status)}
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDate(activity.note.activityDate)}</span>
                  </div>

                  <p className="text-sm mb-3">{activity.note.plainText}</p>

                  {activity.attachments && activity.attachments.length > 0 && (
                    <div className="mb-3 p-2 bg-slate-50 rounded-md">
                      <p className="text-sm font-medium mb-2">Attachments:</p>
                      <div className="flex flex-wrap gap-2">
                        {activity.attachments.map((attachment, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-xs"
                            onClick={() => window.open(attachment.url, "_blank")}
                          >
                            <FileText className="h-3 w-3" />
                            {attachment.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {activity.contexts
                      .filter((context) => context.obj === "Company")
                      .map((company) => (
                        <Button
                          key={company.id}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100"
                          onClick={() => handleCompanyClick(company.id, company.lbl)}
                        >
                          <Building className="h-3.5 w-3.5" />
                          {company.lbl}
                        </Button>
                      ))}
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-3.5 w-3.5 mr-1" />
                    <span>{activity.author.name}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                  let pageToShow = index
                  if (totalPages > 5) {
                    if (currentPage < 3) {
                      pageToShow = index
                    } else if (currentPage > totalPages - 3) {
                      pageToShow = totalPages - 5 + index
                    } else {
                      pageToShow = currentPage - 2 + index
                    }
                  }

                  return (
                    <PaginationItem key={pageToShow}>
                      <Button
                        variant={currentPage === pageToShow ? "default" : "outline"}
                        size="icon"
                        onClick={() => handlePageChange(pageToShow)}
                        className="w-9 h-9"
                      >
                        {pageToShow + 1}
                      </Button>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {/* Empty State */}
      {isConfigured && !loading && activities.length === 0 && !error && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No activities found. Try refreshing the data.</p>
        </Card>
      )}

      {/* Not Configured State */}
      {!isConfigured && !loading && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Please configure your instance URL and token to view activities.</p>
        </Card>
      )}
    </div>
  )
}
