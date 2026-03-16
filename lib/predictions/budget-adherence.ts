import type { BudgetAdherenceProjection } from "./types"

interface BudgetItem {
  category: string
  limit: number
  spent: number
}

interface CurrentMonthSpend {
  spent: number
  daysElapsed: number
  daysInMonth: number
  transactionCount: number
}

export function projectBudgetAdherence(
  budgets: BudgetItem[],
  currentMonthSpend: Map<string, CurrentMonthSpend>,
  referenceDate?: Date
): BudgetAdherenceProjection[] {
  const now = referenceDate ?? new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysElapsed = Math.max(now.getDate(), 1)
  const daysRemaining = daysInMonth - daysElapsed

  return budgets.map((budget) => {
    const currentSpend = currentMonthSpend.get(budget.category)
    const spentSoFar = currentSpend?.spent ?? budget.spent

    const dailyRate = daysElapsed > 0 ? spentSoFar / daysElapsed : 0
    const projectedEndOfMonth = dailyRate * daysInMonth
    const percentUsed = budget.limit > 0 ? (spentSoFar / budget.limit) * 100 : 0

    const safeDailyBudget =
      daysRemaining > 0 ? Math.max(0, (budget.limit - spentSoFar) / daysRemaining) : 0

    let status: BudgetAdherenceProjection["status"]
    if (spentSoFar > budget.limit) {
      status = "over-budget"
    } else if (projectedEndOfMonth > budget.limit * 0.9) {
      status = "at-risk"
    } else {
      status = "on-track"
    }

    return {
      category: budget.category,
      budgetLimit: budget.limit,
      spentSoFar: Math.round(spentSoFar * 100) / 100,
      projectedEndOfMonth: Math.round(projectedEndOfMonth * 100) / 100,
      status,
      safeDailyBudget: Math.round(safeDailyBudget * 100) / 100,
      daysRemaining,
      percentUsed: Math.round(percentUsed * 10) / 10,
    }
  })
}
