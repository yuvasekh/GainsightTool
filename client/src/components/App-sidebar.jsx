"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronDown, Database, Server, LayoutDashboard, UserIcon, BellIcon, Search, X, Settings, Shield, Users, BarChart3, Cloud, Code, LogOut } from 'lucide-react'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
  SidebarSeparator
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

// Define menu items structure for searchability
const menuItems = [
  {
    group: "Overview",
    icon: <LayoutDashboard className="h-4 w-4 text-emerald-500" />,
    items: [
      {
        label: "Dashboard",
        path: "/",
        icon: <BarChart3 className="h-4 w-4" />,
      },
      {
        label: "Analytics",
        path: "/analytics",
        icon: <BarChart3 className="h-4 w-4" />,
        badge: "New"
      },
    ],
  },
  {
    group: "Administration",
    icon: <Server className="h-4 w-4 text-emerald-500" />,
    items: [
      {
        label: "Data Management",
        path: "/objects",
        icon: <Database className="h-4 w-4" />,
      },
      {
        label: "User Management",
        path: "/users",
        icon: <Users className="h-4 w-4" />,
      },
      {
        label: "Security",
        path: "/security",
        icon: <Shield className="h-4 w-4" />,
      },
    ],
  },
  {
    group: "Migration & AI",
    icon: <Cloud className="h-4 w-4 text-emerald-500" />,
    items: [
      {
        label: "Push CTAs",
        path: "/push-ctas",
        icon: <BellIcon className="h-4 w-4" />,
      },
      {
        label: "Timeline",
        path: "/timeline",
        icon: <Code className="h-4 w-4" />,
      },
      {
        label: "Reports",
        path: "/reports",
        icon: <BarChart3 className="h-4 w-4" />,
        badge: "3"
      },
    ],
  },
];

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
    <Sidebar className="border-r border-slate-200 dark:border-slate-800">
      <SidebarHeader className="pb-0">
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white">
              <span className="font-bold text-lg">W</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Wigmore IT</span>
          </div>
        </div>
        <SidebarSeparator />
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-slate-50 dark:bg-slate-900 pl-8 pr-8 text-sm border-slate-200 dark:border-slate-700 focus-visible:ring-emerald-500"
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
      <SidebarContent className="px-2">
        {filteredMenuItems.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            <p>No menu items found</p>
            <Button variant="link" className="mt-2 text-emerald-500 hover:text-emerald-600" onClick={clearSearch}>
              Clear search
            </Button>
          </div>
        ) : (
          filteredMenuItems.map((group, groupIndex) => (
            <SidebarGroup key={groupIndex} className="mb-2">
              <Collapsible defaultOpen={searchQuery.length > 0 || groupIndex === 0} className="group/collapsible">
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center py-2 px-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    {group.icon}
                    <span className="font-medium ml-2 text-sm">{group.group}</span>
                    {group.badge && (
                      <Badge variant="outline" className="ml-auto mr-2 px-1.5 py-0 text-xs">
                        {group.badge}
                      </Badge>
                    )}
                    <ChevronDown className="ml-auto h-4 w-4 text-slate-400 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item, itemIndex) => (
                        <SidebarMenuItem key={itemIndex}>
                          <SidebarMenuButton 
                            asChild 
                            isActive={isActive(item.path)}
                            className="transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            tooltip={item.label}
                          >
                            <Link to={item.path} className="flex items-center text-slate-700 dark:text-slate-300 text-sm">
                              {item.icon && <span className="mr-2">{item.icon}</span>}
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                          {item.badge && (
                            <SidebarMenuBadge className={`${item.badge === 'New' ? 'bg-emerald-500' : 'bg-slate-600'} text-white`}>
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
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
        <SidebarSeparator />
        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-8 w-8 border-2 border-emerald-500">
                    <AvatarImage src="/placeholder.svg?key=r5yvn" alt="John Doe" />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate text-left">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="truncate text-xs text-muted-foreground">john.doe@wigmore-it.com</p>
                  </div>
                  <Settings className="h-4 w-4 text-slate-400" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
