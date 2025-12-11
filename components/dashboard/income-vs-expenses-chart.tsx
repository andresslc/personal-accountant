"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", income: 8000, expenses: 3200 },
  { month: "Feb", income: 7500, expenses: 2800 },
  { month: "Mar", income: 9200, expenses: 3500 },
  { month: "Apr", income: 8800, expenses: 3100 },
  { month: "May", income: 9500, expenses: 3600 },
  { month: "Jun", income: 10200, expenses: 3800 },
  { month: "Jul", income: 9800, expenses: 3400 },
  { month: "Aug", income: 10500, expenses: 3900 },
  { month: "Sep", income: 9600, expenses: 3300 },
  { month: "Oct", income: 10100, expenses: 3600 },
  { month: "Nov", income: 9900, expenses: 3200 },
  { month: "Dec", income: 11200, expenses: 4100 },
]

export function IncomeVsExpensesChart() {
  return (
    <Card className="p-6 border border-border">
      <h3 className="text-lg font-bold text-foreground mb-6">Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
          <Bar dataKey="income" fill="hsl(var(--chart-1))" />
          <Bar dataKey="expenses" fill="hsl(var(--chart-3))" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
