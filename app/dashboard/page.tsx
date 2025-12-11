"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { IncomeVsExpensesChart } from "@/components/dashboard/income-vs-expenses-chart"
import { TransactionsTable } from "@/components/dashboard/transactions-table"
import { ExpensesByCategoryChart } from "@/components/dashboard/expenses-by-category-chart"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SmartTransactionHub } from "@/components/dashboard/smart-transaction-hub"
import { Plus } from "lucide-react"

export default function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1">
        <Header />

        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>
          </div>

          <SummaryCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <IncomeVsExpensesChart />
            </div>
            <ExpensesByCategoryChart />
          </div>

          <div className="mt-8">
            <TransactionsTable />
          </div>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <SmartTransactionHub />
        </DialogContent>
      </Dialog>
    </div>
  )
}
