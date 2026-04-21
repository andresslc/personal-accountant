import type { SupabaseClient } from "@supabase/supabase-js"
import { USE_MOCK_DATA } from "@/lib/config/data-source"
import { formatCurrency, type SupportedCurrency } from "@/lib/utils/currency"
import { createClient } from "@/lib/supabase/client"
import {
  getCategoryIcon,
  getLiabilityIcon,
  getSummaryIcon,
  type LiabilityType,
  type SummaryIconKey,
} from "@/lib/ui/category-icons"
import type { ClientArchetype } from "@/lib/mocks/archetypes"
import type { PayoffTimelinePoint } from "@/lib/mocks/debts"

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

// Server pages register the active archetype as a resolver before fetching
// data — see `app/dashboard/*/page.tsx`. Doing it inline in each page
// eliminates a subtle Next.js 16 / React 19 streaming race where the layout
// and its child page can start fetching in parallel, which made
// `setMockSourceResolver` (called only in the layout) sometimes fire AFTER
// the page's first data call had already resolved to the legacy fallback.
type MockSourceResolver = () => Promise<ClientArchetype | null>

const RESOLVER_KEY = "__finflow_archetype_resolver__" as const

export function setMockSourceResolver(resolver: MockSourceResolver): void {
  if (typeof window !== "undefined") return
  ;(globalThis as unknown as Record<string, MockSourceResolver>)[RESOLVER_KEY] =
    resolver
}

async function getMockSource(): Promise<ClientArchetype | null> {
  if (!USE_MOCK_DATA) return null
  if (typeof window !== "undefined") return null
  const resolver = (
    globalThis as unknown as Record<string, MockSourceResolver | undefined>
  )[RESOLVER_KEY]
  if (!resolver) return null
  try {
    return await resolver()
  } catch {
    return null
  }
}

type CategoryMap = Record<string, string>

const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) return null

  return createClient()
}

const toMonthLabel = (dateString: string) =>
  new Date(dateString).toLocaleString("en-US", { month: "short" })

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

const getCategoryMap = async (
  client?: AnySupabaseClient
): Promise<CategoryMap> => {
  const cached = getCached<CategoryMap>("category-map")
  if (cached) return cached

  const supabase = (client ?? getSupabaseClient()) as AnySupabaseClient | null
  if (!supabase) return {}

  const { data, error } = await supabase.from("categories").select("id,name")
  if (error || !data) return {}

  const map = data.reduce<CategoryMap>((acc, row) => {
    acc[row.id] = row.name
    return acc
  }, {})
  setCached("category-map", map)
  return map
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

export const getTransactions = async (
  client?: AnySupabaseClient
): Promise<MockTransaction[]> => {
  if (USE_MOCK_DATA) {
    const archetype = await getMockSource()
    return archetype?.transactions ?? allTransactions
  }

  const cached = getCached<MockTransaction[]>("transactions")
  if (cached) return cached

  const supabase = (client ?? getSupabaseClient()) as AnySupabaseClient | null
  if (!supabase) return []

  const categories = await getCategoryMap(supabase)
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

export type TransactionsPageData = {
  transactions: MockTransaction[]
  categoryOptions: string[]
}

export const getTransactionsPageData = async (
  client?: AnySupabaseClient
): Promise<TransactionsPageData> => {
  if (USE_MOCK_DATA) {
    const archetype = await getMockSource()
    const list = archetype?.transactions ?? allTransactions
    return {
      transactions: list,
      categoryOptions: ["all", ...new Set(list.map((t) => t.category))],
    }
  }

  const supabase = (client ?? getSupabaseClient()) as AnySupabaseClient | null
  if (!supabase) return { transactions: [], categoryOptions: ["all"] }

  const { data: categoryRows, error: categoryError } = await supabase
    .from("categories")
    .select("id,name")
    .order("name", { ascending: true })

  const categoryMap: CategoryMap = {}
  const sortedNames: string[] = []

  if (!categoryError && categoryRows) {
    for (const row of categoryRows) {
      categoryMap[row.id] = row.name
      sortedNames.push(row.name)
    }
    setCached("category-map", categoryMap)
  }

  const { data: transactionRows, error: transactionError } = await supabase
    .from("transactions")
    .select("id,date,description,amount,type,method,category_id")
    .order("date", { ascending: false })
    .limit(200)

  if (transactionError || !transactionRows) {
    return {
      transactions: [],
      categoryOptions: ["all", ...sortedNames],
    }
  }

  const transactions = transactionRows.map((row) =>
    mapSupabaseTransactionToUi(row, categoryMap)
  )
  setCached("transactions", transactions)

  return {
    transactions,
    categoryOptions: ["all", ...sortedNames],
  }
}

export const getRecentTransactions = async (
  client?: AnySupabaseClient
): Promise<MockTransaction[]> => {
  if (USE_MOCK_DATA) {
    const archetype = await getMockSource()
    return (archetype?.transactions ?? recentTransactions).slice(0, 5)
  }

  const supabase = (client ?? getSupabaseClient()) as AnySupabaseClient | null
  if (!supabase) return []

  const categories = await getCategoryMap(supabase)
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
    const archetype = await getMockSource()
    const source = archetype?.transactions ?? allTransactions
    return ["all", ...new Set(source.map((transaction) => transaction.category))]
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

export type SerializableSummaryCard = {
  title: string
  amount: number
  change: string
  positive: boolean
  color: string
  iconKey: SummaryIconKey
}

const buildSummaryCardsFromValues = (
  totals: { income: number; expenses: number; savings: number; totalDebt: number }
): SerializableSummaryCard[] => [
  {
    title: "Debts",
    amount: totals.totalDebt,
    change: "Live",
    positive: totals.totalDebt === 0,
    color: "bg-red-500/10 text-red-600",
    iconKey: "debts",
  },
  {
    title: "Income",
    amount: totals.income,
    change: "Live",
    positive: true,
    color: "bg-green-500/10 text-green-600",
    iconKey: "income",
  },
  {
    title: "Expenses",
    amount: totals.expenses,
    change: "Live",
    positive: false,
    color: "bg-red-500/10 text-red-600",
    iconKey: "expenses",
  },
  {
    title: "Savings",
    amount: totals.savings,
    change: "Live",
    positive: totals.savings >= 0,
    color: "bg-purple-500/10 text-purple-600",
    iconKey: "savings",
  },
]

const computeSummaryTotals = (
  transactions: MockTransaction[],
  debts: MockLiability[]
) => {
  const income = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const expenses = Math.abs(
    transactions
      .filter((transaction) => transaction.amount < 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  )
  const savings = income - expenses
  const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0)
  return { income, expenses, savings, totalDebt }
}

export type SummaryTotals = {
  totalDebt: number
  income: number
  expenses: number
  savings: number
}

// Raw numeric summary — used by AI context builders and anywhere a numeric
// value is needed instead of a pre-formatted string.
export const getSummaryTotals = async (): Promise<SummaryTotals> => {
  if (USE_MOCK_DATA) {
    const archetype = await getMockSource()
    if (archetype) {
      return {
        totalDebt: archetype.summary.totalDebt,
        income: archetype.summary.income,
        expenses: archetype.summary.expenses,
        savings: archetype.summary.savings,
      }
    }
  }

  const [transactions, debts] = await Promise.all([getTransactions(), getDebts()])
  return computeSummaryTotals(transactions, debts)
}

export const getSummaryCards = async (currency: SupportedCurrency = "COP") => {
  if (USE_MOCK_DATA) {
    const archetype = await getMockSource()
    if (archetype) {
      return archetype.summaryCards.map((card) => ({
        ...card,
        icon: getSummaryIcon(
          card.title === "Debts"
            ? "debts"
            : card.title === "Income"
              ? "income"
              : card.title === "Expenses"
                ? "expenses"
                : "savings"
        ),
      }))
    }
    return summaryCardsData
  }

  const fmt = (v: number) => formatCurrency(v, currency)
  const transactions = await getTransactions()
  const debts = await getDebts()
  const totals = computeSummaryTotals(transactions, debts)

  return buildSummaryCardsFromValues(totals).map((card) => ({
    title: card.title,
    value: fmt(card.amount),
    change: card.change,
    positive: card.positive,
    icon: getSummaryIcon(card.iconKey),
    color: card.color,
  }))
}

export const getIncomeVsExpenses = async (
  client?: AnySupabaseClient
) => {
  if (USE_MOCK_DATA) {
    const archetype = await getMockSource()
    return archetype?.monthlyFlow ?? incomeVsExpensesData
  }

  const cached = getCached<{ month: string; income: number; expenses: number }[]>("incomeVsExpenses")
  if (cached) return cached

  const transactions = await getTransactions(client)
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

export const getExpensesByCategory = async (
  client?: AnySupabaseClient
) => {
  if (USE_MOCK_DATA) {
    const archetype = await getMockSource()
    return archetype?.expensesByCategory ?? expensesByCategoryData
  }

  const cached = getCached<{ name: string; value: number }[]>("expensesByCategory")
  if (cached) return cached

  const transactions = await getTransactions(client)
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

export const getBudgets = async (
  client?: AnySupabaseClient
): Promise<MockBudgetItem[]> => {
  if (USE_MOCK_DATA) {
    const archetype = await getMockSource()
    return archetype?.budgets ?? budgetData
  }
  const supabase = (client ?? getSupabaseClient()) as AnySupabaseClient | null
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

export const getDebts = async (
  client?: AnySupabaseClient
): Promise<MockLiability[]> => {
  if (USE_MOCK_DATA) {
    const archetype = await getMockSource()
    return archetype?.liabilities ?? liabilitiesData
  }
  const supabase = (client ?? getSupabaseClient()) as AnySupabaseClient | null
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
    icon: getLiabilityIcon(row.type as LiabilityType),
  }))
}

export const getCashFlowData = async (
  client?: AnySupabaseClient
): Promise<MonthlyData[]> => {
  if (USE_MOCK_DATA) {
    const archetype = await getMockSource()
    return archetype?.monthlyFlow ?? cashFlowData
  }
  return getIncomeVsExpenses(client)
}

export const getExpenseBreakdown = async (
  client?: AnySupabaseClient
): Promise<CategoryExpense[]> => {
  if (USE_MOCK_DATA) {
    const archetype = await getMockSource()
    return archetype?.expensesByCategory ?? expenseBreakdown
  }
  return getExpensesByCategory(client)
}

export const getTopSpendingCategories = async (
  client?: AnySupabaseClient
): Promise<SpendingRank[]> => {
  if (USE_MOCK_DATA) {
    const archetype = await getMockSource()
    return archetype?.topSpending ?? topSpendingCategories
  }

  const expenses = await getExpensesByCategory(client)
  return expenses
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((item, index) => ({
      rank: index + 1,
      category: item.name,
      amount: item.value,
    }))
}

export const getSubscriptions = async (
  client?: AnySupabaseClient
): Promise<Subscription[]> => {
  if (USE_MOCK_DATA) {
    const archetype = await getMockSource()
    return archetype?.subscriptions ?? subscriptions
  }
  const supabase = (client ?? getSupabaseClient()) as AnySupabaseClient | null
  if (!supabase) return []

  const { data, error } = await supabase
    .from("subscriptions")
    .select("name,amount,frequency")
    .eq("active", true)
    .order("name", { ascending: true })

  if (error || !data) return []
  return data
}

export const getNetWorth = async (
  client?: AnySupabaseClient
): Promise<NetWorthPoint[]> => {
  if (USE_MOCK_DATA) {
    const archetype = await getMockSource()
    return archetype?.netWorth ?? netWorthData
  }

  const chartData = await getIncomeVsExpenses(client)
  let runningValue = 0
  return chartData.map((item) => {
    runningValue += item.income - item.expenses
    return { month: item.month, value: runningValue }
  })
}

// --- Page-level fetchers for Server Components ---

export type DashboardPageData = {
  summaryCards: SerializableSummaryCard[]
  incomeVsExpenses: MonthlyData[]
  expensesByCategory: CategoryExpense[]
  recentTransactions: Omit<MockTransaction, "icon">[]
}

const stripIcon = <T extends { icon?: unknown }>(item: T): Omit<T, "icon"> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { icon: _icon, ...rest } = item
  return rest
}

export const getDashboardPageData = async (
  client?: AnySupabaseClient
): Promise<DashboardPageData> => {
  if (USE_MOCK_DATA) {
    const archetype = await getMockSource()
    if (archetype) {
      return {
        summaryCards: archetype.summaryCards.map((card) => ({
          title: card.title,
          amount:
            card.title === "Debts"
              ? archetype.summary.totalDebt
              : card.title === "Income"
                ? archetype.summary.income
                : card.title === "Expenses"
                  ? archetype.summary.expenses
                  : archetype.summary.savings,
          change: card.change,
          positive: card.positive,
          color: card.color,
          iconKey:
            card.title === "Debts"
              ? "debts"
              : card.title === "Income"
                ? "income"
                : card.title === "Expenses"
                  ? "expenses"
                  : "savings",
        })),
        incomeVsExpenses: archetype.monthlyFlow,
        expensesByCategory: archetype.expensesByCategory,
        recentTransactions: archetype.transactions.slice(0, 5).map(stripIcon),
      }
    }
    const totals = computeSummaryTotals(allTransactions, liabilitiesData)
    return {
      summaryCards: buildSummaryCardsFromValues(totals),
      incomeVsExpenses: incomeVsExpensesData,
      expensesByCategory: expensesByCategoryData,
      recentTransactions: recentTransactions.map(stripIcon),
    }
  }

  const supabase = (client ?? getSupabaseClient()) as AnySupabaseClient | null
  if (!supabase) {
    return {
      summaryCards: buildSummaryCardsFromValues({
        income: 0,
        expenses: 0,
        savings: 0,
        totalDebt: 0,
      }),
      incomeVsExpenses: [],
      expensesByCategory: [],
      recentTransactions: [],
    }
  }

  const [transactions, debts] = await Promise.all([
    getTransactions(supabase),
    getDebts(supabase),
  ])

  const totals = computeSummaryTotals(transactions, debts)
  const incomeVsExpenses = await getIncomeVsExpenses(supabase)
  const expensesByCategory = await getExpensesByCategory(supabase)
  const recent = transactions.slice(0, 5).map(stripIcon)

  return {
    summaryCards: buildSummaryCardsFromValues(totals),
    incomeVsExpenses,
    expensesByCategory,
    recentTransactions: recent,
  }
}

export type BudgetPageData = {
  budgets: Omit<MockBudgetItem, "icon">[]
}

export const getBudgetPageData = async (
  client?: AnySupabaseClient
): Promise<BudgetPageData> => {
  const budgets = await getBudgets(client)
  return { budgets: budgets.map(stripIcon) }
}

export type DebtsPageData = {
  liabilities: Omit<MockLiability, "icon">[]
  payoffTimeline: PayoffTimelinePoint[]
}

export const getPayoffTimeline = async (
  client?: AnySupabaseClient
): Promise<PayoffTimelinePoint[]> => {
  if (USE_MOCK_DATA) {
    const archetype = await getMockSource()
    if (archetype?.payoffTimeline?.length) return archetype.payoffTimeline
  }
  const { payoffTimelineData } = await import("@/lib/mocks/debts")
  void client
  return payoffTimelineData
}

export const getDebtsPageData = async (
  client?: AnySupabaseClient
): Promise<DebtsPageData> => {
  const [liabilities, payoffTimeline] = await Promise.all([
    getDebts(client),
    getPayoffTimeline(client),
  ])
  return {
    liabilities: liabilities.map(stripIcon),
    payoffTimeline,
  }
}

export type ReportsPageData = {
  cashFlow: MonthlyData[]
  expenseBreakdown: CategoryExpense[]
  topSpendingCategories: SpendingRank[]
  subscriptions: Subscription[]
  netWorth: NetWorthPoint[]
}

export const getReportsPageData = async (
  client?: AnySupabaseClient
): Promise<ReportsPageData> => {
  const [cashFlow, breakdown, topCategories, subs, netWorth] = await Promise.all([
    getCashFlowData(client),
    getExpenseBreakdown(client),
    getTopSpendingCategories(client),
    getSubscriptions(client),
    getNetWorth(client),
  ])

  return {
    cashFlow,
    expenseBreakdown: breakdown,
    topSpendingCategories: topCategories,
    subscriptions: subs,
    netWorth,
  }
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
