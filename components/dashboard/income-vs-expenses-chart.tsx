"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { incomeVsExpensesData } from "@/lib/mocks"

export function IncomeVsExpensesChart() {
  return (
    <Card className="p-6 border border-border">
      <h3 className="text-lg font-bold text-foreground mb-6">Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={incomeVsExpensesData}>
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
