"use client"

import { DebtsTracker } from "@/components/dashboard/debts-tracker"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

export default function DebtsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1">
        <Header />
        <div className="p-8">
          <DebtsTracker />
        </div>
      </main>
    
    </div>
  )
}
