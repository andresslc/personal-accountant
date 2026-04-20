import { Briefcase, CreditCard, Film, Home, Pill, ShoppingCart, Utensils, Zap } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import {
  buildSummaryCards,
  computeExpensesByCategory,
  computeMonthlyFlow,
  computeNetWorth,
  computePayoffTimeline,
  computeSummary,
  computeTopSpending,
  generateTransactions,
  MERCHANTS,
} from '../generators'
import type { ClientArchetype } from '../types'

const NET_INCOME = 4_600_000

const transactions = generateTransactions({
  seed: 'disciplined-saver-v1',
  netMonthlyIncomeCOP: NET_INCOME,
  incomeStream: 'salary',
  incomeSources: [
    { label: 'Salario Empresa', category: 'Salary', share: 1 },
  ],
  primaMonths: [5, 11],
  fixedMonthly: [
    { category: 'Vivienda', description: 'Arriendo Apartamento', amountCOP: 1_250_000, day: 1, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'EPM — Energía + Agua', amountCOP: 210_000, day: 8, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'Claro Fijo — Internet', amountCOP: 95_000, day: 12, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'Movistar Móvil', amountCOP: 65_000, day: 14, method: 'Bank Transfer' },
  ],
  savingsContribution: {
    amountCOP: 900_000,
    description: 'CDT Bancolombia — Aporte Mensual',
    day: 16,
  },
  categoryPlan: [
    {
      category: 'Groceries',
      share: 0.12,
      merchants: MERCHANTS.groceries,
      frequency: 'biweekly',
      paymentMethods: ['Debit Card', 'Credit Card'],
    },
    {
      category: 'Transportation',
      share: 0.06,
      merchants: MERCHANTS.transport,
      frequency: 'weekly',
      paymentMethods: ['Debit Card', 'Cash'],
    },
    {
      category: 'Healthcare',
      share: 0.03,
      merchants: MERCHANTS.healthcare,
      frequency: 'monthly',
      paymentMethods: ['Debit Card'],
    },
    {
      category: 'Entertainment',
      share: 0.04,
      merchants: MERCHANTS.entertainment,
      frequency: 'monthly',
      paymentMethods: ['Credit Card'],
    },
    {
      category: 'Shopping',
      share: 0.03,
      merchants: MERCHANTS.shopping,
      frequency: 'monthly',
      paymentMethods: ['Credit Card', 'Debit Card'],
    },
  ],
})

const liabilities: ClientArchetype['liabilities'] = []

const monthlyFlow = computeMonthlyFlow(transactions)
const expensesByCategory = computeExpensesByCategory(transactions)
const topSpending = computeTopSpending(expensesByCategory)
const netWorth = computeNetWorth(monthlyFlow, 18_000_000, 0)
const payoffTimeline = computePayoffTimeline(liabilities)

const summary = computeSummary(
  transactions,
  liabilities,
  {
    debtChange: 0,
    incomeChange: 3.1,
    expensesChange: -1.8,
    savingsChange: 12.2,
  },
  18_000_000
)

export const disciplinedSaver: ClientArchetype = {
  id: 'disciplined-saver',
  displayName: 'The Disciplined Saver',
  displayNameEs: 'Ahorrador Disciplinado',
  description:
    'Stable corporate salary, 20%+ savings rate, zero revolving debt. Small CDT and USD stash via Nu Colombia. The "healthy baseline" FinFlow wants every user to reach.',
  descriptionEs:
    'Salario corporativo estable, tasa de ahorro >20%, cero saldo rotativo. CDT pequeño y dólares en Nu Colombia. El perfil "sano" que FinFlow quiere que todo usuario alcance.',
  demoUsername: 'saver@demo.finflow',
  demoPassword: 'DemoSaver!2026',
  profile: {
    estrato: '4',
    grossMonthlyIncomeCOP: 6_000_000,
    netMonthlyIncomeCOP: NET_INCOME,
    city: 'Medellín',
    occupation: 'Backend developer at a mid-size fintech',
    occupationEs: 'Desarrolladora backend en fintech mediana',
    householdSize: 1,
  },
  tags: ['high-saver', 'low-debt', 'stable'],
  transactions,
  budgets: [
    { id: 1, category: 'Groceries', limit: 650_000, spent: 540_000, icon: Utensils, recurring: true },
    { id: 2, category: 'Vivienda', limit: 1_250_000, spent: 1_250_000, icon: Home, recurring: true },
    { id: 3, category: 'Utilities', limit: 400_000, spent: 370_000, icon: Zap, recurring: true },
    { id: 4, category: 'Entertainment', limit: 200_000, spent: 150_000, icon: Film, recurring: false },
    { id: 5, category: 'Shopping', limit: 180_000, spent: 120_000, icon: ShoppingCart, recurring: false },
    { id: 6, category: 'Healthcare', limit: 150_000, spent: 120_000, icon: Pill, recurring: false },
  ],
  liabilities,
  subscriptions: [
    { name: 'Spotify Familiar', amount: 25_900, frequency: 'Monthly' },
    { name: 'Netflix Estándar', amount: 32_900, frequency: 'Monthly' },
    { name: 'iCloud 200GB', amount: 4_500, frequency: 'Monthly' },
  ],
  summary,
  summaryCards: buildSummaryCards(summary, (v) => formatCurrency(v, 'COP')),
  monthlyFlow,
  expensesByCategory,
  netWorth,
  topSpending,
  payoffTimeline,
}

// Silence lints for imported icons used only in budget metadata of other archetypes.
void Briefcase
void CreditCard
