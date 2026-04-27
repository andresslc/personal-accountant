"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { CalendarClock, Download, Repeat } from "lucide-react"
import { getChartColors, getDateRangeOptions } from "@/lib/data/dashboard-data"
import type {
  MonthlyData,
  CategoryExpense,
  SpendingRank,
  Subscription,
  NetWorthPoint,
} from "@/lib/data/dashboard-data"
import { AIRecommendationsDialog } from "@/components/dashboard/ai-insights-dialog"
import { useCurrency } from "@/components/currency-provider"
import {
  getMonthlyRecurringCost,
  getRecurringCostAsPercentOfIncome,
  getUpcomingRenewals,
  type UpcomingRenewal,
} from "@/lib/predictions"
import {
  getStatusColorClass,
  getStatusLabel,
  getSubscriptionStatus,
  monthlyEquivalent,
} from "@/lib/utils/subscription-status"

type AnalyticsReportsProps = {
  initialCashFlow: MonthlyData[]
  initialExpenseBreakdown: CategoryExpense[]
  initialTopSpendingCategories: SpendingRank[]
  initialSubscriptions: Subscription[]
  initialNetWorth: NetWorthPoint[]
}

type RangeValue = "3m" | "6m" | "12m"

const rangeMonths: Record<RangeValue, number> = {
  "3m": 3,
  "6m": 6,
  "12m": 12,
}

const formatRenewalDateLabel = (renewal: UpcomingRenewal): string => {
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

export function AnalyticsReports({
  initialCashFlow,
  initialExpenseBreakdown,
  initialTopSpendingCategories,
  initialSubscriptions,
  initialNetWorth,
}: AnalyticsReportsProps) {
  const { format } = useCurrency()
  const chartColors = getChartColors()
  const dateRangeOptions = getDateRangeOptions()
  const [range, setRange] = useState<RangeValue>("12m")

  const cashFlow = useMemo(
    () => initialCashFlow.slice(-rangeMonths[range]),
    [initialCashFlow, range]
  )
  const netWorth = useMemo(
    () => initialNetWorth.slice(-rangeMonths[range]),
    [initialNetWorth, range]
  )

  // Average monthly income across the selected range — used to express
  // recurring commitments as a % of income. Falls back to 0 when there is
  // no cash-flow data so the KPI degrades gracefully instead of dividing by zero.
  const monthlyIncome = useMemo(() => {
    if (cashFlow.length === 0) return 0
    const total = cashFlow.reduce((sum, m) => sum + m.income, 0)
    return total / cashFlow.length
  }, [cashFlow])

  const activeSubscriptions = useMemo(
    () => initialSubscriptions.filter((s) => s.active),
    [initialSubscriptions],
  )

  const monthlyRecurringCost = useMemo(
    () => getMonthlyRecurringCost(activeSubscriptions),
    [activeSubscriptions],
  )

  const recurringPercentOfIncome = useMemo(
    () => getRecurringCostAsPercentOfIncome(activeSubscriptions, monthlyIncome),
    [activeSubscriptions, monthlyIncome],
  )

  const next30Renewals: UpcomingRenewal[] = useMemo(
    () => getUpcomingRenewals(initialSubscriptions, 30),
    [initialSubscriptions],
  )

  const sortedActiveByMonthly = useMemo(
    () =>
      [...activeSubscriptions].sort(
        (a, b) => monthlyEquivalent(b) - monthlyEquivalent(a),
      ),
    [activeSubscriptions],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <Select value={range} onValueChange={(v) => setRange(v as RangeValue)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <AIRecommendationsDialog
            endpoint="/api/ai/insights/reports"
            title="AI Financial Report"
            description="Generate a comprehensive written financial report with trends and outlook."
            triggerLabel="Full Report"
            defaultAnalysisType="report_summary"
            lockAnalysisType
          />
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-6">Cash Flow Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashFlow}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "var(--foreground)" }}
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="var(--chart-1)" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="var(--chart-3)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-6">Expense Breakdown</h3>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={initialExpenseBreakdown} cx="50%" cy="50%" outerRadius="75%" fill="#8884d8" dataKey="value">
                    {initialExpenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center">
              {initialExpenseBreakdown.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  ></div>
                  <span className="text-sm text-foreground">{item.name}</span>
                  <span className="text-sm font-semibold text-foreground/70 ml-auto whitespace-nowrap">{format(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-6">Top Spending Categories</h3>
          <div className="space-y-4">
            {initialTopSpendingCategories.map((item) => (
              <div key={item.rank} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-foreground/50">{item.rank}</span>
                  <span className="text-sm font-medium text-foreground">{item.category}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{format(item.amount)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Repeat className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Recurring Commitments</h3>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Monthly
              </p>
              <p className="text-sm sm:text-base font-bold text-foreground mt-1 truncate">
                {format(monthlyRecurringCost)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                % of Income
              </p>
              <p className="text-sm sm:text-base font-bold text-foreground mt-1">
                {monthlyIncome > 0
                  ? `${recurringPercentOfIncome.toFixed(1)}%`
                  : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Renewals 30d
              </p>
              <p className="text-sm sm:text-base font-bold text-foreground mt-1">
                {next30Renewals.length}
              </p>
            </div>
          </div>

          {sortedActiveByMonthly.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No active subscriptions tracked yet.
            </p>
          ) : (
            <ul className="divide-y divide-border max-h-[320px] overflow-y-auto -mx-2">
              {sortedActiveByMonthly.map((sub) => {
                const status = getSubscriptionStatus(sub)
                const monthly = monthlyEquivalent(sub)
                const showMonthlyEq = sub.frequency !== "Monthly"
                return (
                  <li
                    key={sub.id}
                    className="flex items-start justify-between gap-3 px-2 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {sub.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {sub.category ? (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {sub.category}
                          </Badge>
                        ) : null}
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {sub.frequency}
                        </Badge>
                        <span
                          className={`px-1.5 py-0 rounded text-[10px] font-medium ${getStatusColorClass(status)}`}
                        >
                          {getStatusLabel(status)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground tabular-nums">
                        {format(sub.amount)}
                      </p>
                      {showMonthlyEq ? (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          ≈ {format(monthly)}/mo
                        </p>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <CalendarClock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Upcoming Renewals (30 days)
          </h3>
        </div>

        {next30Renewals.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 gap-2">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-[36ch]">
              No renewals coming up in the next 30 days.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border -mx-2">
            {next30Renewals.map((renewal) => {
              const dateLabel = formatRenewalDateLabel(renewal)
              const dateAccent = dateAccentClass(renewal.daysUntil)
              return (
                <li
                  key={renewal.id}
                  className="flex flex-col gap-2 px-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="min-w-[80px] sm:min-w-[96px]">
                      <p
                        className={`text-xs font-semibold uppercase tracking-wide ${dateAccent}`}
                      >
                        {dateLabel}
                      </p>
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
                  <p className="text-sm font-semibold text-foreground tabular-nums sm:text-right">
                    {format(renewal.amount)}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Card className="p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-6">Net Worth Growth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={netWorth}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--chart-1)"
              fill="var(--chart-1)"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
