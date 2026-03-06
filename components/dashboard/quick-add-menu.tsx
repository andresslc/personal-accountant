"use client"

import { type FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { CreditCard, Plus, TrendingUp, Wallet } from "lucide-react"

type QuickAddMenuProps = {
  onAddTransaction?: () => void
  onCreateBudget?: () => void
  onAddDebt?: () => void
  budgetHref?: string
  debtHref?: string
}

export function QuickAddMenu({
  onAddTransaction,
  onCreateBudget,
  onAddDebt,
  budgetHref = "/dashboard/budget?create=true",
  debtHref = "/dashboard/debts?create=true",
}: QuickAddMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [quickPrompt, setQuickPrompt] = useState("")
  const router = useRouter()

  const handleAction = (callback?: () => void, href?: string) => {
    setIsOpen(false)
    setQuickPrompt("")
    if (callback) {
      callback()
      return
    }
    if (href) {
      router.push(href)
    }
  }

  const handlePromptSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const normalizedPrompt = quickPrompt.trim().toLowerCase()

    if (!normalizedPrompt) return

    if (normalizedPrompt.includes("budget")) {
      handleAction(onCreateBudget, budgetHref)
      return
    }

    if (normalizedPrompt.includes("debt") || normalizedPrompt.includes("loan") || normalizedPrompt.includes("liability")) {
      handleAction(onAddDebt, debtHref)
      return
    }

    handleAction(onAddTransaction)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4" />
          Quick Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New</DialogTitle>
          <DialogDescription>Choose what you want to add to your finances.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handlePromptSubmit} className="space-y-3 py-2">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-foreground mb-2">Type what you want to create</p>
            <div className="flex gap-2">
              <Input
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                placeholder="Create grocery budget, add debt, or add transaction"
                className="h-10 bg-background"
              />
              <Button type="submit" disabled={!quickPrompt.trim()}>
                Go
              </Button>
            </div>
            <p className="text-xs text-foreground/70 mt-2">
              `budget` opens Budget, `debt/loan` opens Debt, otherwise we open Transaction.
            </p>
          </div>
        </form>

        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={() => handleAction(onAddTransaction)}
            className="w-full rounded-lg border border-border p-4 text-left hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Add Transaction</p>
                <p className="text-xs text-foreground/70">Track income, expenses, or debt payments.</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onCreateBudget, budgetHref)}
            className="w-full rounded-lg border border-border p-4 text-left hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Create Budget</p>
                <p className="text-xs text-foreground/70">Open quick form or jump to full budget page.</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onAddDebt, debtHref)}
            className="w-full rounded-lg border border-border p-4 text-left hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Add Debt</p>
                <p className="text-xs text-foreground/70">Create a liability with payment and APR details.</p>
              </div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
