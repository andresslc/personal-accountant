"use client"

import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { expensesByCategoryData, CHART_COLORS } from "@/lib/mocks"

export function ExpensesByCategoryChart() {
  return (
    <Card className="p-6 border border-border">
      <h3 className="text-lg font-bold text-foreground mb-6">Expenses by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={expensesByCategoryData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
            {expensesByCategoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
