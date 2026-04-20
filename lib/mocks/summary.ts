// Mock summary/overview data
import { TrendingUp, TrendingDown, CreditCard, Wallet, type LucideIcon } from "lucide-react"
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/currency"

export interface SummaryCard {
  title: string
  value: string
  change: string
  positive: boolean
  icon: LucideIcon
  color: string
}

export const summaryCardsData: SummaryCard[] = [
  {
    title: "Debts",
    value: formatCurrencyUtil(28500000),
    change: "-3.1%",
    positive: true,
    icon: CreditCard,
    color: "bg-red-500/10 text-red-500",
  },
  {
    title: "Income",
    value: formatCurrencyUtil(8450.00),
    change: "+5.2%",
    positive: true,
    icon: TrendingUp,
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "Expenses",
    value: formatCurrencyUtil(3120.50),
    change: "-2.1%",
    positive: false,
    icon: TrendingDown,
    color: "bg-red-500/10 text-red-500",
  },
  {
    title: "Savings",
    value: formatCurrencyUtil(5330.50),
    change: "+18.3%",
    positive: true,
    icon: Wallet,
    color: "bg-purple-500/10 text-purple-500",
  },
]

// Raw values for calculations
export const summaryValues = {
  totalDebt: 28500000,
  income: 8450.00,
  expenses: 3120.50,
  savings: 5330.50,
  debtChange: -3.1,
  incomeChange: 5.2,
  expensesChange: -2.1,
  savingsChange: 18.3,
}

// Format currency helper — re-export from shared utility
export { formatCurrency } from "@/lib/utils/currency"

// Format percentage helper
export const formatPercentage = (value: number, showSign: boolean = true): string => {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value}%`
}

