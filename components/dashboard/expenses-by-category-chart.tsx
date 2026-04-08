"use client"

import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { getChartColors } from "@/lib/data/dashboard-data"
import type { CategoryExpense } from "@/lib/data/dashboard-data"

type ExpensesByCategoryChartProps = {
  initialData: CategoryExpense[]
}

export function ExpensesByCategoryChart({ initialData }: ExpensesByCategoryChartProps) {
  const colors = getChartColors()

  return (
    <Card className="p-6 border border-border">
      <h3 className="text-lg font-bold text-foreground mb-6">Expenses by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={initialData} cx="50%" cy="50%" labelLine={false} outerRadius="75%" fill="#8884d8" dataKey="value">
            {initialData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
