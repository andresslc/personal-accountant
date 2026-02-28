"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { budgetCategoryOptions, budgetData, type BudgetItem } from "@/lib/mocks"

interface BudgetQuickCreateDialogProps {
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onBudgetCreated?: (budget: BudgetItem) => void
}

export function BudgetQuickCreateDialog({
  trigger,
  open,
  onOpenChange,
  onBudgetCreated,
}: BudgetQuickCreateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [limitAmount, setLimitAmount] = useState("")
  const [isRecurring, setIsRecurring] = useState(true)

  const isControlled = typeof open === "boolean"
  const dialogOpen = isControlled ? open : internalOpen
  const setDialogOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  const resetForm = () => {
    setSelectedCategory("")
    setLimitAmount("")
    setIsRecurring(true)
  }

  const handleCreateBudget = () => {
    const amount = Number(limitAmount)
    if (!selectedCategory || !Number.isFinite(amount) || amount <= 0) return

    const selectedOption = budgetCategoryOptions.find((option) => option.value === selectedCategory)
    const categoryLabel = selectedOption?.label ?? "Custom"
    const existingCategory = budgetData.find(
      (item) => item.category.toLowerCase() === categoryLabel.toLowerCase()
    )

    onBudgetCreated?.({
      id: Date.now(),
      category: categoryLabel,
      limit: amount,
      spent: 0,
      icon: existingCategory?.icon ?? ShoppingCart,
      recurring: isRecurring,
    })

    resetForm()
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {budgetCategoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Limit Amount</label>
            <Input
              placeholder="$500.00"
              value={limitAmount}
              onChange={(event) => setLimitAmount(event.target.value)}
              type="number"
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recurring-budget"
              checked={isRecurring}
              onChange={(event) => setIsRecurring(event.target.checked)}
              className="w-4 h-4 rounded border-border cursor-pointer"
            />
            <label htmlFor="recurring-budget" className="text-sm font-medium text-foreground cursor-pointer">
              Recurring Budget
            </label>
          </div>
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleCreateBudget}
          >
            Create Budget
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/dashboard/budget">View full budget page</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
