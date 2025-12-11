"use client"

import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { formatDate } from "@/lib/date-utils"

export function Header() {
  const greeting = getGreeting()

  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="ml-64 px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{greeting}</h2>
          <p className="text-sm text-muted-foreground mt-1">{formatDate(new Date())}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span>This Month</span>
          </div>
          <Button variant="outline" size="icon" className="relative bg-transparent">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 18) return "Good Afternoon"
  return "Good Evening"
}
