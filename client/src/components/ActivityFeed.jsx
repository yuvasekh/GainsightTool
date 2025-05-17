"use client"

import { useState } from "react"
// import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Edit, MessageSquare, ThumbsUp } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthForm } from "@/components/auth-form"
import { fetchTimelineData } from "@/api/api"
import { useNavigate } from "react-router-dom"

export function ActivityFeed() {
  const router = useNavigate()
  const [filter, setFilter] = useState("all")
  const [activityData, setActivityData] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Filter activities based on selected tab
  const filteredActivities = activityData.filter((activity) => {
    if (filter === "all") return true
    if (filter === "edited") return activity.status === "EDITED"
    if (filter === "posted") return activity.status === "POSTED"
    return true
  })

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
    fetchData()
  }

  const fetchData = async () => {
    setIsLoading(true)
    setError("")

    try {
      const result = await fetchTimelineData()
      setActivityData(result)
    } catch (err) {
      console.error("Error fetching timeline data:", err)
      setError("Failed to fetch timeline data. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = (activity) => {
    // Navigate to the company detail page with the company ID
    const companyId = activity.contexts[0]?.id
    if (companyId) {
    router(`/timeline/${companyId}`)
    }
  }

  if (!isAuthenticated) {
    return <AuthForm onAuthenticated={handleAuthenticated} />
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Activities</TabsTrigger>
            <TabsTrigger value="posted">Posted</TabsTrigger>
            <TabsTrigger value="edited">Edited</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            {isLoading ? "Loading..." : "Refresh Data"}
          </Button>
        </div>
        <TabsContent value="all" className="mt-6">
          <ActivityList activities={filteredActivities} onCardClick={handleCardClick} />
        </TabsContent>
        <TabsContent value="posted" className="mt-6">
          <ActivityList activities={filteredActivities} onCardClick={handleCardClick} />
        </TabsContent>
        <TabsContent value="edited" className="mt-6">
          <ActivityList activities={filteredActivities} onCardClick={handleCardClick} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ActivityList({ activities, onCardClick }) {
  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No activities found. Try changing your filter or refreshing the data.
        </div>
      ) : (
        activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} onClick={() => onCardClick(activity)} />
        ))
      )}
    </div>
  )
}

function ActivityCard({ activity, onClick }) {
  // Format dates for display
  const formattedDate = formatDistanceToNow(new Date(activity.note.activityDate), { addSuffix: true })
  const modifiedDate = formatDistanceToNow(new Date(activity.lastModifiedDate), { addSuffix: true })

  // Get company name from context
  const companyName = activity.contexts[0]?.lbl || "Unknown Company"

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Parse HTML content (simple version)
  const parseHtml = (html) => {
    return html.replace(/<\/?[^>]+(>|$)/g, "")
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${getInitials(activity.author.name)}`} />
            <AvatarFallback>{getInitials(activity.author.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{activity.author.name}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <span>{formattedDate}</span>
              {activity.status === "EDITED" && (
                <span className="text-xs text-muted-foreground">(edited {modifiedDate})</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={activity.status === "EDITED" ? "outline" : "default"}>
            {activity.status === "EDITED" ? <Edit className="mr-1 h-3 w-3" /> : null}
            {activity.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <Badge variant="secondary" className="mb-2">
            {companyName}
          </Badge>
          <h3 className="text-lg font-semibold mt-2">{activity.note.subject}</h3>
        </div>
        <p className="text-muted-foreground">{parseHtml(activity.note.content)}</p>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ThumbsUp className="mr-1 h-4 w-4" />
            Like
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <MessageSquare className="mr-1 h-4 w-4" />
            Comment
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">Source: {activity.meta.source}</div>
      </CardFooter>
    </Card>
  )
}
