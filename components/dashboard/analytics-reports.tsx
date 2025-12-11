"use client"

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

const cashFlowData = [
  { month: "Jan", income: 4500, expenses: 3200 },
  { month: "Feb", income: 4200, expenses: 2800 },
  { month: "Mar", income: 4800, expenses: 3500 },
  { month: "Apr", income: 4600, expenses: 3100 },
  { month: "May", income: 5000, expenses: 3600 },
  { month: "Jun", income: 5200, expenses: 3800 },
]

const expenseBreakdown = [
  { name: "Rent", value: 1500 },
  { name: "Groceries", value: 450 },
  { name: "Utilities", value: 200 },
  { name: "Entertainment", value: 280 },
  { name: "Other", value: 690 },
]

const topSpending = [
  { rank: 1, category: "Rent", amount: 4500 },
  { rank: 2, category: "Groceries", amount: 1350 },
  { rank: 3, category: "Utilities", amount: 600 },
]

const subscriptions = [
  { name: "Netflix", amount: 15.99, frequency: "Monthly" },
  { name: "Spotify", amount: 10.99, frequency: "Monthly" },
  { name: "Cloud Storage", amount: 9.99, frequency: "Monthly" },
]

const netWorthData = [
  { month: "Jan", value: 24000 },
  { month: "Feb", value: 24800 },
  { month: "Mar", value: 26200 },
  { month: "Apr", value: 27100 },
  { month: "May", value: 28900 },
  { month: "Jun", value: 30500 },
  { month: "Jul", value: 31200 },
  { month: "Aug", value: 33100 },
  { month: "Sep", value: 34500 },
  { month: "Oct", value: 35800 },
  { month: "Nov", value: 36900 },
  { month: "Dec", value: 38200 },
]

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function AnalyticsReports() {
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
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
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
            <LineChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="hsl(var(--chart-1)))" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="hsl(var(--chart-3)))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Expense Breakdown */}
        <Card className="p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-6">Expense Breakdown</h3>
          <div className="flex gap-6">
            <ResponsiveContainer width="50%" height={300}>
              <PieChart>
                <Pie data={expenseBreakdown} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center">
              {expenseBreakdown.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
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
            {topSpending.map((item) => (
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
            {subscriptions.map((sub) => (
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
          <AreaChart data={netWorthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--chart-1)))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
