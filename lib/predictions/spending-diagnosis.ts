import type { CategoryDiagnosis, SpendingAnomaly, SpendingDiagnosis } from "./types"

interface BudgetItem {
  category: string
  limit: number
  spent: number
}

export function diagnoseSpending(
  monthlyTotalsByCategory: Map<string, Map<string, number>>,
  sortedMonths: string[],
  budgets: BudgetItem[],
  anomalies: SpendingAnomaly[]
): SpendingDiagnosis {
  const budgetMap = new Map(budgets.map((b) => [b.category, b]))
  const diagnoses: CategoryDiagnosis[] = []
  let totalCurrentSpend = 0
  let totalHistoricalAvg = 0
  let potentialSavings = 0

  const currentMonth = sortedMonths[sortedMonths.length - 1]
  const priorMonths = sortedMonths.slice(0, -1)

  for (const [category, monthMap] of monthlyTotalsByCategory) {
    const currentMonthSpend = currentMonth ? (monthMap.get(currentMonth) ?? 0) : 0
    totalCurrentSpend += currentMonthSpend

    const priorValues = priorMonths.map((m) => monthMap.get(m) ?? 0).filter((v) => v > 0)
    const historicalAvg =
      priorValues.length > 0 ? priorValues.reduce((s, v) => s + v, 0) / priorValues.length : currentMonthSpend
    totalHistoricalAvg += historicalAvg

    const changePercent = historicalAvg > 0 ? ((currentMonthSpend - historicalAvg) / historicalAvg) * 100 : 0

    const budget = budgetMap.get(category)
    const budgetLimit = budget?.limit ?? null
    const budgetUtilization = budgetLimit ? (currentMonthSpend / budgetLimit) * 100 : null

    let status: CategoryDiagnosis["status"]
    if (changePercent > 30 || (budgetUtilization !== null && budgetUtilization > 100)) {
      status = "significantly-over"
    } else if (changePercent > 10 || (budgetUtilization !== null && budgetUtilization > 80)) {
      status = "elevated"
    } else {
      status = "within-norm"
    }

    let suggestion: string
    if (status === "significantly-over") {
      const savingsAmount = Math.round(currentMonthSpend - historicalAvg)
      if (savingsAmount > 0) potentialSavings += savingsAmount
      suggestion = `Reduce ${category} spending from $${Math.round(currentMonthSpend).toLocaleString()} to ~$${Math.round(historicalAvg).toLocaleString()} to save $${savingsAmount.toLocaleString()}/month.`
    } else if (status === "elevated") {
      suggestion = `${category} spending is trending up. Monitor closely to avoid exceeding ${budgetLimit ? `the $${budgetLimit.toLocaleString()} budget` : "your usual average"}.`
    } else {
      suggestion = `${category} spending is within normal range.`
    }

    diagnoses.push({
      category,
      currentMonthSpend: Math.round(currentMonthSpend * 100) / 100,
      historicalAvg: Math.round(historicalAvg * 100) / 100,
      changePercent: Math.round(changePercent * 10) / 10,
      budgetLimit,
      budgetUtilization: budgetUtilization !== null ? Math.round(budgetUtilization * 10) / 10 : null,
      status,
      suggestion,
    })
  }

  diagnoses.sort((a, b) => b.currentMonthSpend - a.currentMonthSpend)

  return {
    topCategories: diagnoses,
    totalCurrentSpend: Math.round(totalCurrentSpend * 100) / 100,
    totalHistoricalAvg: Math.round(totalHistoricalAvg * 100) / 100,
    potentialMonthlySavings: Math.round(potentialSavings * 100) / 100,
    anomalies,
  }
}
