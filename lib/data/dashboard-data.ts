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
import type { SupabaseClient } from "@supabase/supabase-js"
import { USE_MOCK_DATA } from "@/lib/config/data-source"
import { formatCurrency, type SupportedCurrency } from "@/lib/utils/currency"
import { createClient } from "@/lib/supabase/client"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>
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

const getCategoryIcon = (category: string): LucideIcon => {
  const normalized = category.trim().toLowerCase()
  return categoryIconMap[normalized] ?? CreditCard
}

// --- Request-scoped cache for deduplicating underlying queries ---
// Each cache entry stores its creation timestamp. Entries older than
// the TTL are treated as stale so that successive user-initiated
// navigations always hit the database while concurrent fetches within
// the same logical request share a single query.
const REQUEST_CACHE_TTL_MS = 5_000

type CacheEntry<T> = { data: T; ts: number }

const queryCache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(key: string): T | undefined {
  const entry = queryCache.get(key)
  if (!entry) return undefined
  if (Date.now() - entry.ts > REQUEST_CACHE_TTL_MS) {
    queryCache.delete(key)
    return undefined
  }
  return entry.data as T
}

function setCached<T>(key: string, data: T): void {
  queryCache.set(key, { data, ts: Date.now() })
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

  const cached = getCached<MockTransaction[]>("transactions")
  if (cached) return cached

  const supabase = getSupabaseClient()
  if (!supabase) return []

  const categories = await getCategoryMap()
  const { data, error } = await supabase
    .from("transactions")
    .select("id,date,description,amount,type,method,category_id")
    .order("date", { ascending: false })
    .limit(200)

  if (error || !data) return []

  const result = data.map((row) => mapSupabaseTransactionToUi(row, categories))
  setCached("transactions", result)
  return result
}

export const getRecentTransactions = async (): Promise<MockTransaction[]> => {
  if (USE_MOCK_DATA) return recentTransactions

  const supabase = getSupabaseClient()
  if (!supabase) return []

  const categories = await getCategoryMap()
  const { data, error } = await supabase
    .from("transactions")
    .select("id,date,description,amount,type,method,category_id")
    .order("date", { ascending: false })
    .limit(5)

  if (error || !data) return []

  return data.map((row) => mapSupabaseTransactionToUi(row, categories))
}

export const getTransactionCategories = async (): Promise<string[]> => {
  if (USE_MOCK_DATA) {
    return ["all", ...new Set(allTransactions.map((transaction) => transaction.category))]
  }

  const supabase = getSupabaseClient()
  if (!supabase) return ["all"]

  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .order("name", { ascending: true })

  if (error || !data) return ["all"]

  return ["all", ...data.map((row) => row.name)]
}

export const getSummaryCards = async (currency: SupportedCurrency = "COP") => {
  if (USE_MOCK_DATA) return summaryCardsData

  const fmt = (v: number) => formatCurrency(v, currency)

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
      value: fmt(totalBalance),
      change: "Live",
      positive: totalBalance >= 0,
      icon: DollarSign,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Income",
      value: fmt(income),
      change: "Live",
      positive: true,
      icon: TrendingUp,
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: "Expenses",
      value: fmt(expenses),
      change: "Live",
      positive: false,
      icon: TrendingDown,
      color: "bg-red-500/10 text-red-600",
    },
    {
      title: "Savings",
      value: fmt(savings),
      change: "Live",
      positive: savings >= 0,
      icon: Wallet,
      color: "bg-purple-500/10 text-purple-600",
    },
  ]
}

export const getIncomeVsExpenses = async () => {
  if (USE_MOCK_DATA) return incomeVsExpensesData

  const cached = getCached<{ month: string; income: number; expenses: number }[]>("incomeVsExpenses")
  if (cached) return cached

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

  const result = Array.from(monthMap.values())
  setCached("incomeVsExpenses", result)
  return result
}

export const getExpensesByCategory = async () => {
  if (USE_MOCK_DATA) return expensesByCategoryData

  const cached = getCached<{ name: string; value: number }[]>("expensesByCategory")
  if (cached) return cached

  const transactions = await getTransactions()
  const categoryTotals = new Map<string, number>()

  for (const transaction of transactions) {
    if (transaction.amount >= 0) continue
    categoryTotals.set(
      transaction.category,
      (categoryTotals.get(transaction.category) ?? 0) + Math.abs(transaction.amount)
    )
  }

  const result = Array.from(categoryTotals.entries()).map(([name, value]) => ({ name, value }))
  setCached("expensesByCategory", result)
  return result
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

// --- Write functions ---

export type TransactionInsert = {
  date: string
  description: string
  amount: number
  type: "income" | "expense" | "debt-payment"
  category_id: string | null
  method: string | null
  liability_id: number | null
}

export type BudgetInsert = {
  category_id: string
  budget_limit: number
  recurring: boolean
  month_year: string
}

export type LiabilityInsert = {
  name: string
  type: "credit-card" | "car" | "student" | "personal" | "mortgage"
  current_balance: number
  original_balance: number
  min_payment: number
  apr: number
  due_day: number | null
}

export type LiabilityUpdate = Partial<LiabilityInsert>

export type TransactionUpdate = Partial<Omit<TransactionInsert, "liability_id">>

export const createTransaction = async (
  data: TransactionInsert,
  userId: string,
  client?: AnySupabaseClient
): Promise<{ id: number } | null> => {
  if (USE_MOCK_DATA) {
    const fakeId = Math.floor(Math.random() * 100000) + 1000
    console.log("[mock] createTransaction:", { ...data, id: fakeId, userId })
    return { id: fakeId }
  }
  const supabase = (client ?? getSupabaseClient()) as AnySupabaseClient | null
  if (!supabase) return null

  const { data: row, error } = await supabase
    .from("transactions")
    .insert({ ...data, user_id: userId })
    .select("id")
    .single()

  if (error) {
    console.error("[createTransaction] Supabase error:", error.message, error.details)
    return null
  }
  if (!row) return null
  return { id: row.id }
}

export const createBudgetItem = async (
  data: BudgetInsert,
  userId: string,
  client?: AnySupabaseClient
): Promise<{ id: number } | null> => {
  if (USE_MOCK_DATA) {
    const fakeId = Math.floor(Math.random() * 100000) + 1000
    console.log("[mock] createBudgetItem:", { ...data, id: fakeId, userId })
    return { id: fakeId }
  }
  const supabase = (client ?? getSupabaseClient()) as AnySupabaseClient | null
  if (!supabase) return null

  const { data: row, error } = await supabase
    .from("budget_items")
    .insert({ ...data, user_id: userId })
    .select("id")
    .single()

  if (error) {
    console.error("[createBudgetItem] Supabase error:", error.message, error.details)
    return null
  }
  if (!row) return null
  return { id: row.id }
}

export const createDebt = async (
  data: LiabilityInsert,
  userId: string,
  client?: AnySupabaseClient
): Promise<{ id: number } | null> => {
  if (USE_MOCK_DATA) {
    const fakeId = Math.floor(Math.random() * 100000) + 1000
    console.log("[mock] createDebt:", { ...data, id: fakeId, userId })
    return { id: fakeId }
  }
  const supabase = (client ?? getSupabaseClient()) as AnySupabaseClient | null
  if (!supabase) {
    console.error("[createDebt] Supabase client not available")
    return null
  }

  const { data: row, error } = await supabase
    .from("liabilities")
    .insert({ ...data, user_id: userId })
    .select("id")
    .single()

  if (error) {
    console.error("[createDebt] Supabase error:", error.message, error.details)
    return null
  }
  if (!row) return null
  return { id: row.id }
}

export const deleteTransaction = async (
  id: number,
  userId: string,
  client?: AnySupabaseClient
): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    console.log("[mock] deleteTransaction:", { id, userId })
    return true
  }
  const supabase = (client ?? getSupabaseClient()) as AnySupabaseClient | null
  if (!supabase) return false

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  return !error
}

export const updateTransaction = async (
  id: number,
  userId: string,
  updates: TransactionUpdate,
  client?: AnySupabaseClient
): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    console.log("[mock] updateTransaction:", { id, userId, updates })
    return true
  }
  const supabase = (client ?? getSupabaseClient()) as AnySupabaseClient | null
  if (!supabase) return false

  const { error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)

  return !error
}

export const deleteDebt = async (
  id: number,
  userId: string,
  client?: AnySupabaseClient
): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    console.log("[mock] deleteDebt:", { id, userId })
    return true
  }
  const supabase = (client ?? getSupabaseClient()) as AnySupabaseClient | null
  if (!supabase) return false

  const { error } = await supabase
    .from("liabilities")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) {
    console.error("[deleteDebt] Supabase error:", error.message, error.details)
    return false
  }
  return true
}

export const updateDebt = async (
  id: number,
  userId: string,
  updates: LiabilityUpdate,
  client?: AnySupabaseClient
): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    console.log("[mock] updateDebt:", { id, userId, updates })
    return true
  }
  const supabase = (client ?? getSupabaseClient()) as AnySupabaseClient | null
  if (!supabase) return false

  const { error } = await supabase
    .from("liabilities")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)

  if (error) {
    console.error("[updateDebt] Supabase error:", error.message, error.details)
    return false
  }
  return true
}

// Re-export types so components never import from lib/mocks directly
export type {
  Transaction as TransactionUI,
  BudgetItem as BudgetItemUI,
  Liability as LiabilityUI,
  PayoffTimelinePoint,
  MonthlyData,
  CategoryExpense,
  SpendingRank,
  Subscription,
  NetWorthPoint,
} from "@/lib/mocks"

export type { SummaryCard } from "@/lib/mocks/summary"

// Re-export mock helpers and data that components need
export {
  getTotalBudget,
  getTotalSpent,
  getRemainingBudget,
  budgetCategoryOptions,
  budgetData,
} from "@/lib/mocks/budget"

export {
  getTotalDebt,
  getWeightedAverageApr,
  getProgressPercent,
  estimatedDebtFreeDate,
  payoffTimelineData,
  liabilitiesData,
} from "@/lib/mocks/debts"

export { getCategoryById } from "@/lib/mocks/categories"
