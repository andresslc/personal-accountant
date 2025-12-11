"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, TrendingUp, Wallet, BarChart3, CreditCard, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Transactions", icon: TrendingUp },
  { href: "/dashboard/budget", label: "Budget", icon: Wallet },
  { href: "/dashboard/debts", label: "Debts", icon: CreditCard },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg text-foreground">FinFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="border-t border-border p-4 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
