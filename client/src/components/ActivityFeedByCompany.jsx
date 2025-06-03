"use client"

import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Building,
  CalendarClock,
  MessageCircle,
  User,
  Edit,
  Check,
  Download,
  FileText,
  Eye,
  Paperclip,
  Clock,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Pagination, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { fetchCompanyTimeline } from "@/api/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"

export default function CompanyTimeline() {
  const { companyId } = useParams()
  const location = useLocation()
  const router = useNavigate()

  // Get credentials from navigation state
  const { instanceUrl, instanceToken, companyName: passedCompanyName } = location.state || {}

  const [companyName, setCompanyName] = useState(passedCompanyName || "")
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  // State for the attachments modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [downloadingAttachments, setDownloadingAttachments] = useState(false)

  useEffect(() => {
    if (!instanceUrl || !instanceToken) {
      setError("Missing instance credentials. Please go back and connect first.")
      setLoading(false)
      return
    }
    fetchCompanyTimelineData(currentPage)
  }, [currentPage, instanceUrl, instanceToken, companyId])

  const fetchCompanyTimelineData = async (page = 0) => {
    if (!instanceUrl || !instanceToken) {
      setError("Missing instance credentials")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const responseData = await fetchCompanyTimeline(instanceUrl, instanceToken, pageSize, companyId, page)
      console.log(responseData)
      const { data } = responseData

      setActivities(data.content)
      setTotalPages(data.page.totalPages)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching company timeline:", err)
      setError("Failed to load company timeline. Please try again later.")
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  const downloadAttachment = (attachmentUrl, fileName) => {
    try {
      console.log("Attempting to download:", fileName, "from:", attachmentUrl)

      // Create a temporary anchor element
      const link = document.createElement("a")
      link.href = attachmentUrl
      link.download = fileName || "download"
      link.target = "_blank"
      link.rel = "noopener noreferrer"

      // Add to DOM, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log("Download initiated for:", fileName)
    } catch (error) {
      console.error("Error downloading attachment:", fileName, error)
      // Don't show alert for individual failures when downloading all
      if (!downloadingAttachments) {
        alert(`Failed to download ${fileName}. Please try again.`)
      }
    }
  }

  const downloadAllAttachments = () => {
    // Get all attachments from all activities
    const allAttachments = activities.reduce((attachments, activity) => {
      if (activity.attachments && activity.attachments.length > 0) {
        return [...attachments, ...activity.attachments]
      }
      return attachments
    }, [])

    const totalAttachments = allAttachments.length

    if (totalAttachments === 0) {
      alert("No attachments available to download.")
      return
    }

    console.log(
      `Starting download of ${totalAttachments} attachments:`,
      allAttachments.map((a) => a.name),
    )

    setDownloadingAttachments(true)

    // Download attachments with staggered delays
    allAttachments.forEach((attachment, index) => {
      setTimeout(() => {
        console.log(`Downloading attachment ${index + 1}/${totalAttachments}:`, attachment.name)
        downloadAttachment(attachment.url, attachment.name)

        // Set downloading to false after the last download
        if (index === totalAttachments - 1) {
          setTimeout(() => {
            setDownloadingAttachments(false)
            console.log("All downloads initiated")
          }, 500)
        }
      }, index * 500) // 500ms delay between each download
    })
  }

  const openAttachmentsModal = (activity) => {
    setSelectedActivity(activity)
    setIsModalOpen(true)
  }

  const closeAttachmentsModal = () => {
    setIsModalOpen(false)
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "MEETING":
        return <CalendarClock className="h-5 w-5 text-blue-500" />
      case "UPDATE":
        return <MessageCircle className="h-5 w-5 text-emerald-500" />
      case "MILESTONE":
        return <FileText className="h-5 w-5 text-purple-500" />
      default:
        return <MessageCircle className="h-5 w-5 text-slate-500" />
    }
  }

  const getActivityTypeColor = (type) => {
    switch (type) {
      case "MEETING":
        return "bg-blue-50 border-blue-200 text-blue-700"
      case "UPDATE":
        return "bg-emerald-50 border-emerald-200 text-emerald-700"
      case "MILESTONE":
        return "bg-purple-50 border-purple-200 text-purple-700"
      default:
        return "bg-slate-50 border-slate-200 text-slate-700"
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "EDITED":
        return (
          <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200 font-medium">
            <Edit className="h-3 w-3 mr-1" /> Edited
          </Badge>
        )
      case "POSTED":
        return (
          <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
            <Check className="h-3 w-3 mr-1" /> Posted
          </Badge>
        )
      default:
        return null
    }
  }

  // Show error if credentials are missing
  if (!instanceUrl || !instanceToken) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto py-8 px-4">
          <Button
            variant="ghost"
            className="mb-6 pl-0 flex items-center gap-2 hover:bg-white/50 transition-colors"
            onClick={() => router(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Timeline
          </Button>

          <Alert variant="destructive">
            <AlertDescription>
              Missing instance credentials. Please go back to the timeline and connect with your instance URL and token
              first.
            </AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  if (loading && currentPage === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto py-8 px-4">
          <Button
            variant="ghost"
            className="mb-6 pl-0 flex items-center gap-2 hover:bg-white/50 transition-colors"
            onClick={() => router(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Timeline
          </Button>

          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-10 w-1/3 rounded-lg" />
              <Skeleton className="h-5 w-1/4 rounded-md" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-24 w-full rounded-md" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto py-8 px-4">
          <Button
            variant="ghost"
            className="mb-6 pl-0 flex items-center gap-2 hover:bg-white/50 transition-colors"
            onClick={() => router(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Timeline
          </Button>
          <Card className="p-8 text-center border-red-200 bg-red-50">
            <div className="text-red-500 mb-4 text-lg font-medium">{error}</div>
            <Button
              onClick={() => fetchCompanyTimelineData(currentPage)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Try Again
            </Button>
          </Card>
        </div>
      </main>
    )
  }

  const hasAttachments = activities.some((activity) => activity.attachments && activity.attachments.length > 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <Button
            variant="ghost"
            className="pl-0 flex items-center gap-2 hover:bg-white/50 transition-colors self-start"
            onClick={() => router(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Timeline
          </Button>

          {hasAttachments && (
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-white/80 hover:bg-white border-slate-300 shadow-sm"
              onClick={downloadAllAttachments}
              disabled={downloadingAttachments}
            >
              {downloadingAttachments ? (
                <>
                  <span className="animate-spin mr-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </span>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download All Attachments
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
            <Building className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{companyName || "Company"} Timeline</h1>
            <p className="text-slate-600 mt-1">Activity history and updates</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 bg-white/70 backdrop-blur">
                <Skeleton className="h-24 w-full rounded-md" />
              </Card>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <Card className="p-12 text-center bg-white/70 backdrop-blur border-slate-200">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-slate-100 rounded-full">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-700 mb-2">No Activities Found</h3>
                <p className="text-slate-500">No activities found for this company yet.</p>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <Card
                  key={activity.id}
                  className="p-6 bg-white/80 backdrop-blur border-slate-200 hover:shadow-lg hover:bg-white/90 transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                        {getActivityIcon(activity.note.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-800">{activity.note.subject}</h3>
                          <Badge
                            variant="outline"
                            className={`${getActivityTypeColor(activity.note.type)} font-medium px-3 py-1`}
                          >
                            {activity.note.type}
                          </Badge>
                          {getStatusBadge(activity.status)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">{formatDate(activity.note.activityDate)}</span>
                          <span>at {formatTime(activity.note.activityDate)}</span>
                        </div>
                      </div>

                      <p className="text-slate-700 mb-4 leading-relaxed">{activity.note.plainText}</p>

                      {activity.attachments && activity.attachments.length > 0 && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                              <Paperclip className="h-4 w-4 text-slate-600" />
                              <span className="text-sm font-semibold text-slate-700">
                                Attachments ({activity.attachments.length})
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-xs bg-white/60 hover:bg-white/80 border border-slate-200"
                              onClick={() => openAttachmentsModal(activity)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View All
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {activity.attachments.slice(0, 6).map((attachment, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 p-2 bg-white/60 rounded-lg border border-slate-200 hover:bg-white/80 transition-colors cursor-pointer"
                                onClick={() => downloadAttachment(attachment.url, attachment.name)}
                              >
                                <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                <span className="text-xs text-slate-700 truncate font-medium">{attachment.name}</span>
                              </div>
                            ))}
                            {activity.attachments.length > 6 && (
                              <div className="flex items-center justify-center p-2 bg-slate-100 rounded-lg border border-slate-200">
                                <span className="text-xs text-slate-600 font-medium">
                                  +{activity.attachments.length - 6} more
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{activity.author.name}</span>
                        </div>
                        <div className="text-slate-400">•</div>
                        <div className="text-sm text-slate-500">Activity #{activities.length - index}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="bg-white/80 backdrop-blur rounded-xl border border-slate-200 p-2">
                  <Pagination className="gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={`${
                          currentPage === 0 ? "pointer-events-none opacity-50" : "hover:bg-slate-100"
                        } transition-colors`}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                      const pageIndex = Math.max(0, Math.min(currentPage - 2, totalPages - 5)) + index
                      if (pageIndex >= totalPages) return null

                      return (
                        <PaginationItem key={pageIndex}>
                          <Button
                            variant={currentPage === pageIndex ? "default" : "ghost"}
                            size="icon"
                            onClick={() => handlePageChange(pageIndex)}
                            className={`w-10 h-10 transition-colors ${
                              currentPage === pageIndex
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                : "hover:bg-slate-100"
                            }`}
                          >
                            {pageIndex + 1}
                          </Button>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={`${
                          currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "hover:bg-slate-100"
                        } transition-colors`}
                      />
                    </PaginationItem>
                  </Pagination>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Attachments Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              Attachments
              {selectedActivity && selectedActivity.attachments && (
                <Badge variant="outline" className="ml-2">
                  {selectedActivity.attachments.length} files
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedActivity && selectedActivity.note && (
                <span className="text-sm text-slate-500">From activity: {selectedActivity.note.subject}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {selectedActivity &&
              selectedActivity.attachments &&
              selectedActivity.attachments.map((attachment, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-white transition-colors cursor-pointer group"
                  onClick={() => downloadAttachment(attachment.url, attachment.name)}
                >
                  <div className="p-2 bg-white rounded-md border border-slate-200">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{attachment.name}</p>
                    <p className="text-xs text-slate-500">Click to download</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadAttachment(attachment.url, attachment.name)
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={closeAttachmentsModal}>
              Close
            </Button>
            {selectedActivity && selectedActivity.attachments && selectedActivity.attachments.length > 0 && (
              <Button
                onClick={() => {
                  selectedActivity.attachments.forEach((attachment) => {
                    setTimeout(() => {
                      downloadAttachment(attachment.url, attachment.name)
                    }, 200)
                  })
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
