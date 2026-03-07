"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { getChartColors, getExpensesByCategory } from "@/lib/data/dashboard-data"
import type { CategoryExpense } from "@/lib/mocks"

export function ExpensesByCategoryChart() {
  const [chartData, setChartData] = useState<CategoryExpense[]>([])
  const colors = getChartColors()

  useEffect(() => {
    const loadData = async () => {
      const data = await getExpensesByCategory()
      setChartData(data)
    }

    void loadData()
  }, [])

  return (
    <Card className="p-6 border border-border">
      <h3 className="text-lg font-bold text-foreground mb-6">Expenses by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
            {chartData.map((entry, index) => (
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
