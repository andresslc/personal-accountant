"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2 } from "lucide-react"
import { 
  budgetData, 
  budgetCategoryOptions,
  getTotalBudget,
  getTotalSpent,
  getRemainingBudget 
} from "@/lib/mocks"

export function BudgetPlanning() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [limitAmount, setLimitAmount] = useState("")
  const [isRecurring, setIsRecurring] = useState(true)

  const totalBudget = getTotalBudget()
  const totalSpent = getTotalSpent()
  const remaining = getRemainingBudget()

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
