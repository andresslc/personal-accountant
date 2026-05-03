"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Calendar, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCurrency } from "@/components/currency-provider"
import { SubscriptionMarkPaidDialog } from "@/components/dashboard/subscription-mark-paid-dialog"
import {
  getUpcomingRenewals,
  type UpcomingRenewal,
} from "@/lib/predictions"
import type { Subscription } from "@/lib/data/dashboard-data"
import { cn } from "@/lib/utils"

interface UpcomingExpensesWidgetProps {
  initialSubscriptions: Subscription[]
}

type RangeKey = "7d" | "30d"

const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: "7d", label: "7d", days: 7 },
  { key: "30d", label: "30d", days: 30 },
]

const formatRenewalDate = (renewal: UpcomingRenewal): string => {
  if (renewal.daysUntil <= 0) return "Today"
  if (renewal.daysUntil === 1) return "Tomorrow"
  if (renewal.daysUntil <= 7) return `In ${renewal.daysUntil} days`
  const d = new Date(`${renewal.date}T00:00:00Z`)
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

const dateAccentClass = (daysUntil: number): string => {
  if (daysUntil <= 0) return "text-red-600 dark:text-red-400"
  if (daysUntil <= 3) return "text-amber-600 dark:text-amber-400"
  return "text-foreground"
}

export function UpcomingExpensesWidget({
  initialSubscriptions,
}: UpcomingExpensesWidgetProps) {
  const { format } = useCurrency()
  const [range, setRange] = useState<RangeKey>("7d")
  const [subs, setSubs] = useState<Subscription[]>(initialSubscriptions)
  const [markingPaid, setMarkingPaid] = useState<Subscription | null>(null)
  const [markPaidOpen, setMarkPaidOpen] = useState(false)

  const activeRange = RANGES.find((r) => r.key === range) ?? RANGES[0]

  const renewals = useMemo(
    () => getUpcomingRenewals(subs, activeRange.days),
    [subs, activeRange.days],
  )

  const handleMarkPaidClick = (sub: Subscription) => {
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

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-base sm:text-lg truncate">
            Upcoming Expenses
          </CardTitle>
        </div>
        <div
          role="radiogroup"
          aria-label="Upcoming expenses range"
          className="inline-flex rounded-md border border-border bg-muted/40 p-0.5"
        >
          {RANGES.map((option) => {
            const isActive = option.key === range
            return (
              <button
                key={option.key}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setRange(option.key)}
                className={cn(
                  "min-h-[32px] min-w-[44px] px-3 text-xs font-medium rounded-[6px] transition-colors",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {renewals.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8 gap-2">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-[28ch]">
              No subscriptions due in the next {activeRange.days} days. Enjoy the breather.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border -mx-2">
            {renewals.map((renewal) => {
              const sub = subs.find((s) => s.id === renewal.id)
              return (
                <li
                  key={renewal.id}
                  className="flex flex-col gap-2 px-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex flex-col items-center justify-center min-w-[60px] sm:min-w-[72px]">
                      <span
                        className={cn(
                          "text-xs font-semibold uppercase tracking-wide",
                          dateAccentClass(renewal.daysUntil),
                        )}
                      >
                        {formatRenewalDate(renewal)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {renewal.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {renewal.category ? (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {renewal.category}
                          </Badge>
                        ) : null}
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {renewal.frequency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 sm:justify-end">
                    <span className="text-sm font-semibold text-foreground tabular-nums">
                      {format(renewal.amount)}
                    </span>
                    {sub ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() => handleMarkPaidClick(sub)}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark Paid
                      </Button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <div className="mt-4 pt-3 border-t border-border">
          <Link
            href="/dashboard/subscriptions"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all subscriptions
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardContent>

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
    </Card>
  )
}
