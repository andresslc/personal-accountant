"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getSummaryCards } from "@/lib/data/dashboard-data"
import type { SummaryCard } from "@/lib/mocks"

export function SummaryCards() {
  const [cards, setCards] = useState<SummaryCard[]>([])

  useEffect(() => {
    const loadCards = async () => {
      const data = await getSummaryCards()
      setCards(data)
    }

    void loadCards()
  }, [])

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
