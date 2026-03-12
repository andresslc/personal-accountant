import type { FinancialContext } from "@/lib/ai/chat/types"

export const FROZEN_FINANCIAL_CONTEXT: FinancialContext = {
  summary: {
    totalBalance: 4_250_000,
    income: 6_500_000,
    expenses: 3_800_000,
    savings: 2_700_000,
  },
  recentTransactions: [
    { date: "2026-03-10", description: "Uber ride to office", amount: -25_000, category: "transport", type: "expense" },
    { date: "2026-03-09", description: "Éxito groceries", amount: -180_000, category: "groceries", type: "expense" },
    { date: "2026-03-08", description: "Freelance payment", amount: 1_200_000, category: "freelance", type: "income" },
    { date: "2026-03-07", description: "Netflix subscription", amount: -45_000, category: "entertainment", type: "expense" },
    { date: "2026-03-06", description: "Chase Sapphire payment", amount: -500_000, category: "debt-payment", type: "expense" },
    { date: "2026-03-05", description: "Electric bill", amount: -120_000, category: "utilities", type: "expense" },
    { date: "2026-03-04", description: "Restaurant dinner", amount: -85_000, category: "food", type: "expense" },
    { date: "2026-03-03", description: "Salary deposit", amount: 5_300_000, category: "salary", type: "income" },
  ],
  budgets: [
    { category: "Groceries", limit: 600_000, spent: 420_000, remaining: 180_000 },
    { category: "Transport", limit: 200_000, spent: 150_000, remaining: 50_000 },
    { category: "Entertainment", limit: 300_000, spent: 210_000, remaining: 90_000 },
    { category: "Food & Dining", limit: 400_000, spent: 280_000, remaining: 120_000 },
    { category: "Utilities", limit: 350_000, spent: 290_000, remaining: 60_000 },
  ],
  debts: [
    { name: "Chase Sapphire", type: "credit-card", currentBalance: 3_200_000, minPayment: 250_000, apr: 24.5 },
    { name: "Car Loan", type: "car", currentBalance: 18_000_000, minPayment: 850_000, apr: 12.0 },
    { name: "Student Loan", type: "student", currentBalance: 8_500_000, minPayment: 320_000, apr: 7.5 },
  ],
  categories: [
    { id: "groceries", name: "Groceries", type: "expense" },
    { id: "transport", name: "Transport", type: "expense" },
    { id: "entertainment", name: "Entertainment", type: "expense" },
    { id: "food", name: "Food & Dining", type: "expense" },
    { id: "utilities", name: "Utilities", type: "expense" },
    { id: "salary", name: "Salary", type: "income" },
    { id: "freelance", name: "Freelance", type: "income" },
    { id: "other", name: "Other", type: "expense" },
  ],
  recentSummaries: [
    "User asked about monthly spending breakdown. Created a grocery budget of 600k COP.",
    "User tracked debt payments for Chase Sapphire card and asked about avalanche strategy.",
  ],
}

export const EMPTY_FINANCIAL_CONTEXT: FinancialContext = {
  summary: { totalBalance: 0, income: 0, expenses: 0, savings: 0 },
  recentTransactions: [],
  budgets: [],
  debts: [],
  categories: [
    { id: "groceries", name: "Groceries", type: "expense" },
    { id: "transport", name: "Transport", type: "expense" },
    { id: "other", name: "Other", type: "expense" },
    { id: "salary", name: "Salary", type: "income" },
  ],
  recentSummaries: [],
}
