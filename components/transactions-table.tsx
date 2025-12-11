import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coffee, Zap, Bus, ShoppingBag, Plus } from "lucide-react"

interface Transaction {
  id: string
  description: string
  category: string
  date: string
  amount: number
  type: "income" | "expense"
  icon: React.ReactNode
}

const transactions: Transaction[] = [
  {
    id: "1",
    description: "Morning Coffee",
    category: "Food",
    date: "Dec 10, 2024",
    amount: -5.5,
    type: "expense",
    icon: <Coffee className="w-5 h-5" />,
  },
  {
    id: "2",
    description: "Salary Deposit",
    category: "Income",
    date: "Dec 9, 2024",
    amount: 4850.0,
    type: "income",
    icon: <Plus className="w-5 h-5" />,
  },
  {
    id: "3",
    description: "Electricity Bill",
    category: "Utilities",
    date: "Dec 8, 2024",
    amount: -125.0,
    type: "expense",
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: "4",
    description: "Uber Ride",
    category: "Transport",
    date: "Dec 7, 2024",
    amount: -24.5,
    type: "expense",
    icon: <Bus className="w-5 h-5" />,
  },
  {
    id: "5",
    description: "Shopping at Target",
    category: "Shopping",
    date: "Dec 6, 2024",
    amount: -185.3,
    type: "expense",
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  {
    id: "6",
    description: "Freelance Project",
    category: "Income",
    date: "Dec 5, 2024",
    amount: 1200.0,
    type: "income",
    icon: <Plus className="w-5 h-5" />,
  },
]

export function TransactionsTable() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-border/50 hover:bg-muted/30 transition">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg text-muted-foreground">{transaction.icon}</div>
                      <span className="font-medium text-foreground">{transaction.description}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className="font-normal">
                      {transaction.category}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{transaction.date}</td>
                  <td
                    className={`py-4 px-4 text-right font-semibold ${
                      transaction.type === "income"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
