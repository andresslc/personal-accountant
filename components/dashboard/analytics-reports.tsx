"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Download, Calendar } from "lucide-react"
import {
  getCashFlowData,
  getExpenseBreakdown,
  getTopSpendingCategories,
  getSubscriptions,
  getNetWorth,
  getChartColors,
  getDateRangeOptions,
} from "@/lib/data/dashboard-data"
import type { MonthlyData, CategoryExpense, SpendingRank, Subscription, NetWorthPoint } from "@/lib/mocks"

export function AnalyticsReports() {
  const [cashFlow, setCashFlow] = useState<MonthlyData[]>([])
  const [breakdown, setBreakdown] = useState<CategoryExpense[]>([])
  const [spendingCategories, setSpendingCategories] = useState<SpendingRank[]>([])
  const [recurringSubscriptions, setRecurringSubscriptions] = useState<Subscription[]>([])
  const [netWorth, setNetWorth] = useState<NetWorthPoint[]>([])
  const chartColors = getChartColors()
  const dateRangeOptions = getDateRangeOptions()

  useEffect(() => {
    const loadData = async () => {
      const [cashFlowData, expenseBreakdown, topCategories, subscriptions, netWorthData] = await Promise.all([
        getCashFlowData(),
        getExpenseBreakdown(),
        getTopSpendingCategories(),
        getSubscriptions(),
        getNetWorth(),
      ])

      setCashFlow(cashFlowData)
      setBreakdown(expenseBreakdown)
      setSpendingCategories(topCategories)
      setRecurringSubscriptions(subscriptions)
      setNetWorth(netWorthData)
    }

    void loadData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
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
          <Button variant="outline" className="gap-2 bg-transparent">
            <Calendar className="w-4 h-4" />
            Pick Date
          </Button>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Top Row - Two Large Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cash Flow Trend */}
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

        {/* Expense Breakdown */}
        <Card className="p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-6">Expense Breakdown</h3>
          <div className="flex gap-6">
            <ResponsiveContainer width="50%" height={300}>
              <PieChart>
                <Pie data={breakdown} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
                  {breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center">
              {breakdown.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  ></div>
                  <span className="text-sm text-foreground">{item.name}</span>
                  <span className="text-sm font-semibold text-foreground/70 ml-auto">${item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Middle Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Spending Categories */}
        <Card className="p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-6">Top Spending Categories</h3>
          <div className="space-y-4">
            {spendingCategories.map((item) => (
              <div key={item.rank} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-foreground/50">{item.rank}</span>
                  <span className="text-sm font-medium text-foreground">{item.category}</span>
                </div>
                <span className="text-sm font-bold text-foreground">${item.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recurring Subscriptions */}
        <Card className="p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-6">Recurring Subscriptions</h3>
          <div className="space-y-4">
            {recurringSubscriptions.map((sub) => (
              <div
                key={sub.name}
                className="flex items-center justify-between pb-4 border-b border-border last:border-b-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{sub.name}</p>
                  <p className="text-xs text-foreground/70">{sub.frequency}</p>
                </div>
                <p className="text-sm font-bold text-foreground">${sub.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row - Net Worth Growth */}
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
