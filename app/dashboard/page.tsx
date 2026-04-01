"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { IncomeVsExpensesChart } from "@/components/dashboard/income-vs-expenses-chart"
import { TransactionsTable } from "@/components/dashboard/transactions-table"
import { ExpensesByCategoryChart } from "@/components/dashboard/expenses-by-category-chart"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SmartTransactionHub } from "@/components/dashboard/smart-transaction-hub"
import { QuickAddMenu } from "@/components/dashboard/quick-add-menu"
import { BudgetQuickCreateDialog } from "@/components/dashboard/budget-quick-create-dialog"

export default function Dashboard() {
  const router = useRouter()
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false)

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <QuickAddMenu
          onAddTransaction={() => setIsTransactionDialogOpen(true)}
          onCreateBudget={() => setIsBudgetDialogOpen(true)}
          onAddDebt={() => router.push("/dashboard/debts?create=true")}
        />
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

      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <SmartTransactionHub />
        </DialogContent>
      </Dialog>

      <BudgetQuickCreateDialog
        open={isBudgetDialogOpen}
        onOpenChange={setIsBudgetDialogOpen}
      />
    </>
  )
}
