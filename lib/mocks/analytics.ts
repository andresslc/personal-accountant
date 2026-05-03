// Mock analytics and reports data

export interface MonthlyData {
  month: string
  income: number
  expenses: number
}

export interface CategoryExpense {
  name: string
  value: number
}

export interface SpendingRank {
  rank: number
  category: string
  amount: number
}

export interface Subscription {
  id: number
  name: string
  amount: number              // stored in COP
  frequency: 'Weekly' | 'Monthly' | 'Yearly'
  next_due_date: string | null
  last_paid_date: string | null
  active: boolean
  category: string | null
  auto_pay: boolean
  payment_method: 'Credit Card' | 'Bank Transfer' | 'Cash' | 'Debit Card' | null
}

export interface NetWorthPoint {
  month: string
  value: number
}

// Income vs Expenses chart data (monthly)
export const incomeVsExpensesData: MonthlyData[] = [
  { month: "Jan", income: 8000, expenses: 3200 },
  { month: "Feb", income: 7500, expenses: 2800 },
  { month: "Mar", income: 9200, expenses: 3500 },
  { month: "Apr", income: 8800, expenses: 3100 },
  { month: "May", income: 9500, expenses: 3600 },
  { month: "Jun", income: 10200, expenses: 3800 },
  { month: "Jul", income: 9800, expenses: 3400 },
  { month: "Aug", income: 10500, expenses: 3900 },
  { month: "Sep", income: 9600, expenses: 3300 },
  { month: "Oct", income: 10100, expenses: 3600 },
  { month: "Nov", income: 9900, expenses: 3200 },
  { month: "Dec", income: 11200, expenses: 4100 },
]

// Expenses by category (for pie charts)
export const expensesByCategoryData: CategoryExpense[] = [
  { name: "Groceries", value: 450 },
  { name: "Rent", value: 1200 },
  { name: "Entertainment", value: 280 },
  { name: "Utilities", value: 190 },
]

// Cash flow trend data (for reports)
export const cashFlowData: MonthlyData[] = [
  { month: "Jan", income: 4500, expenses: 3200 },
  { month: "Feb", income: 4200, expenses: 2800 },
  { month: "Mar", income: 4800, expenses: 3500 },
  { month: "Apr", income: 4600, expenses: 3100 },
  { month: "May", income: 5000, expenses: 3600 },
  { month: "Jun", income: 5200, expenses: 3800 },
]

// Expense breakdown for reports
export const expenseBreakdown: CategoryExpense[] = [
  { name: "Rent", value: 1500 },
  { name: "Groceries", value: 450 },
  { name: "Utilities", value: 200 },
  { name: "Entertainment", value: 280 },
  { name: "Other", value: 690 },
]

// Top spending categories
export const topSpendingCategories: SpendingRank[] = [
  { rank: 1, category: "Rent", amount: 4500 },
  { rank: 2, category: "Groceries", amount: 1350 },
  { rank: 3, category: "Utilities", amount: 600 },
]

// Recurring subscriptions
export const subscriptions: Subscription[] = [
  {
    id: 1,
    name: "Netflix",
    amount: 65000,
    frequency: "Monthly",
    next_due_date: "2026-05-07",
    last_paid_date: "2026-04-07",
    active: true,
    category: "Streaming",
    auto_pay: true,
    payment_method: "Credit Card",
  },
  {
    id: 2,
    name: "Spotify",
    amount: 21900,
    frequency: "Monthly",
    next_due_date: "2026-05-07",
    last_paid_date: "2026-04-07",
    active: true,
    category: "Music",
    auto_pay: true,
    payment_method: "Credit Card",
  },
  {
    id: 3,
    name: "Cloud Storage",
    amount: 12000,
    frequency: "Monthly",
    next_due_date: "2026-05-07",
    last_paid_date: "2026-04-07",
    active: true,
    category: "Software",
    auto_pay: true,
    payment_method: "Credit Card",
  },
]

// Net worth over time
export const netWorthData: NetWorthPoint[] = [
  { month: "Jan", value: 24000 },
  { month: "Feb", value: 24800 },
  { month: "Mar", value: 26200 },
  { month: "Apr", value: 27100 },
  { month: "May", value: 28900 },
  { month: "Jun", value: 30500 },
  { month: "Jul", value: 31200 },
  { month: "Aug", value: 33100 },
  { month: "Sep", value: 34500 },
  { month: "Oct", value: 35800 },
  { month: "Nov", value: 36900 },
  { month: "Dec", value: 38200 },
]

// Chart colors (CSS variable based)
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

// Date range options — match the monthly granularity of the cash flow and
// net-worth series so filtering has a meaningful effect on the charts.
export const dateRangeOptions = [
  { value: "3m", label: "Last 3 months" },
  { value: "6m", label: "Last 6 months" },
  { value: "12m", label: "Last 12 months" },
] as const

export type DateRangeOption = (typeof dateRangeOptions)[number]["value"]
