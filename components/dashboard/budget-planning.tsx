"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2 } from "lucide-react"
import { Utensils, Home, Zap, ShoppingCart, Film } from "lucide-react"

const budgetData = [
  { id: 1, category: "Groceries", limit: 500, spent: 350, icon: Utensils, recurring: true },
  { id: 2, category: "Rent", limit: 1500, spent: 1500, icon: Home, recurring: true },
  { id: 3, category: "Utilities", limit: 200, spent: 124, icon: Zap, recurring: true },
  { id: 4, category: "Entertainment", limit: 300, spent: 156, icon: Film, recurring: false },
  { id: 5, category: "Shopping", limit: 400, spent: 312, icon: ShoppingCart, recurring: false },
]

export function BudgetPlanning() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [limitAmount, setLimitAmount] = useState("")
  const [isRecurring, setIsRecurring] = useState(true)

  const totalBudget = budgetData.reduce((sum, b) => sum + b.limit, 0)
  const totalSpent = budgetData.reduce((sum, b) => sum + b.spent, 0)
  const remaining = totalBudget - totalSpent

  const getProgressColor = (spent, limit) => {
    const percentage = (spent / limit) * 100
    if (percentage >= 100) return "bg-red-500"
    if (percentage >= 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getDaysLeft = () => {
    const now = new Date()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return lastDay.getDate() - now.getDate()
  }

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 border border-border">
          <p className="text-foreground/70 text-sm mb-2">Total Budget</p>
          <p className="text-3xl font-bold text-foreground">${totalBudget.toFixed(2)}</p>
        </Card>
        <Card className="p-6 border border-border">
          <p className="text-foreground/70 text-sm mb-2">Total Spent</p>
          <p className="text-3xl font-bold text-red-600">${totalSpent.toFixed(2)}</p>
        </Card>
        <Card className="p-6 border border-border flex flex-col justify-between">
          <div>
            <p className="text-foreground/70 text-sm mb-2">Remaining</p>
            <p className="text-3xl font-bold text-green-600">${remaining.toFixed(2)}</p>
          </div>
          <p className="text-xs text-foreground/70 mt-4">{getDaysLeft()} days left in month</p>
        </Card>
      </div>

      {/* Create Budget Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4" />
            Create New Budget
          </Button>
        </DialogTrigger>
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
                  <SelectItem value="groceries">Groceries</SelectItem>
                  <SelectItem value="dining">Dining Out</SelectItem>
                  <SelectItem value="transport">Transportation</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Limit Amount</label>
              <Input
                placeholder="$500.00"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                type="number"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-border cursor-pointer"
              />
              <label htmlFor="recurring" className="text-sm font-medium text-foreground cursor-pointer">
                Recurring Budget
              </label>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Create Budget</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Budget Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetData.map((budget) => {
          const Icon = budget.icon
          const percentage = (budget.spent / budget.limit) * 100
          const isOverBudget = budget.spent > budget.limit

          return (
            <Card key={budget.id} className="p-6 border border-border">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{budget.category}</p>
                    <p className="text-xs text-foreground/70">{budget.recurring ? "Monthly" : "One-time"}</p>
                  </div>
                </div>
                <button className="p-1 hover:bg-muted rounded transition-colors">
                  <Edit2 className="w-4 h-4 text-foreground/70 hover:text-foreground" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <Progress value={Math.min(percentage, 100)} className="h-3" />
              </div>

              {/* Spent Info */}
              <div className="mb-4">
                <p className={`text-sm font-semibold ${isOverBudget ? "text-red-600" : "text-foreground"}`}>
                  ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)}
                </p>
                <p className="text-xs text-foreground/70 mt-1">{getDaysLeft()} days left in month</p>
              </div>

              {/* Warning if over budget */}
              {isOverBudget && (
                <p className="text-xs text-red-600 font-medium">
                  Over budget by ${(budget.spent - budget.limit).toFixed(2)}
                </p>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
