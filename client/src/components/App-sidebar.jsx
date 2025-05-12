"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronDown, Database, LaptopIcon, LayoutDashboard, UserIcon, BellIcon, Search, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Define menu items structure for searchability
const menuItems = [
  {
    group: "Instances & Tables",
    icon: <Database className="mr-2 h-4 w-4 text-primary" />,
    items: [
      {
        label: "Instance Manager",
        path: "/",
        // icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
      },
      {
        label: "Manage Tables",
        path: "/objects",
      },
      {
        label: "Dashboard",
        path: "/dashboard",
      },
    ],
  },
  {
    group: "Adminstration",
    icon: <LaptopIcon className="mr-2 h-4 w-4 text-primary" />,
    items: [
      {
        label: "Data Management",
        path: "objects",
      }
    ],
  },
  {
    group: "Migration & AI",
    icon: <BellIcon className="mr-2 h-4 w-4 text-primary" />,
    items: [
      {
        label: "Field Migration",
        path: "/migrations",
      },
      {
        label: "Push CTAs",
        path: "/push-ctas",
      },
      {
        label: "AI Recommendations",
        path: "/ai-recommendations",
        badge: "3",
      },
    ],
  },
]

const AppSidebar = () => {
  const [searchQuery, setSearchQuery] = React.useState("")
  const location = useLocation()

  // Check if the current path matches the link
  const isActive = (path) => {
    return location.pathname === path
  }

  // Filter menu items based on search query
  const filteredMenuItems = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return menuItems
    }

    const query = searchQuery.toLowerCase()

    return menuItems
      .map((group) => {
        // Filter items within each group
        const filteredItems = group.items.filter((item) => item.label.toLowerCase().includes(query))

        // Only return groups that have matching items
        if (filteredItems.length > 0) {
          return {
            ...group,
            items: filteredItems,
          }
        }
        return null
      })
      .filter(Boolean) // Remove null groups
  }, [searchQuery])

  // Clear search query
  const clearSearch = () => {
    setSearchQuery("")
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background pl-8 pr-8 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {filteredMenuItems.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            <p>No menu items found</p>
            <Button variant="link" className="mt-2 text-primary" onClick={clearSearch}>
              Clear search
            </Button>
          </div>
        ) : (
          filteredMenuItems.map((group, groupIndex) => (
            <SidebarGroup key={groupIndex}>
              <Collapsible defaultOpen={searchQuery.length > 0} className="group/collapsible">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center">
                    {group.icon}
                    <span className="font-medium">{group.group}</span>
                    {group.badge && (
                      <Badge variant="outline" className="ml-auto mr-2 px-1.5 py-0 text-xs">
                        {group.badge}
                      </Badge>
                    )}
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item, itemIndex) => (
                        <SidebarMenuItem key={itemIndex}>
                          <SidebarMenuButton asChild isActive={isActive(item.path)}>
                            <Link to={item.path} className="flex items-center text-primary text-[12px]">
                              {item.icon}
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                          {item.badge && <SidebarMenuBadge className="bg-primary">{item.badge}</SidebarMenuBadge>}
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium">John Doe</p>
              <p className="truncate text-xs text-muted-foreground">john.doe@example.com</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
