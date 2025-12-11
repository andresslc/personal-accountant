"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react"

export function SummaryCards() {
  const cards = [
    {
      title: "Total Balance",
      value: "$24,582.50",
      change: "+12.5%",
      positive: true,
      icon: DollarSign,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Income",
      value: "$8,450.00",
      change: "+5.2%",
      positive: true,
      icon: TrendingUp,
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: "Expenses",
      value: "$3,120.50",
      change: "-2.1%",
      positive: false,
      icon: TrendingDown,
      color: "bg-red-500/10 text-red-600",
    },
    {
      title: "Savings",
      value: "$5,330.50",
      change: "+18.3%",
      positive: true,
      icon: Wallet,
      color: "bg-purple-500/10 text-purple-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className={`text-sm font-semibold ${card.positive ? "text-green-600" : "text-red-600"}`}>
                {card.change}
              </div>
            </div>
            <p className="text-foreground/70 text-sm mb-2">{card.title}</p>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
          </Card>
        )
      })}
    </div>
  )
}
