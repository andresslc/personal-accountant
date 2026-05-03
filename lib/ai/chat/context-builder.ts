import {
  getTransactions,
  getBudgets,
  getDebts,
  getSummaryTotals,
  getActiveSubscriptions,
} from "@/lib/data/dashboard-data"
import { categories } from "@/lib/mocks/categories"
import {
  monthlyEquivalent,
  getSubscriptionStatus,
} from "@/lib/utils/subscription-status"
import type { SupportedCurrency } from "@/lib/utils/currency"
import type { FinancialContext } from "./types"

export async function buildFinancialContext(
  recentSummaries: string[] = [],
  displayCurrency: SupportedCurrency = "COP"
): Promise<FinancialContext> {
  const [summary, transactions, budgets, debts, subs] = await Promise.all([
    getSummaryTotals(),
    getTransactions(),
    getBudgets(),
    getDebts(),
    getActiveSubscriptions(),
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
    subscriptions: subs.map((s) => ({
      id: s.id,
      name: s.name,
      amount: s.amount,
      frequency: s.frequency as "Weekly" | "Monthly" | "Yearly",
      monthlyEquivalent: Math.round(monthlyEquivalent(s)),
      nextDueDate: s.next_due_date,
      category: s.category,
      status: getSubscriptionStatus(s),
    })),
    recurringMonthlyTotal: subs.reduce((sum, s) => sum + monthlyEquivalent(s), 0),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
    })),
    recentSummaries,
    displayCurrency,
  }
}
