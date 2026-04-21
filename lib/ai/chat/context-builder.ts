import {
  getTransactions,
  getBudgets,
  getDebts,
  getSummaryTotals,
} from "@/lib/data/dashboard-data"
import { categories } from "@/lib/mocks/categories"
import type { FinancialContext } from "./types"

export async function buildFinancialContext(
  recentSummaries: string[] = []
): Promise<FinancialContext> {
  const [summary, transactions, budgets, debts] = await Promise.all([
    getSummaryTotals(),
    getTransactions(),
    getBudgets(),
    getDebts(),
  ])

  return {
    summary: {
      totalDebt: summary.totalDebt,
      income: summary.income,
      expenses: summary.expenses,
      savings: summary.savings,
    },
    recentTransactions: transactions.slice(0, 10).map((t) => ({
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category,
      type: t.amount > 0 ? "income" : "expense",
    })),
    budgets: budgets.map((b) => ({
      category: b.category,
      limit: b.limit,
      spent: b.spent,
      remaining: b.limit - b.spent,
    })),
    debts: debts.map((d) => ({
      name: d.name,
      type: d.type,
      currentBalance: d.currentBalance,
      minPayment: d.minPayment,
      apr: d.apr,
    })),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
    })),
    recentSummaries,
  }
}
