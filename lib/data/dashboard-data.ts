import {
  Briefcase,
  Car,
  CreditCard,
  DollarSign,
  Film,
  Home,
  Pill,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { USE_MOCK_DATA } from "@/lib/config/data-source"
import { createClient } from "@/lib/supabase/client"
import {
  allTransactions,
  budgetData,
  liabilitiesData,
  recentTransactions,
  summaryCardsData,
  incomeVsExpensesData,
  expensesByCategoryData,
  type Transaction as MockTransaction,
  type BudgetItem as MockBudgetItem,
  type Liability as MockLiability,
  CHART_COLORS,
  cashFlowData,
  expenseBreakdown,
  topSpendingCategories,
  subscriptions,
  netWorthData,
  dateRangeOptions,
  type SpendingRank,
  type Subscription,
  type NetWorthPoint,
  type MonthlyData,
  type CategoryExpense,
} from "@/lib/mocks"

type CategoryMap = Record<string, string>

const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) return null

  return createClient()
}

const categoryIconMap: Record<string, LucideIcon> = {
  groceries: Utensils,
  rent: Home,
  utilities: Zap,
  shopping: ShoppingCart,
  healthcare: Pill,
  entertainment: Film,
  salary: Briefcase,
  freelance: Briefcase,
}

const typeIconMap: Record<MockLiability["type"], LucideIcon> = {
  "credit-card": CreditCard,
  car: Car,
  student: CreditCard,
  personal: DollarSign,
  mortgage: Home,
}

const toMonthLabel = (dateString: string) =>
  new Date(dateString).toLocaleString("en-US", { month: "short" })

const safeDateValue = (dateString: string) => {
  const parsed = new Date(dateString)
  return Number.isNaN(parsed.getTime()) ? new Date(0).getTime() : parsed.getTime()
}

const getCategoryIcon = (category: string): LucideIcon => {
  const normalized = category.trim().toLowerCase()
  return categoryIconMap[normalized] ?? CreditCard
}

const getCategoryMap = async (): Promise<CategoryMap> => {
  const supabase = getSupabaseClient()
  if (!supabase) return {}

  const { data, error } = await supabase.from("categories").select("id,name")
  if (error || !data) return {}

  return data.reduce<CategoryMap>((acc, row) => {
    acc[row.id] = row.name
    return acc
  }, {})
}

const mapSupabaseTransactionToUi = (
  row: {
    id: number
    date: string
    description: string
    amount: number
    type: "income" | "expense" | "debt-payment"
    method: string | null
    category_id: string | null
  },
  categories: CategoryMap
): MockTransaction => {
  const categoryName = row.category_id ? categories[row.category_id] ?? "Other" : "Other"
  const signedAmount = row.type === "income" ? Math.abs(row.amount) : -Math.abs(row.amount)

  return {
    id: row.id,
    date: row.date,
    category: categoryName,
    type: row.type === "income" ? "income" : "expense",
    description: row.description,
    amount: signedAmount,
    method: (row.method as MockTransaction["method"]) ?? "Cash",
    icon: getCategoryIcon(categoryName),
  }
}

export const getTransactions = async (): Promise<MockTransaction[]> => {
  if (USE_MOCK_DATA) return allTransactions
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const categories = await getCategoryMap()
  const { data, error } = await supabase
    .from("transactions")
    .select("id,date,description,amount,type,method,category_id")
    .order("date", { ascending: false })
    .limit(200)

  if (error || !data) return []

  return data.map((row) => mapSupabaseTransactionToUi(row, categories))
}

export const getRecentTransactions = async (): Promise<MockTransaction[]> => {
  if (USE_MOCK_DATA) return recentTransactions

  const all = await getTransactions()
  return [...all]
    .sort((a, b) => safeDateValue(b.date) - safeDateValue(a.date))
    .slice(0, 5)
    .map((transaction) => ({
      ...transaction,
      icon: getCategoryIcon(transaction.category),
    }))
}

export const getTransactionCategories = async (): Promise<string[]> => {
  if (USE_MOCK_DATA) {
    return ["all", ...new Set(allTransactions.map((transaction) => transaction.category))]
  }

  const transactions = await getTransactions()
  const categories = [...new Set(transactions.map((transaction) => transaction.category))]
  return ["all", ...categories]
}

export const getSummaryCards = async () => {
  if (USE_MOCK_DATA) return summaryCardsData

  const transactions = await getTransactions()
  const income = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const expenses = Math.abs(
    transactions
      .filter((transaction) => transaction.amount < 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  )
  const savings = income - expenses

  const debts = await getDebts()
  const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0)
  const totalBalance = savings - totalDebt

  return [
    {
      title: "Total Balance",
      value: `$${totalBalance.toFixed(2)}`,
      change: "Live",
      positive: totalBalance >= 0,
      icon: DollarSign,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Income",
      value: `$${income.toFixed(2)}`,
      change: "Live",
      positive: true,
      icon: TrendingUp,
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: "Expenses",
      value: `$${expenses.toFixed(2)}`,
      change: "Live",
      positive: false,
      icon: TrendingDown,
      color: "bg-red-500/10 text-red-600",
    },
    {
      title: "Savings",
      value: `$${savings.toFixed(2)}`,
      change: "Live",
      positive: savings >= 0,
      icon: Wallet,
      color: "bg-purple-500/10 text-purple-600",
    },
  ]
}

export const getIncomeVsExpenses = async () => {
  if (USE_MOCK_DATA) return incomeVsExpensesData

  const transactions = await getTransactions()
  const monthMap = new Map<string, { month: string; income: number; expenses: number }>()

  for (const transaction of transactions) {
    const month = toMonthLabel(transaction.date)
    const existing = monthMap.get(month) ?? { month, income: 0, expenses: 0 }
    if (transaction.amount >= 0) {
      existing.income += transaction.amount
    } else {
      existing.expenses += Math.abs(transaction.amount)
    }
    monthMap.set(month, existing)
  }

  return Array.from(monthMap.values())
}

export const getExpensesByCategory = async () => {
  if (USE_MOCK_DATA) return expensesByCategoryData

  const transactions = await getTransactions()
  const categoryTotals = new Map<string, number>()

  for (const transaction of transactions) {
    if (transaction.amount >= 0) continue
    categoryTotals.set(
      transaction.category,
      (categoryTotals.get(transaction.category) ?? 0) + Math.abs(transaction.amount)
    )
  }

  return Array.from(categoryTotals.entries()).map(([name, value]) => ({ name, value }))
}

export const getChartColors = () => CHART_COLORS
export const getDateRangeOptions = () => dateRangeOptions

export const getBudgets = async (): Promise<MockBudgetItem[]> => {
  if (USE_MOCK_DATA) return budgetData
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("budget_with_spending")
    .select("id, category_name, budget_limit, recurring, spent")
    .order("id", { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    category: row.category_name,
    limit: row.budget_limit,
    spent: row.spent,
    icon: getCategoryIcon(row.category_name),
    recurring: row.recurring,
  }))
}

export const getDebts = async (): Promise<MockLiability[]> => {
  if (USE_MOCK_DATA) return liabilitiesData
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("liabilities")
    .select("id,name,type,current_balance,original_balance,min_payment,apr,due_day")
    .order("id", { ascending: false })

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    currentBalance: row.current_balance,
    originalBalance: row.original_balance,
    minPayment: row.min_payment,
    apr: row.apr,
    dueDay: row.due_day ?? 1,
    icon: typeIconMap[row.type],
  }))
}

export const getCashFlowData = async (): Promise<MonthlyData[]> => {
  if (USE_MOCK_DATA) return cashFlowData
  return getIncomeVsExpenses()
}

export const getExpenseBreakdown = async (): Promise<CategoryExpense[]> => {
  if (USE_MOCK_DATA) return expenseBreakdown
  return getExpensesByCategory()
}

export const getTopSpendingCategories = async (): Promise<SpendingRank[]> => {
  if (USE_MOCK_DATA) return topSpendingCategories

  const expenses = await getExpensesByCategory()
  return expenses
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((item, index) => ({
      rank: index + 1,
      category: item.name,
      amount: item.value,
    }))
}

export const getSubscriptions = async (): Promise<Subscription[]> => {
  if (USE_MOCK_DATA) return subscriptions
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("subscriptions")
    .select("name,amount,frequency")
    .eq("active", true)
    .order("name", { ascending: true })

  if (error || !data) return []
  return data
}

export const getNetWorth = async (): Promise<NetWorthPoint[]> => {
  if (USE_MOCK_DATA) return netWorthData

  const chartData = await getIncomeVsExpenses()
  let runningValue = 0
  return chartData.map((item) => {
    runningValue += item.income - item.expenses
    return { month: item.month, value: runningValue }
  })
}
