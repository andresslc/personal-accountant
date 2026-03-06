"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Grid, List } from "lucide-react"
import { getTransactionCategories, getTransactions } from "@/lib/data/dashboard-data"
import type { Transaction } from "@/lib/mocks"

export function TransactionsManager() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categoryOptions, setCategoryOptions] = useState<string[]>(["all"])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [type, setType] = useState("all")
  const [month, setMonth] = useState("all")
  const [view, setView] = useState("table")

  useEffect(() => {
    const loadTransactions = async () => {
      const [transactionsData, categoriesData] = await Promise.all([getTransactions(), getTransactionCategories()])
      setTransactions(transactionsData)
      setCategoryOptions(categoriesData)
    }

    void loadTransactions()
  }, [])

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const matchesSearch = transaction.description.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = category === "all" || transaction.category === category
        const matchesType = type === "all" || transaction.type === type
        return matchesSearch && matchesCategory && matchesType
      }),
    [transactions, search, category, type]
  )

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card className="p-4 border border-border">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {["all", "income", "expense"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value="jan">January</SelectItem>
                <SelectItem value="dec">December</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={view === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("table")}
                className="gap-2"
              >
                <List className="w-4 h-4" />
                Table
              </Button>
              <Button
                variant={view === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("grid")}
                className="gap-2"
              >
                <Grid className="w-4 h-4" />
                Grid
              </Button>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Table View */}
      {view === "table" && (
        <Card className="border border-border overflow-hidden">
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Description</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Method</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground">{transaction.date}</td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="font-normal">
                          {transaction.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{transaction.description}</td>
                      <td className="px-6 py-4 text-sm text-foreground/70">{transaction.method}</td>
                      <td
                        className={`px-6 py-4 text-right text-sm font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-foreground/70 mb-4">No transactions found</p>
              <Button variant="outline" size="sm">
                Clear Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          <div className="border-t border-border p-4 flex items-center justify-between bg-muted/50">
            <p className="text-sm text-foreground/70">Page 1 of 10</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4 border border-border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{transaction.description}</p>
                  <p className="text-xs text-foreground/70 mt-1">{transaction.date}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {transaction.category}
                </Badge>
              </div>
              <div className="pt-3 border-t border-border">
                <p className={`text-lg font-bold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount.toFixed(2)}
                </p>
                <p className="text-xs text-foreground/70 mt-1">{transaction.method}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
