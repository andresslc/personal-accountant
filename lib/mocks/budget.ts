// Mock budget data
import { Utensils, Home, Zap, ShoppingCart, Film, type LucideIcon } from "lucide-react"

export interface BudgetItem {
  id: number
  category: string
  limit: number
  spent: number
  icon: LucideIcon
  recurring: boolean
}

export const budgetData: BudgetItem[] = [
  { id: 1, category: "Groceries", limit: 500, spent: 350, icon: Utensils, recurring: true },
  { id: 2, category: "Rent", limit: 1500, spent: 1500, icon: Home, recurring: true },
  { id: 3, category: "Utilities", limit: 200, spent: 124, icon: Zap, recurring: true },
  { id: 4, category: "Entertainment", limit: 300, spent: 156, icon: Film, recurring: false },
  { id: 5, category: "Shopping", limit: 400, spent: 312, icon: ShoppingCart, recurring: false },
]

// Budget category options for creating new budgets
export const budgetCategoryOptions = [
  { value: "groceries", label: "Groceries" },
  { value: "dining", label: "Dining Out" },
  { value: "transport", label: "Transportation" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "utilities", label: "Utilities" },
  { value: "healthcare", label: "Healthcare" },
]

// Helper functions
export const getTotalBudget = (budgets: BudgetItem[] = budgetData): number => {
  return budgets.reduce((sum, b) => sum + b.limit, 0)
}

export const getTotalSpent = (budgets: BudgetItem[] = budgetData): number => {
  return budgets.reduce((sum, b) => sum + b.spent, 0)
}

export const getRemainingBudget = (budgets: BudgetItem[] = budgetData): number => {
  return getTotalBudget(budgets) - getTotalSpent(budgets)
}

export const getProgressColor = (spent: number, limit: number): string => {
  const percentage = (spent / limit) * 100
  if (percentage >= 100) return "bg-red-500"
  if (percentage >= 80) return "bg-yellow-500"
  return "bg-green-500"
}

