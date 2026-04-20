import type {
  BudgetItem,
  CategoryExpense,
  Liability,
  MonthlyData,
  NetWorthPoint,
  PayoffTimelinePoint,
  SpendingRank,
  Subscription,
  SummaryCard,
  Transaction,
} from '@/lib/mocks'

export type ArchetypeTag =
  | 'high-saver'
  | 'low-debt'
  | 'revolving-debt'
  | 'usury-risk'
  | 'bnpl-user'
  | 'over-leveraged'
  | 'high-dti'
  | 'gig-income'
  | 'irregular-cashflow'
  | 'student-loan'
  | 'credit-building'
  | 'family-provider'
  | 'mortgage-holder'
  | 'stressed'
  | 'stable'
  | 'young-professional'

export interface ArchetypeProfileMetadata {
  estrato: string
  grossMonthlyIncomeCOP: number
  netMonthlyIncomeCOP: number
  city: 'Bogotá' | 'Medellín' | 'Cali' | 'Barranquilla' | 'Bucaramanga'
  occupation: string
  occupationEs: string
  householdSize: number
}

export interface ArchetypeSummary {
  totalDebt: number
  income: number
  expenses: number
  savings: number
  debtChange: number
  incomeChange: number
  expensesChange: number
  savingsChange: number
}

export interface ClientArchetype {
  id: string
  displayName: string
  displayNameEs: string
  description: string
  descriptionEs: string
  demoUsername: string
  demoPassword: string
  profile: ArchetypeProfileMetadata
  tags: ArchetypeTag[]
  transactions: Transaction[]
  budgets: BudgetItem[]
  liabilities: Liability[]
  subscriptions: Subscription[]
  summary: ArchetypeSummary
  summaryCards: SummaryCard[]
  monthlyFlow: MonthlyData[]
  expensesByCategory: CategoryExpense[]
  netWorth: NetWorthPoint[]
  topSpending: SpendingRank[]
  payoffTimeline: PayoffTimelinePoint[]
}

export type ArchetypeSeed = {
  id: string
  displayName: string
  displayNameEs: string
  description: string
  descriptionEs: string
  demoUsername: string
  demoPassword: string
  profile: ArchetypeProfileMetadata
  tags: ArchetypeTag[]
  budgets: BudgetItem[]
  liabilities: Liability[]
  subscriptions: Subscription[]
  startingNetWorth: number
  summaryChanges: Pick<
    ArchetypeSummary,
    'debtChange' | 'incomeChange' | 'expensesChange' | 'savingsChange'
  >
}
