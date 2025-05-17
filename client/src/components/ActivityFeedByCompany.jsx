"use client"

import { useEffect, useState } from "react"
// import { useParams } from "next/navigation"
import { ArrowLeft, Download, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchCompanyTimeline, downloadAttachments } from "@/api/api"
import { useNavigate,useParams } from "react-router-dom"

export default function CompanyTimelinePage() {
  const router = useNavigate()
  const params = useParams()
  const companyId = params.id 

  const [companyData, setCompanyData] = useState(null)
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await fetchCompanyTimeline(companyId)
        setActivities(data)

        // Extract company info from the first activity
        if (data.length > 0) {
          const companyContext = data[0].contexts.find((ctx) => ctx.id === companyId)
          if (companyContext) {
            setCompanyData({
              id: companyId,
              name: companyContext.lbl,
              system: companyContext.esys,
            })
          }
        }
      } catch (err) {
        console.error("Error fetching company timeline:", err)
        setError("Failed to load company timeline data")
      } finally {
        setIsLoading(false)
      }
    }

    if (companyId) {
      fetchData()
    }
  }, [companyId])

  const handleDownloadAll = async () => {
    try {
      // In a real app, you would implement a way to download all attachments
      // For now, we'll just show an alert
      alert("Download functionality would be implemented here")

      // Example of how you might download attachments for a specific activity
      // if (activities.length > 0) {
      //   await downloadAttachments(activities[0].id)
      // }
    } catch (err) {
      console.error("Error downloading attachments:", err)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      {isLoading ? (
        <CompanyDetailSkeleton />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold">{companyData?.name || "Company Timeline"}</h1>
              <p className="text-muted-foreground">{companyData?.system || "Timeline data"}</p>
            </div>
            <Button onClick={handleDownloadAll}>
              <Download className="mr-2 h-4 w-4" />
              Download All Attachments
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Activities</CardTitle>
                <CardDescription>Total activities for this company</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{activities.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latest Update</CardTitle>
                <CardDescription>Most recent activity</CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <p className="font-medium">{activities[0].note.subject}</p>
                ) : (
                  <p className="text-muted-foreground">No activities found</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
                <CardDescription>Files related to this company</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                <p>0 attachments available</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={handleDownloadAll}>
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              </CardFooter>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mb-4">Company Timeline</h2>
          {activities.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No activities found for this company.</div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ActivityCard({ activity }) {
  // This is a simplified version of the card from the ActivityFeed component
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>{activity.note.subject}</CardTitle>
          <p className="text-sm text-muted-foreground">{new Date(activity.note.activityDate).toLocaleDateString()}</p>
        </div>
        <CardDescription>By {activity.author.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{activity.note.plainText}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">Status: {activity.status}</p>
        {activity.attachments && activity.attachments.length > 0 ? (
          <Button size="sm" variant="outline" onClick={() => downloadAttachments(activity.id)}>
            <Download className="mr-2 h-4 w-4" />
            Download Attachments ({activity.attachments.length})
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">No attachments</p>
        )}
      </CardFooter>
    </Card>
  )
}

function CompanyDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Skeleton className="h-8 w-48 mb-4" />

      {[1, 2, 3].map((i) => (
        <Card key={i} className="mb-4">
          <CardHeader>
            <div className="flex justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-8 w-40" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
