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

export interface ChatSummary {
  id: number
  user_id: string
  summary: string
  topics: string[]
  actions_taken: Array<Record<string, unknown>>
  message_count: number
  created_at: string
}

export interface ChatMessageRow {
  id: number
  user_id: string
  role: 'user' | 'assistant'
  content: string
  action: Record<string, unknown> | null
  transcription: string | null
  created_at: string
}

export interface ChatStateRow {
  user_id: string
  cleared_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  currency: 'COP' | 'USD'
  created_at: string
  updated_at: string
}

// Database type map for the Supabase client generic
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: Omit<Category, 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
        Relationships: []
      }
      liabilities: {
        Row: Liability
        Insert: Omit<Liability, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Liability, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      transactions: {
        Row: Transaction
        Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      budget_items: {
        Row: BudgetItem
        Insert: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BudgetItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      user_financial_memory: {
        Row: UserFinancialMemory
        Insert: Omit<UserFinancialMemory, 'updated_at'>
        Update: Partial<Omit<UserFinancialMemory, 'user_id' | 'updated_at'>>
        Relationships: []
      }
      chat_summaries: {
        Row: ChatSummary
        Insert: Omit<ChatSummary, 'id' | 'created_at'>
        Update: Partial<Omit<ChatSummary, 'id' | 'user_id' | 'created_at'>>
        Relationships: []
      }
      chat_messages: {
        Row: ChatMessageRow
        Insert: Omit<ChatMessageRow, 'id' | 'created_at'>
        Update: Partial<Omit<ChatMessageRow, 'id' | 'user_id' | 'created_at'>>
        Relationships: []
      }
      chat_state: {
        Row: ChatStateRow
        Insert: Omit<ChatStateRow, 'updated_at'> & { cleared_at?: string }
        Update: Partial<Omit<ChatStateRow, 'user_id' | 'updated_at'>>
        Relationships: []
      }
      user_preferences: {
        Row: UserPreferences
        Insert: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
        Relationships: []
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
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
