"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getRecentTransactions } from "@/lib/data/dashboard-data"
import type { TransactionUI as Transaction } from "@/lib/data/dashboard-data"
import { useCurrency } from "@/components/currency-provider"

export function TransactionsTable() {
  const { format } = useCurrency()
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const loadTransactions = async () => {
      const data = await getRecentTransactions()
      setTransactions(data)
    }

    void loadTransactions()
  }, [])

  return (
    <Card className="border border-border">
      <div className="p-4 md:p-6 border-b border-border">
        <h3 className="text-lg font-bold text-foreground">Recent Transactions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 md:px-6 md:py-3 text-left text-sm font-semibold text-foreground/70">Date</th>
              <th className="px-3 py-2 md:px-6 md:py-3 text-left text-sm font-semibold text-foreground/70">Category</th>
              <th className="px-3 py-2 md:px-6 md:py-3 text-left text-sm font-semibold text-foreground/70">Description</th>
              <th className="px-3 py-2 md:px-6 md:py-3 text-right text-sm font-semibold text-foreground/70">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => {
              const Icon = transaction.icon
              const isIncome = transaction.amount > 0
              return (
                <tr
                  key={transaction.id}
                  className={`border-b border-border hover:bg-muted/50 transition-colors ${index % 2 === 0 ? "bg-muted/20" : ""}`}
                >
                  <td className="px-3 py-3 md:px-6 md:py-4 text-sm text-foreground/70">{transaction.date}</td>
                  <td className="px-3 py-3 md:px-6 md:py-4">
                    <div className="flex items-center gap-2">
                      {Icon && (
                        <div className="hidden sm:flex w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <Badge variant="secondary">{transaction.category}</Badge>
                    </div>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 text-sm text-foreground">{transaction.description}</td>
                  <td
                    className={`px-3 py-3 md:px-6 md:py-4 text-right text-sm font-semibold ${isIncome ? "text-green-600" : "text-red-600"}`}
                  >
                    {isIncome ? "+" : ""}{format(Math.abs(transaction.amount))}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
