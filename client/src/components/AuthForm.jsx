"use client"

import  React from "react"

import { useState } from "react"
import { KeyRound, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setAuthCredentials } from "@/api/api"

export function AuthForm({ onAuthenticated }) {
  const [token, setToken] = useState("")
  const [instanceUrl, setInstanceUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!token || !instanceUrl) {
      setError("Both token and instance URL are required")
      return
    }

    setIsLoading(true)

    try {
      // Set the auth credentials for API calls
      setAuthCredentials(token, instanceUrl)

      // Call the onAuthenticated callback to notify parent component
      onAuthenticated()
    } catch (err) {
      console.error("Authentication error:", err)
      setError("Failed to authenticate. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>Enter your API token and instance URL to access the timeline data.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">API Token</Label>
            <div className="relative">
              <KeyRound className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="token"
                type="password"
                placeholder="Enter your API token"
                className="pl-8"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instanceUrl">Instance URL</Label>
            <Input
              id="instanceUrl"
              type="url"
              placeholder="https://api.example.com"
              value={instanceUrl}
              onChange={(e) => setInstanceUrl(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center">
                <LogIn className="mr-2 h-4 w-4" />
                Connect
              </span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
