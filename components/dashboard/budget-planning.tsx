"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit2 } from "lucide-react"
import { BudgetQuickCreateDialog } from "@/components/dashboard/budget-quick-create-dialog"
import { AIRecommendationsDialog } from "@/components/dashboard/ai-insights-dialog"
import {
  getBudgets,
  getTotalBudget,
  getTotalSpent,
  getRemainingBudget,
  type BudgetItemUI as BudgetItem,
} from "@/lib/data/dashboard-data"
import { useCurrency } from "@/components/currency-provider"

export function BudgetPlanning() {
  const searchParams = useSearchParams()
  const { format } = useCurrency()
  const [budgets, setBudgets] = useState<BudgetItem[]>([])
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false)

  useEffect(() => {
    const loadBudgets = async () => {
      const data = await getBudgets()
      setBudgets(data)
    }

    void loadBudgets()
  }, [])

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setIsBudgetDialogOpen(true)
    }
  }, [searchParams])

  const totalBudget = getTotalBudget(budgets)
  const totalSpent = getTotalSpent(budgets)
  const remaining = getRemainingBudget(budgets)

  const [daysLeft, setDaysLeft] = useState<number | null>(null)

  useEffect(() => {
    const now = new Date()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    setDaysLeft(lastDay.getDate() - now.getDate())
  }, [])

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 border border-border">
          <p className="text-foreground/70 text-sm mb-2">Total Budget</p>
          <p className="text-3xl font-bold text-foreground">{format(totalBudget)}</p>
        </Card>
        <Card className="p-6 border border-border">
          <p className="text-foreground/70 text-sm mb-2">Total Spent</p>
          <p className="text-3xl font-bold text-red-600">{format(totalSpent)}</p>
        </Card>
        <Card className="p-6 border border-border flex flex-col justify-between">
          <div>
            <p className="text-foreground/70 text-sm mb-2">Remaining</p>
            <p className="text-3xl font-bold text-green-600">{format(remaining)}</p>
          </div>
          <p className="text-xs text-foreground/70 mt-4">{daysLeft !== null ? `${daysLeft} days left in month` : "\u00A0"}</p>
        </Card>
      </div>

      {/* Create Budget Button */}
      <div className="flex items-center gap-3">
        <BudgetQuickCreateDialog
          open={isBudgetDialogOpen}
          onOpenChange={setIsBudgetDialogOpen}
          onBudgetCreated={(newBudget) => setBudgets((current) => [newBudget, ...current])}
          trigger={
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4" />
              Create New Budget
            </Button>
          }
        />
        <AIRecommendationsDialog
          endpoint="/api/ai/budget-insights"
          title="Budget Recommendations"
          description="Get budget allocation advice and category optimization suggestions."
          triggerLabel="Budget Advice"
          defaultAnalysisType="budget_recommendation"
          lockAnalysisType
        />
      </div>

      {/* Budget Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
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
                  {format(budget.spent)} of {format(budget.limit)}
                </p>
                <p className="text-xs text-foreground/70 mt-1">{daysLeft !== null ? `${daysLeft} days left in month` : "\u00A0"}</p>
              </div>

              {/* Warning if over budget */}
              {isOverBudget && (
                <p className="text-xs text-red-600 font-medium">
                  Over budget by {format(budget.spent - budget.limit)}
                </p>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
