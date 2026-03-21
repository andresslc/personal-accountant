"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Bell, Settings, Sun, Moon, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import { AIRecommendationsDialog } from "@/components/dashboard/ai-insights-dialog"

function useClientDate() {
  const [dateInfo, setDateInfo] = useState({ greeting: "", dateStr: "" })

  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    setDateInfo({
      greeting: hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening",
      dateStr: now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    })
  }, [])

  return dateInfo
}

export function Header() {
  const { user } = useAuth()
  const { greeting, dateStr } = useClientDate()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "User"

  const handleLogout = async () => {
    await fetch("/auth/signout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur">
      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-foreground">{greeting}, {displayName}</p>
          <p className="text-sm text-foreground/70">{dateStr}</p>
        </div>
        <div className="flex items-center gap-4">
          <AIRecommendationsDialog
            endpoint="/api/ai/finance-insights"
            title="Financial Recommendations"
            description="Get a comprehensive overview with recommendations across all your finances."
            triggerLabel="AI Recommendations"
            defaultAnalysisType="overview"
          />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={toggleTheme}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDark ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
