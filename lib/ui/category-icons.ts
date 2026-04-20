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

export type LiabilityType = "credit-card" | "car" | "student" | "personal" | "mortgage"

export type SummaryIconKey = "debts" | "income" | "expenses" | "savings"

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

const liabilityIconMap: Record<LiabilityType, LucideIcon> = {
  "credit-card": CreditCard,
  car: Car,
  student: CreditCard,
  personal: DollarSign,
  mortgage: Home,
}

const summaryIconMap: Record<SummaryIconKey, LucideIcon> = {
  debts: CreditCard,
  income: TrendingUp,
  expenses: TrendingDown,
  savings: Wallet,
}

export const getCategoryIcon = (name: string): LucideIcon => {
  const normalized = name.trim().toLowerCase()
  return categoryIconMap[normalized] ?? CreditCard
}

export const getLiabilityIcon = (type: LiabilityType): LucideIcon =>
  liabilityIconMap[type] ?? CreditCard

export const getSummaryIcon = (key: SummaryIconKey): LucideIcon => summaryIconMap[key]
