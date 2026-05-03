"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Toaster, toast } from "sonner"
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  Edit2,
  Pause,
  Play,
  Plus,
  Repeat,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/components/auth-provider"
import { useCurrency } from "@/components/currency-provider"
import {
  deleteSubscription,
  updateSubscription,
  type Subscription,
  type SubscriptionsPageData,
} from "@/lib/data/dashboard-data"
import {
  getStatusColorClass,
  getStatusLabel,
  getSubscriptionStatus,
  monthlyEquivalent,
  todayISO,
  type SubscriptionStatus,
} from "@/lib/utils/subscription-status"
import { SubscriptionQuickCreateDialog } from "@/components/dashboard/subscription-quick-create-dialog"
import { SubscriptionMarkPaidDialog } from "@/components/dashboard/subscription-mark-paid-dialog"

interface SubscriptionsManagerProps {
  initial: SubscriptionsPageData
}

const formatDueDate = (iso: string | null): string => {
  if (!iso) return "Not scheduled"
  const d = new Date(`${iso}T00:00:00Z`)
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

const SECTION_ORDER: {
  key: SubscriptionStatus | "active"
  title: string
  accent: string
  iconAccent: string
  match: (status: SubscriptionStatus) => boolean
}[] = [
  {
    key: "overdue",
    title: "Overdue",
    accent: "text-red-600 dark:text-red-400",
    iconAccent: "bg-red-500/10 text-red-600 dark:text-red-400",
    match: (s) => s === "overdue",
  },
  {
    key: "upcoming",
    title: "Upcoming this week",
    accent: "text-amber-600 dark:text-amber-400",
    iconAccent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    match: (s) => s === "upcoming",
  },
  {
    key: "active",
    title: "Active",
    accent: "text-foreground",
    iconAccent: "bg-muted text-foreground",
    match: (s) => s === "scheduled" || s === "paid",
  },
  {
    key: "paused",
    title: "Paused",
    accent: "text-muted-foreground",
    iconAccent: "bg-muted text-muted-foreground",
    match: (s) => s === "paused",
  },
]

export function SubscriptionsManager({ initial }: SubscriptionsManagerProps) {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { format } = useCurrency()

  const [subs, setSubs] = useState<Subscription[]>(initial.subscriptions)
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [markingPaid, setMarkingPaid] = useState<Subscription | null>(null)
  const [markPaidOpen, setMarkPaidOpen] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)

  // Auto-open create dialog when arriving from /dashboard/subscriptions?create=true
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setCreateDialogOpen(true)
    }
  }, [searchParams])

  const today = todayISO()

  // Recompute KPIs from local state so optimistic mutations are reflected.
  const monthlyRecurringCost = useMemo(
    () =>
      subs.filter((s) => s.active).reduce((sum, s) => sum + monthlyEquivalent(s), 0),
    [subs],
  )
  const upcomingCount = useMemo(
    () =>
      subs.filter((s) => getSubscriptionStatus(s, today) === "upcoming").length,
    [subs, today],
  )
  const overdueCount = useMemo(
    () =>
      subs.filter((s) => getSubscriptionStatus(s, today) === "overdue").length,
    [subs, today],
  )

  const sections = useMemo(() => {
    return SECTION_ORDER.map((section) => ({
      ...section,
      items: subs.filter((s) => section.match(getSubscriptionStatus(s, today))),
    })).filter((section) => section.items.length > 0)
  }, [subs, today])

  const handleSubCreated = (created: Subscription) => {
    setSubs((current) => [created, ...current])
    toast.success(`Added ${created.name}`)
  }

  const handleSubUpdated = (updated: Subscription) => {
    setSubs((current) =>
      current.map((s) => (s.id === updated.id ? updated : s)),
    )
    toast.success(`Updated ${updated.name}`)
    setEditing(null)
  }

  const handleEdit = (sub: Subscription) => {
    setEditing(sub)
    setEditDialogOpen(true)
  }

  const handleMarkPaid = (sub: Subscription) => {
    setMarkingPaid(sub)
    setMarkPaidOpen(true)
  }

  const handlePaidComplete = (
    subId: number,
    result: { transactionId: number | null; nextDueDate: string; paidDate: string },
  ) => {
    setSubs((current) =>
      current.map((s) =>
        s.id === subId
          ? {
              ...s,
              last_paid_date: result.paidDate,
              next_due_date: result.nextDueDate,
            }
          : s,
      ),
    )
  }

  const handleTogglePause = async (sub: Subscription) => {
    if (!user) return
    setBusyId(sub.id)
    try {
      const updated = await updateSubscription(sub.id, user.id, {
        active: !sub.active,
      })
      if (!updated) {
        toast.error("Could not update subscription.")
        return
      }
      setSubs((current) => current.map((s) => (s.id === sub.id ? updated : s)))
      toast.success(updated.active ? `Resumed ${updated.name}` : `Paused ${updated.name}`)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (sub: Subscription) => {
    if (!user) return
    setBusyId(sub.id)
    try {
      const ok = await deleteSubscription(sub.id, user.id)
      if (!ok) {
        toast.error("Could not delete subscription.")
        return
      }
      setSubs((current) => current.filter((s) => s.id !== sub.id))
      toast.success(`Deleted ${sub.name}`)
    } finally {
      setBusyId(null)
    }
  }

  const empty = subs.length === 0

  return (
    <div className="flex-1 space-y-6 md:space-y-8">
      <Toaster richColors position="top-right" closeButton />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Subscriptions
          </h1>
          <p className="text-muted-foreground mt-1">
            Track recurring spend, mark renewals as paid, and pause anything you don&apos;t need.
          </p>
        </div>
        <SubscriptionQuickCreateDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreated={handleSubCreated}
          trigger={
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4" />
              Add Subscription
            </Button>
          }
        />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Recurring
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Repeat className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {format(monthlyRecurringCost)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across {subs.filter((s) => s.active).length} active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming (7d)</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {upcomingCount}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Due in the next 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {overdueCount}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Need attention now
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Empty state */}
      {empty ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Repeat className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                No subscriptions yet
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Add your recurring services so FinFlow can track spending, send renewal reminders, and surface savings.
              </p>
            </div>
            <Button
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add your first subscription
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.key}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className={`text-lg font-semibold ${section.accent}`}>
                  {section.title}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {section.items.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {section.items.map((sub) => {
                  const status = getSubscriptionStatus(sub, today)
                  const canMarkPaid =
                    status === "overdue" ||
                    status === "upcoming" ||
                    status === "scheduled"
                  const monthly = monthlyEquivalent(sub)
                  const showMonthlyEq = sub.frequency !== "Monthly"
                  const isBusy = busyId === sub.id

                  return (
                    <Card key={sub.id} className="flex flex-col">
                      <CardHeader className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <CardTitle className="text-base truncate">
                              {sub.name}
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              {sub.category ? (
                                <Badge variant="outline" className="text-xs">
                                  {sub.category}
                                </Badge>
                              ) : null}
                              <Badge variant="outline" className="text-xs">
                                {sub.frequency}
                              </Badge>
                              {sub.auto_pay ? (
                                <Badge variant="outline" className="text-xs">
                                  Auto-pay
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                          <span
                            className={`shrink-0 px-2 py-1 rounded-md text-[11px] font-medium ${getStatusColorClass(status)}`}
                          >
                            {getStatusLabel(status)}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1 space-y-3">
                        <div>
                          <p className="text-2xl font-bold text-foreground leading-none">
                            {format(sub.amount)}
                          </p>
                          {showMonthlyEq ? (
                            <p className="text-xs text-muted-foreground mt-1">
                              ≈ {format(monthly)} / month
                            </p>
                          ) : null}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Next:{" "}
                          <span className="font-medium text-foreground">
                            {formatDueDate(sub.next_due_date)}
                          </span>
                        </div>
                        {sub.payment_method ? (
                          <p className="text-xs text-muted-foreground">
                            Paid via {sub.payment_method}
                          </p>
                        ) : null}
                      </CardContent>

                      <div className="flex flex-wrap items-center justify-between gap-2 px-6 pb-6">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit subscription"
                            disabled={!user || isBusy}
                            onClick={() => handleEdit(sub)}
                            className="h-9 w-9"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={sub.active ? "Pause subscription" : "Resume subscription"}
                            disabled={!user || isBusy}
                            onClick={() => handleTogglePause(sub)}
                            className="h-9 w-9"
                          >
                            {sub.active ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Delete subscription"
                                disabled={!user || isBusy}
                                className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this subscription?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This permanently removes {sub.name}. Past transactions stay untouched.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(sub)}
                                  className="bg-destructive text-white hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        {canMarkPaid ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            disabled={!user || isBusy}
                            onClick={() => handleMarkPaid(sub)}
                          >
                            <Check className="w-3.5 h-3.5" />
                            Mark Paid
                          </Button>
                        ) : null}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Edit dialog (mounted only when an `editing` row is selected to keep the
          form state cleanly scoped per edit invocation). */}
      {editing ? (
        <SubscriptionQuickCreateDialog
          open={editDialogOpen}
          onOpenChange={(next) => {
            setEditDialogOpen(next)
            if (!next) setEditing(null)
          }}
          initial={editing}
          onUpdated={handleSubUpdated}
        />
      ) : null}

      <SubscriptionMarkPaidDialog
        open={markPaidOpen}
        onOpenChange={(next) => {
          setMarkPaidOpen(next)
          if (!next) setMarkingPaid(null)
        }}
        subscription={markingPaid}
        onPaid={(result) => {
          if (markingPaid) handlePaidComplete(markingPaid.id, result)
        }}
      />
    </div>
  )
}
