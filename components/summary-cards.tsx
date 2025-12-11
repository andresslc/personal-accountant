import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react"

interface SummaryCard {
  title: string
  amount: string
  trend: number
  icon: React.ReactNode
  color: string
}

const summaryData: SummaryCard[] = [
  {
    title: "Total Balance",
    amount: "$12,450.50",
    trend: 2.5,
    icon: <DollarSign className="w-6 h-6" />,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  },
  {
    title: "Income",
    amount: "$4,850.00",
    trend: 5.2,
    icon: <TrendingUp className="w-6 h-6" />,
    color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
  {
    title: "Expenses",
    amount: "$2,340.00",
    trend: -1.8,
    icon: <TrendingDown className="w-6 h-6" />,
    color: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
  },
  {
    title: "Savings",
    amount: "$2,510.00",
    trend: 8.1,
    icon: <PiggyBank className="w-6 h-6" />,
    color: "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
  },
]

export function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryData.map((card) => (
        <Card key={card.title} className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">{card.title}</p>
                <h3 className="text-2xl font-bold text-foreground">{card.amount}</h3>
                <div
                  className={`mt-4 inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                    card.trend >= 0
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                  }`}
                >
                  {card.trend >= 0 ? "+" : ""}
                  {card.trend}% from last month
                </div>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>{card.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
