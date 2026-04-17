import { CreditCard, Film, Home, ShoppingCart, Utensils, Zap } from 'lucide-react'
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

const NET_INCOME = 2_500_000

const transactions = generateTransactions({
  seed: 'young-professional-v1',
  netMonthlyIncomeCOP: NET_INCOME,
  incomeStream: 'salary',
  incomeSources: [
    { label: 'Salario Entry-Level', category: 'Salary', share: 1 },
  ],
  primaMonths: [5, 11],
  fixedMonthly: [
    { category: 'Vivienda', description: 'Arriendo Habitación Compartida', amountCOP: 700_000, day: 3, method: 'Bank Transfer' },
    { category: 'Education', description: 'ICETEX — Cuota Mensual', amountCOP: 240_000, day: 10, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'Claro Fijo — Internet', amountCOP: 55_000, day: 12, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'Tigo Móvil Plan', amountCOP: 42_000, day: 15, method: 'Bank Transfer' },
  ],
  debtPayments: [
    { liabilityName: 'Tarjeta Nu Colombia', category: 'Debt Payment', amountCOP: 120_000, day: 25, method: 'Bank Transfer' },
    { liabilityName: 'RappiCard', category: 'Debt Payment', amountCOP: 85_000, day: 18, method: 'Bank Transfer' },
  ],
  savingsContribution: {
    amountCOP: 120_000,
    description: 'Nu — Cajita de Ahorro',
    day: 20,
  },
  categoryPlan: [
    {
      category: 'Groceries',
      share: 0.10,
      merchants: MERCHANTS.groceries,
      frequency: 'biweekly',
      paymentMethods: ['Debit Card'],
    },
    {
      category: 'Restaurants',
      share: 0.08,
      merchants: MERCHANTS.diningOut,
      frequency: 'weekly',
      paymentMethods: ['Credit Card'],
    },
    {
      category: 'Transportation',
      share: 0.08,
      merchants: MERCHANTS.transport,
      frequency: 'weekly',
      paymentMethods: ['Debit Card', 'Cash'],
    },
    {
      category: 'Entertainment',
      share: 0.05,
      merchants: MERCHANTS.entertainment,
      frequency: 'monthly',
      paymentMethods: ['Credit Card'],
    },
    {
      category: 'Shopping',
      share: 0.04,
      merchants: MERCHANTS.shopping,
      frequency: 'monthly',
      paymentMethods: ['Credit Card'],
    },
  ],
})

const liabilities: ClientArchetype['liabilities'] = [
  {
    id: 1,
    name: 'Crédito ICETEX',
    type: 'student',
    currentBalance: 14_200_000,
    originalBalance: 18_000_000,
    minPayment: 240_000,
    apr: 9.5,
    dueDay: 10,
    icon: CreditCard,
  },
  {
    id: 2,
    name: 'Tarjeta Nu Colombia',
    type: 'credit-card',
    currentBalance: 1_300_000,
    originalBalance: 1_500_000,
    minPayment: 120_000,
    apr: 24.0,
    dueDay: 25,
    icon: CreditCard,
  },
  {
    id: 3,
    name: 'RappiCard',
    type: 'credit-card',
    currentBalance: 780_000,
    originalBalance: 1_000_000,
    minPayment: 85_000,
    apr: 24.0,
    dueDay: 18,
    icon: CreditCard,
  },
]

const monthlyFlow = computeMonthlyFlow(transactions)
const expensesByCategory = computeExpensesByCategory(transactions)
const topSpending = computeTopSpending(expensesByCategory)
const netWorth = computeNetWorth(monthlyFlow, 1_200_000, liabilities.reduce((s, l) => s + l.currentBalance, 0))
const payoffTimeline = computePayoffTimeline(liabilities)

const summary = computeSummary(
  transactions,
  liabilities,
  {
    balanceChange: 1.4,
    incomeChange: 4.6,
    expensesChange: 2.8,
    savingsChange: 5.5,
  },
  1_200_000
)

export const youngProfessional: ClientArchetype = {
  id: 'young-professional',
  displayName: 'The Young Professional',
  displayNameEs: 'Profesional Recién Egresado',
  description:
    'Early-career salary with ICETEX student loan still outstanding. Building credit with Nu Colombia and RappiCard. Thin savings, thin margin, but growing. FinFlow should push auto-savings and a term plan for ICETEX.',
  descriptionEs:
    'Salario de inicio de carrera con crédito ICETEX vigente. Construyendo historial con Nu Colombia y RappiCard. Ahorro mínimo pero creciente. FinFlow debería activar ahorro automático y plan a término para ICETEX.',
  demoUsername: 'young@demo.finflow',
  demoPassword: 'DemoYoung!2026',
  profile: {
    estrato: '3',
    grossMonthlyIncomeCOP: 3_000_000,
    netMonthlyIncomeCOP: NET_INCOME,
    city: 'Bucaramanga',
    occupation: 'Junior analyst',
    occupationEs: 'Analista junior',
    householdSize: 1,
  },
  tags: ['student-loan', 'credit-building', 'young-professional'],
  transactions,
  budgets: [
    { id: 1, category: 'Groceries', limit: 280_000, spent: 250_000, icon: Utensils, recurring: true },
    { id: 2, category: 'Vivienda', limit: 700_000, spent: 700_000, icon: Home, recurring: true },
    { id: 3, category: 'Utilities', limit: 120_000, spent: 97_000, icon: Zap, recurring: true },
    { id: 4, category: 'Restaurants', limit: 180_000, spent: 210_000, icon: Utensils, recurring: false },
    { id: 5, category: 'Entertainment', limit: 120_000, spent: 125_000, icon: Film, recurring: false },
    { id: 6, category: 'Shopping', limit: 110_000, spent: 95_000, icon: ShoppingCart, recurring: false },
  ],
  liabilities,
  subscriptions: [
    { name: 'Spotify Estudiante', amount: 8_900, frequency: 'Monthly' },
    { name: 'Netflix Básico', amount: 18_500, frequency: 'Monthly' },
    { name: 'Rappi Prime', amount: 12_900, frequency: 'Monthly' },
  ],
  summary,
  summaryCards: buildSummaryCards(summary, (v) => formatCurrency(v, 'COP')),
  monthlyFlow,
  expensesByCategory,
  netWorth,
  topSpending,
  payoffTimeline,
}
