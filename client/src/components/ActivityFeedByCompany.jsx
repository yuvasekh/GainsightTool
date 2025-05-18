"use client"

import { useEffect, useState } from "react"

import { ArrowLeft, Building, CalendarClock, MessageCircle, User, Edit, Check, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"
import { useNavigate, useParams } from "react-router-dom"
import { fetchCompanyTimeline } from "@/api/api"

export default function CompanyTimeline() {
 let value=useParams()
 console.log(value)
  const [companyName, setCompanyName] = useState("")
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const router = useNavigate()

useEffect(()=>
{
fetchCompanyTimelineData()
},[])

  const fetchCompanyTimelineData = async (page) => {
    try {
      setLoading(true)

    

   let responseData=await fetchCompanyTimeline("","",20,value?.companyId,0)
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

  const downloadAttachment = async (attachmentUrl, fileName) => {
    try {
      const response = await fetch(attachmentUrl)

      if (!response.ok) {
        throw new Error(`Failed to download attachment: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading attachment:", error)
      alert("Failed to download attachment. Please try again.")
    }
  }

  const downloadAllAttachments = () => {
    // Count total attachments
    const totalAttachments = activities.reduce((count, activity) => {
      return count + (activity.attachments?.length || 0)
    }, 0)

    if (totalAttachments === 0) {
      alert("No attachments available to download.")
      return
    }

    // For each activity with attachments, download them
    activities.forEach((activity) => {
      if (activity.attachments && activity.attachments.length > 0) {
        activity.attachments.forEach((attachment) => {
          // Use a timeout to prevent browser from blocking multiple downloads
          setTimeout(() => {
            downloadAttachment(attachment.url, attachment.name)
          }, 500)
        })
      }
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

  if (loading && currentPage === 0) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-6 pl-0 flex items-center gap-2" onClick={() => router()}>
          <ArrowLeft className="h-4 w-4" />
          Back to Timeline
        </Button>

        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-6 pl-0 flex items-center gap-2" onClick={() => router()}>
          <ArrowLeft className="h-4 w-4" />
          Back to Timeline
        </Button>

        <div className="p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchCompanyTimeline(currentPage)}>Try Again</Button>
        </div>
      </main>
    )
  }

  const hasAttachments = activities.some((activity) => activity.attachments && activity.attachments.length > 0)

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" className="pl-0 flex items-center gap-2" onClick={() => router()}>
          <ArrowLeft className="h-4 w-4" />
          Back to Timeline
        </Button>

        {hasAttachments && (
          <Button variant="outline" className="flex items-center gap-2" onClick={downloadAllAttachments}>
            <Download className="h-4 w-4" />
            Download All Attachments
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Building className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{companyName} Timeline</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="p-12 text-center border rounded-lg bg-slate-50">
          <p className="text-muted-foreground">No activities found for this company.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
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
                              onClick={() => downloadAttachment(attachment.url, attachment.name)}
                            >
                              <FileText className="h-3 w-3" />
                              {attachment.name}
                              <Download className="h-3 w-3 ml-1" />
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-3.5 w-3.5 mr-1" />
                      <span>{activity.author.name}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, index) => (
                <PaginationItem key={index}>
                  <Button
                    variant={currentPage === index ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageChange(index)}
                    className="w-9 h-9"
                  >
                    {index + 1}
                  </Button>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </Pagination>
          )}
        </>
      )}
    </main>
  )
}
