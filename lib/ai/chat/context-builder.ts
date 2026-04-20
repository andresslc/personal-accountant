import {
  getTransactions,
  getBudgets,
  getDebts,
  getSummaryCards,
} from "@/lib/data/dashboard-data"
import { categories } from "@/lib/mocks/categories"
import type { FinancialContext } from "./types"

export async function buildFinancialContext(
  recentSummaries: string[] = []
): Promise<FinancialContext> {
  const [summaryCards, transactions, budgets, debts] = await Promise.all([
    getSummaryCards(),
    getTransactions(),
    getBudgets(),
    getDebts(),
  ])

  const summaryMap: Record<string, string> = {}
  for (const card of summaryCards) {
    const numericValue = parseFloat(card.value.replace(/[^0-9.-]/g, ""))
    summaryMap[card.title] = String(numericValue)
  }

  return {
    summary: {
      totalDebt: parseFloat(summaryMap["Debts"] || "0"),
      income: parseFloat(summaryMap["Income"] || "0"),
      expenses: parseFloat(summaryMap["Expenses"] || "0"),
      savings: parseFloat(summaryMap["Savings"] || "0"),
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
