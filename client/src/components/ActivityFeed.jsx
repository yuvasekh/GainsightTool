"use client"

import { useState, useEffect } from "react"

import { CalendarClock, MessageCircle, User, Building, Edit, Check, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchTimelineData } from "@/api/api"
import { useNavigate } from "react-router-dom"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
export default function ActivityTimeline() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize] = useState(20)

  const router = useNavigate()

  useEffect(() => {
    fetchActivities(currentPage)
  }, [currentPage])
useEffect(()=>
{

},[activities])
  const fetchActivities = async (page) => {
    try {
      setLoading(true)
        const response = await fetchTimelineData()
          console.log(response)
        setActivities(response.data.content)
         setTotalPages(response.data.page.totalElements)
            setLoading(false)
    } catch (err) {
      console.error("Error fetching timeline data:", err)
      setError("Failed to load timeline data. Please try again later.")
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleCompanyClick = (companyId, companyName) => {
    router(`/company/${companyId}`)
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
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => fetchActivities(currentPage)}>Try Again</Button>
      </div>
    )
  }

  return (
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

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
              // Show first page, last page, and pages around current page
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
                className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
