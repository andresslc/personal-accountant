"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", income: 4000, expenses: 2400 },
  { month: "Feb", income: 3000, expenses: 1398 },
  { month: "Mar", income: 2000, expenses: 9800 },
  { month: "Apr", income: 2780, expenses: 3908 },
  { month: "May", income: 1890, expenses: 4800 },
  { month: "Jun", income: 2390, expenses: 3800 },
  { month: "Jul", income: 3490, expenses: 4300 },
  { month: "Aug", income: 4200, expenses: 2800 },
  { month: "Sep", income: 3800, expenses: 3200 },
  { month: "Oct", income: 4100, expenses: 2900 },
  { month: "Nov", income: 4500, expenses: 3100 },
  { month: "Dec", income: 4850, expenses: 3450 },
]

export function IncomeVsExpensesChart() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
            />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Income" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expenses" fill="#f43f5e" name="Expenses" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
