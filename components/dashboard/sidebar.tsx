"use client"

import { createContext, useContext, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, TrendingUp, Wallet, BarChart3, CreditCard, MessageSquare, PanelLeftClose, PanelLeft, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

type SidebarContextType = {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
})

export function useSidebar() {
  return useContext(SidebarContext)
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <SidebarContext value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext>
  )
}

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Transactions", icon: TrendingUp },
  { href: "/dashboard/budget", label: "Budget", icon: Wallet },
  { href: "/dashboard/debts", label: "Debts", icon: CreditCard },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function MobileSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { mobileOpen, setMobileOpen } = useSidebar()

  const handleLogout = async () => {
    setMobileOpen(false)
    await fetch("/auth/signout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-64 p-0 flex flex-col">
        <SheetHeader className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <SheetTitle className="font-bold text-lg">FinFlow</SheetTitle>
          </div>
        </SheetHeader>
        <nav className="flex-1 p-2 space-y-1">
          {navigationItems.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-border p-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-destructive hover:bg-destructive/10 w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { collapsed, setCollapsed } = useSidebar()

  const handleLogout = async () => {
    await fetch("/auth/signout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <aside
      className={cn(
        "hidden md:flex sticky top-0 h-screen border-r border-border bg-card flex-col shrink-0 transition-all duration-300 overflow-hidden",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo — click to toggle */}
      <div className="p-4 border-b border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-foreground whitespace-nowrap">FinFlow</span>
          )}
          <div className="ml-auto shrink-0">
            {collapsed ? (
              <PanelLeft className="w-4 h-4 text-foreground/50" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-foreground/50" />
            )}
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navigationItems.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="font-medium whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-border p-2">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-destructive hover:bg-destructive/10 w-full",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && (
            <span className="font-medium whitespace-nowrap">Logout</span>
          )}
        </button>
      </div>
    </aside>
  )
}
