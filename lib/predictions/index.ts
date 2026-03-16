import {
  getMonthlyTotalsByCategory,
  getMonthlyAggregates,
  getCurrentMonthSpendByCategory,
  getTransactionAmountsByCategory,
  getDistinctMonths,
} from "./data-pipeline"
import { forecastSpending } from "./spending-forecast"
import { projectBudgetAdherence } from "./budget-adherence"
import { compareDebtStrategies } from "./debt-payoff"
import { projectSavings } from "./savings-projection"
import { detectAnomalies } from "./anomaly-detection"
import { diagnoseSpending } from "./spending-diagnosis"
import type { PredictionResponse } from "./types"

interface RawTransaction {
  date: string
  category: string
  type: string
  amount: number
  description: string
}

interface BudgetItem {
  category: string
  limit: number
  spent: number
}

interface Debt {
  name: string
  currentBalance: number
  apr: number
  minPayment: number
}

export type PredictionType =
  | "spending_forecast"
  | "budget_adherence"
  | "debt_payoff"
  | "savings_projection"
  | "anomaly_detection"
  | "spending_diagnosis"

const ALL_TYPES: PredictionType[] = [
  "spending_forecast",
  "budget_adherence",
  "debt_payoff",
  "savings_projection",
  "anomaly_detection",
  "spending_diagnosis",
]

export function generatePredictions(
  transactions: RawTransaction[],
  budgets: BudgetItem[],
  debts: Debt[],
  requestedTypes?: PredictionType[]
): PredictionResponse {
  const types = new Set(requestedTypes ?? ALL_TYPES)
  const sortedMonths = getDistinctMonths(transactions)
  const monthlyTotals = getMonthlyTotalsByCategory(transactions)
  const amountsByCategory = getTransactionAmountsByCategory(transactions)
  const monthlyAggregates = getMonthlyAggregates(transactions)

  const response: PredictionResponse = {
    metadata: {
      generatedAt: new Date().toISOString(),
      dataMonths: sortedMonths.length,
      isLimitedData: sortedMonths.length < 3,
    },
  }

  if (types.has("spending_forecast")) {
    response.spendingForecasts = forecastSpending(monthlyTotals, sortedMonths)
  }

  if (types.has("budget_adherence")) {
    const currentMonthSpend = getCurrentMonthSpendByCategory(transactions)
    response.budgetAdherence = projectBudgetAdherence(budgets, currentMonthSpend)
  }

  if (types.has("debt_payoff")) {
    response.debtPayoff = compareDebtStrategies(debts)
  }

  if (types.has("savings_projection")) {
    response.savingsProjection = projectSavings(monthlyAggregates)
  }

  if (types.has("anomaly_detection")) {
    response.anomalies = detectAnomalies(transactions, amountsByCategory)
  }

  if (types.has("spending_diagnosis")) {
    const anomalies = response.anomalies ?? detectAnomalies(transactions, amountsByCategory)
    response.spendingDiagnosis = diagnoseSpending(monthlyTotals, sortedMonths, budgets, anomalies)
  }

  return response
}

export { forecastSpending } from "./spending-forecast"
export { projectBudgetAdherence } from "./budget-adherence"
export { compareDebtStrategies, computeDebtSchedule } from "./debt-payoff"
export { projectSavings } from "./savings-projection"
export { detectAnomalies } from "./anomaly-detection"
export { diagnoseSpending } from "./spending-diagnosis"
export * from "./types"
export * from "./data-pipeline"
