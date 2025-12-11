"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Food", value: 540, fill: "#10b981" },
  { name: "Transport", value: 320, fill: "#06b6d4" },
  { name: "Utilities", value: 280, fill: "#8b5cf6" },
  { name: "Entertainment", value: 400, fill: "#f59e0b" },
  { name: "Other", value: 200, fill: "#6b7280" },
]

export function ExpensesByCategoryChart() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: $${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `$${value}`}
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
