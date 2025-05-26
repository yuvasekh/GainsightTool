"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { BarChart3, Cloud, Code, LogOut, Search, Settings, Sparkles, UserIcon, X } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"

const menuItems = [
  {
    label: "Fields Migration Management",
    path: "/",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    label: "Timeline",
    path: "/timeline",
    icon: <Code className="h-4 w-4" />,
  },
    {
    label: "Timelinemigration",
    path: "/timelinemigration",
    icon: <Code className="h-4 w-4" />,
  },
]

const AppSidebar = () => {
  const [searchQuery, setSearchQuery] = React.useState("")
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const filteredItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const clearSearch = () => setSearchQuery("")

  return (
    <Sidebar className="border-r border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <SidebarHeader className="pb-0">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg">
                <span className="font-bold text-xl text-white">W</span>
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse"></div>
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Wigmore IT
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Sparkles className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Pro</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />

        <div className="px-4 py-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search menu..."
              className="w-full bg-white/60 dark:bg-slate-800/60 pl-10 pr-10 py-2.5 text-sm border-slate-200/50 dark:border-slate-700/50 rounded-lg shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarMenu>
          {filteredItems.map((item, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.path)}
                className={`
                  mx-2 mb-2 rounded-lg transition-all duration-300 hover:scale-[1.02]
                  ${isActive(item.path)
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }
                `}
              >
                <Link to={item.path} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium">
                  <div className={`p-1.5 rounded-md ${isActive(item.path) ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"}`}>
                    {React.cloneElement(item.icon, {
                      className: `h-4 w-4 ${isActive(item.path) ? "text-white" : "text-slate-600 dark:text-slate-300"}`
                    })}
                  </div>
                  <span className={isActive(item.path) ? "text-white" : "text-slate-700 dark:text-slate-200"}>
                    {item.label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60">
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <Avatar className="h-10 w-10 border-2 border-emerald-400 shadow-md">
              <AvatarImage src="/placeholder.svg?key=profile" />
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-semibold">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">John Doe</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">john.doe@wigmore-it.com</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" size="sm" className="flex gap-2 justify-start text-xs px-3 py-2 h-auto rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <UserIcon className="h-3 w-3 text-blue-500" />
              Profile
            </Button>
            <Button variant="ghost" size="sm" className="flex gap-2 justify-start text-xs px-3 py-2 h-auto rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <Settings className="h-3 w-3 text-purple-500" />
              Settings
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full flex gap-2 justify-center text-xs px-3 py-2.5 h-auto rounded-lg text-red-600 border border-red-200/50 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            <LogOut className="h-3 w-3" />
            Log out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
