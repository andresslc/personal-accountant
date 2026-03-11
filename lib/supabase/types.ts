export type CategoryType = 'income' | 'expense' | 'both'
export type TransactionType = 'income' | 'expense' | 'debt-payment'
export type LiabilityType = 'credit-card' | 'car' | 'student' | 'personal' | 'mortgage'
export type PaymentMethod = 'Credit Card' | 'Bank Transfer' | 'Cash' | 'Debit Card'
export type SubscriptionFrequency = 'Weekly' | 'Monthly' | 'Yearly'

export interface Category {
  id: string
  user_id: string | null
  name: string
  type: CategoryType
  created_at: string
}

export interface Liability {
  id: number
  user_id: string
  name: string
  type: LiabilityType
  current_balance: number
  original_balance: number
  min_payment: number
  apr: number
  due_day: number | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: number
  user_id: string
  date: string
  description: string
  amount: number
  type: TransactionType
  category_id: string | null
  method: PaymentMethod | null
  liability_id: number | null
  created_at: string
  updated_at: string
}

export interface BudgetItem {
  id: number
  user_id: string
  category_id: string
  budget_limit: number
  recurring: boolean
  month_year: string // ISO date (first of month): '2024-01-01'
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: number
  user_id: string
  name: string
  amount: number
  frequency: SubscriptionFrequency
  next_due_date: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface UserFinancialMemory {
  user_id: string
  memory: Record<string, unknown>
  updated_at: string
}

// View types (read-only, computed server-side)
export interface MonthlySummary {
  user_id: string
  month: string
  total_income: number
  total_expenses: number
  savings: number
}

export interface BudgetWithSpending extends BudgetItem {
  category_name: string
  spent: number
  remaining: number
}

// Database type map for the Supabase client generic
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: Omit<Category, 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      liabilities: {
        Row: Liability
        Insert: Omit<Liability, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Liability, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      transactions: {
        Row: Transaction
        Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      budget_items: {
        Row: BudgetItem
        Insert: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BudgetItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      user_financial_memory: {
        Row: UserFinancialMemory
        Insert: Omit<UserFinancialMemory, 'updated_at'>
        Update: Partial<Omit<UserFinancialMemory, 'user_id' | 'updated_at'>>
      }
    }
    Views: {
      monthly_summary: {
        Row: MonthlySummary
      }
      budget_with_spending: {
        Row: BudgetWithSpending
      }
    }
  }
}
