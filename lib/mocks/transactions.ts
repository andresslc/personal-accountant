// Mock transactions data
import { CreditCard, Utensils, Zap, ShoppingCart, Pill, Film, Briefcase, type LucideIcon } from "lucide-react"

export type PaymentMethod = 'Credit Card' | 'Bank Transfer' | 'Cash' | 'Debit Card'
export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: number
  date: string
  category: string
  type: TransactionType
  description: string
  amount: number
  method: PaymentMethod
  icon?: LucideIcon
}

// Recent transactions for dashboard widget
export const recentTransactions: Transaction[] = [
  {
    id: 1,
    date: "2024-01-15",
    category: "Groceries",
    type: "expense",
    description: "Whole Foods Market",
    amount: -82.45,
    method: "Credit Card",
    icon: Utensils,
  },
  { 
    id: 2, 
    date: "2024-01-14", 
    category: "Salary", 
    type: "income",
    description: "Monthly Salary", 
    amount: 4500, 
    method: "Bank Transfer",
    icon: CreditCard 
  },
  { 
    id: 3, 
    date: "2024-01-14", 
    category: "Utilities", 
    type: "expense",
    description: "Electric Bill", 
    amount: -124.5, 
    method: "Bank Transfer",
    icon: Zap 
  },
  {
    id: 4,
    date: "2024-01-13",
    category: "Shopping",
    type: "expense",
    description: "Amazon Purchase",
    amount: -56.99,
    method: "Credit Card",
    icon: ShoppingCart,
  },
  { 
    id: 5, 
    date: "2024-01-13", 
    category: "Healthcare", 
    type: "expense",
    description: "Pharmacy", 
    amount: -28.0, 
    method: "Cash",
    icon: Pill 
  },
]

// Full transactions list for transactions page
export const allTransactions: Transaction[] = [
  {
    id: 1,
    date: "2024-01-15",
    category: "Groceries",
    type: "expense",
    description: "Whole Foods Market",
    amount: -82.45,
    method: "Credit Card",
  },
  {
    id: 2,
    date: "2024-01-14",
    category: "Salary",
    type: "income",
    description: "Monthly Salary",
    amount: 4500,
    method: "Bank Transfer",
  },
  {
    id: 3,
    date: "2024-01-14",
    category: "Utilities",
    type: "expense",
    description: "Electric Bill",
    amount: -124.5,
    method: "Bank Transfer",
  },
  {
    id: 4,
    date: "2024-01-13",
    category: "Shopping",
    type: "expense",
    description: "Amazon Purchase",
    amount: -56.99,
    method: "Credit Card",
  },
  {
    id: 5,
    date: "2024-01-13",
    category: "Healthcare",
    type: "expense",
    description: "Pharmacy",
    amount: -28.0,
    method: "Cash",
  },
  {
    id: 6,
    date: "2024-01-12",
    category: "Groceries",
    type: "expense",
    description: "Trader Joe's",
    amount: -65.32,
    method: "Credit Card",
  },
  {
    id: 7,
    date: "2024-01-12",
    category: "Entertainment",
    type: "expense",
    description: "Movie Tickets",
    amount: -32.0,
    method: "Credit Card",
  },
  {
    id: 8,
    date: "2024-01-11",
    category: "Freelance",
    type: "income",
    description: "Project Payment",
    amount: 800,
    method: "Bank Transfer",
  },
]

// Transaction categories for filtering
export const transactionCategories = [
  "all", 
  "Groceries", 
  "Salary", 
  "Utilities", 
  "Shopping", 
  "Healthcare", 
  "Entertainment", 
  "Freelance"
]

export const transactionTypes = ["all", "income", "expense"]

