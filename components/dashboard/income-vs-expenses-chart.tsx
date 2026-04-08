"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { MonthlyData } from "@/lib/data/dashboard-data"

type IncomeVsExpensesChartProps = {
  initialData: MonthlyData[]
}

export function IncomeVsExpensesChart({ initialData }: IncomeVsExpensesChartProps) {
  return (
    <Card className="p-6 border border-border">
      <h3 className="text-lg font-bold text-foreground mb-6">Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={initialData}>
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
          <Bar dataKey="income" fill="var(--chart-1)" />
          <Bar dataKey="expenses" fill="var(--chart-3)" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
