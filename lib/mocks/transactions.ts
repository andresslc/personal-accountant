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
    date: "2026-02-28",
    category: "Groceries",
    type: "expense",
    description: "Whole Foods Market",
    amount: -82.45,
    method: "Credit Card",
    icon: Utensils,
  },
  {
    id: 2,
    date: "2026-02-27",
    category: "Salary",
    type: "income",
    description: "Monthly Salary",
    amount: 4500,
    method: "Bank Transfer",
    icon: CreditCard,
  },
  {
    id: 3,
    date: "2026-02-27",
    category: "Utilities",
    type: "expense",
    description: "Electric Bill",
    amount: -124.5,
    method: "Bank Transfer",
    icon: Zap,
  },
  {
    id: 4,
    date: "2026-02-26",
    category: "Shopping",
    type: "expense",
    description: "Amazon Purchase",
    amount: -56.99,
    method: "Credit Card",
    icon: ShoppingCart,
  },
  {
    id: 5,
    date: "2026-02-26",
    category: "Healthcare",
    type: "expense",
    description: "Pharmacy",
    amount: -28.0,
    method: "Cash",
    icon: Pill,
  },
]

// Full transactions list for transactions page
export const allTransactions: Transaction[] = [
  { id: 1, date: "2026-02-28", category: "Groceries", type: "expense", description: "Whole Foods Market", amount: -82.45, method: "Credit Card" },
  { id: 2, date: "2026-02-27", category: "Salary", type: "income", description: "Monthly Salary", amount: 4500, method: "Bank Transfer" },
  { id: 3, date: "2026-02-27", category: "Utilities", type: "expense", description: "Electric Bill", amount: -124.5, method: "Bank Transfer" },
  { id: 4, date: "2026-02-26", category: "Shopping", type: "expense", description: "Amazon Purchase", amount: -56.99, method: "Credit Card" },
  { id: 5, date: "2026-02-26", category: "Healthcare", type: "expense", description: "Pharmacy", amount: -28.0, method: "Cash" },
  { id: 6, date: "2026-02-25", category: "Groceries", type: "expense", description: "Trader Joe's", amount: -65.32, method: "Credit Card" },
  { id: 7, date: "2026-02-25", category: "Entertainment", type: "expense", description: "Movie Tickets", amount: -32.0, method: "Credit Card" },
  { id: 8, date: "2026-02-24", category: "Freelance", type: "income", description: "Project Payment", amount: 800, method: "Bank Transfer" },
  { id: 9, date: "2026-02-24", category: "Shopping", type: "expense", description: "Target Run", amount: -94.20, method: "Debit Card" },
  { id: 10, date: "2026-02-23", category: "Groceries", type: "expense", description: "Costco Bulk Buy", amount: -178.55, method: "Credit Card" },
  { id: 11, date: "2026-02-23", category: "Utilities", type: "expense", description: "Water Bill", amount: -45.00, method: "Bank Transfer" },
  { id: 12, date: "2026-02-22", category: "Entertainment", type: "expense", description: "Spotify Premium", amount: -10.99, method: "Credit Card" },
  { id: 13, date: "2026-02-22", category: "Healthcare", type: "expense", description: "Doctor Visit Copay", amount: -40.00, method: "Debit Card" },
  { id: 14, date: "2026-02-21", category: "Shopping", type: "expense", description: "Best Buy Electronics", amount: -249.99, method: "Credit Card" },
  { id: 15, date: "2026-02-21", category: "Groceries", type: "expense", description: "Walmart Groceries", amount: -53.18, method: "Debit Card" },
  { id: 16, date: "2026-02-20", category: "Utilities", type: "expense", description: "Internet Bill", amount: -79.99, method: "Bank Transfer" },
  { id: 17, date: "2026-02-20", category: "Entertainment", type: "expense", description: "Netflix Subscription", amount: -15.49, method: "Credit Card" },
  { id: 18, date: "2026-02-19", category: "Freelance", type: "income", description: "Consulting Fee", amount: 1200, method: "Bank Transfer" },
  { id: 19, date: "2026-02-19", category: "Groceries", type: "expense", description: "Organic Market", amount: -71.30, method: "Cash" },
  { id: 20, date: "2026-02-18", category: "Shopping", type: "expense", description: "Nike Store", amount: -129.00, method: "Credit Card" },
  { id: 21, date: "2026-02-18", category: "Healthcare", type: "expense", description: "Vitamins & Supplements", amount: -35.50, method: "Debit Card" },
  { id: 22, date: "2026-02-17", category: "Entertainment", type: "expense", description: "Concert Tickets", amount: -85.00, method: "Credit Card" },
  { id: 23, date: "2026-02-17", category: "Groceries", type: "expense", description: "Aldi Weekly Shop", amount: -47.62, method: "Debit Card" },
  { id: 24, date: "2026-02-16", category: "Utilities", type: "expense", description: "Gas Bill", amount: -62.30, method: "Bank Transfer" },
  { id: 25, date: "2026-02-16", category: "Shopping", type: "expense", description: "Home Depot Supplies", amount: -88.45, method: "Credit Card" },
  { id: 26, date: "2026-02-15", category: "Salary", type: "income", description: "Bi-weekly Salary", amount: 2250, method: "Bank Transfer" },
  { id: 27, date: "2026-02-15", category: "Groceries", type: "expense", description: "Safeway Groceries", amount: -63.90, method: "Credit Card" },
  { id: 28, date: "2026-02-14", category: "Entertainment", type: "expense", description: "Valentine's Dinner", amount: -120.00, method: "Credit Card" },
  { id: 29, date: "2026-02-14", category: "Shopping", type: "expense", description: "Gift Shop", amount: -45.00, method: "Cash" },
  { id: 30, date: "2026-02-13", category: "Utilities", type: "expense", description: "Phone Bill", amount: -55.00, method: "Bank Transfer" },
  { id: 31, date: "2026-02-13", category: "Healthcare", type: "expense", description: "Dental Checkup", amount: -75.00, method: "Debit Card" },
  { id: 32, date: "2026-02-12", category: "Groceries", type: "expense", description: "Sprouts Market", amount: -59.44, method: "Credit Card" },
  { id: 33, date: "2026-02-12", category: "Entertainment", type: "expense", description: "YouTube Premium", amount: -13.99, method: "Credit Card" },
  { id: 34, date: "2026-02-11", category: "Shopping", type: "expense", description: "Zara Clothing", amount: -112.50, method: "Credit Card" },
  { id: 35, date: "2026-02-11", category: "Freelance", type: "income", description: "Design Project", amount: 650, method: "Bank Transfer" },
  { id: 36, date: "2026-02-10", category: "Groceries", type: "expense", description: "Whole Foods Market", amount: -91.25, method: "Credit Card" },
  { id: 37, date: "2026-02-10", category: "Utilities", type: "expense", description: "Electricity Bill", amount: -110.00, method: "Bank Transfer" },
  { id: 38, date: "2026-02-09", category: "Entertainment", type: "expense", description: "Bowling Night", amount: -38.00, method: "Debit Card" },
  { id: 39, date: "2026-02-09", category: "Healthcare", type: "expense", description: "Eye Exam", amount: -50.00, method: "Credit Card" },
  { id: 40, date: "2026-02-08", category: "Shopping", type: "expense", description: "IKEA Furniture", amount: -199.99, method: "Credit Card" },
  { id: 41, date: "2026-02-08", category: "Groceries", type: "expense", description: "Trader Joe's", amount: -55.80, method: "Debit Card" },
  { id: 42, date: "2026-02-07", category: "Utilities", type: "expense", description: "Trash Collection", amount: -25.00, method: "Bank Transfer" },
  { id: 43, date: "2026-02-07", category: "Entertainment", type: "expense", description: "Book Purchase", amount: -18.99, method: "Credit Card" },
  { id: 44, date: "2026-02-06", category: "Shopping", type: "expense", description: "Pet Supplies", amount: -67.30, method: "Debit Card" },
  { id: 45, date: "2026-02-06", category: "Groceries", type: "expense", description: "Costco Groceries", amount: -145.60, method: "Credit Card" },
  { id: 46, date: "2026-02-05", category: "Healthcare", type: "expense", description: "Prescription Refill", amount: -22.00, method: "Cash" },
  { id: 47, date: "2026-02-05", category: "Freelance", type: "income", description: "Website Maintenance", amount: 400, method: "Bank Transfer" },
  { id: 48, date: "2026-02-04", category: "Groceries", type: "expense", description: "Walmart Groceries", amount: -78.33, method: "Debit Card" },
  { id: 49, date: "2026-02-04", category: "Entertainment", type: "expense", description: "Game Purchase", amount: -59.99, method: "Credit Card" },
  { id: 50, date: "2026-02-03", category: "Shopping", type: "expense", description: "Amazon Prime Day", amount: -156.78, method: "Credit Card" },
  { id: 51, date: "2026-02-03", category: "Utilities", type: "expense", description: "Streaming Bundle", amount: -29.99, method: "Credit Card" },
  { id: 52, date: "2026-02-02", category: "Groceries", type: "expense", description: "Local Farmers Market", amount: -42.00, method: "Cash" },
  { id: 53, date: "2026-02-02", category: "Healthcare", type: "expense", description: "Gym Membership", amount: -49.99, method: "Bank Transfer" },
  { id: 54, date: "2026-02-01", category: "Salary", type: "income", description: "Monthly Salary", amount: 4500, method: "Bank Transfer" },
  { id: 55, date: "2026-02-01", category: "Utilities", type: "expense", description: "Rent Payment", amount: -1500.00, method: "Bank Transfer" },
  { id: 56, date: "2026-02-01", category: "Shopping", type: "expense", description: "Office Supplies", amount: -34.50, method: "Debit Card" },
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
