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

const NET_INCOME = 3_900_000

const transactions = generateTransactions({
  seed: 'chronic-late-payer-v1',
  netMonthlyIncomeCOP: NET_INCOME,
  incomeStream: 'salary',
  incomeSources: [
    { label: 'Nómina', category: 'Salary', share: 1 },
  ],
  primaMonths: [5, 11],
  fixedMonthly: [
    { category: 'Vivienda', description: 'Arriendo Apartaestudio', amountCOP: 1_150_000, day: 3, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'Codensa — Energía', amountCOP: 180_000, day: 10, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'ETB Internet', amountCOP: 85_000, day: 15, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'Tigo Móvil', amountCOP: 55_000, day: 18, method: 'Bank Transfer' },
  ],
  debtPayments: [
    { liabilityName: 'Tarjeta Tuya Éxito', category: 'Debt Payment', amountCOP: 195_000, day: 22, method: 'Bank Transfer' },
    { liabilityName: 'Tarjeta Nu Colombia', category: 'Debt Payment', amountCOP: 160_000, day: 27, method: 'Bank Transfer' },
    { liabilityName: 'Addi BNPL', category: 'Debt Payment', amountCOP: 120_000, day: 5, method: 'Bank Transfer' },
    { liabilityName: 'Sistecrédito', category: 'Debt Payment', amountCOP: 95_000, day: 12, method: 'Bank Transfer' },
  ],
  latePaymentFrequency: 0.7,
  categoryPlan: [
    {
      category: 'Groceries',
      share: 0.14,
      merchants: MERCHANTS.groceries,
      frequency: 'weekly',
      paymentMethods: ['Credit Card', 'Debit Card'],
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
      share: 0.07,
      merchants: MERCHANTS.transport,
      frequency: 'weekly',
      paymentMethods: ['Debit Card', 'Cash'],
    },
    {
      category: 'Shopping',
      share: 0.06,
      merchants: MERCHANTS.shopping,
      frequency: 'biweekly',
      paymentMethods: ['Credit Card'],
    },
    {
      category: 'Entertainment',
      share: 0.04,
      merchants: MERCHANTS.entertainment,
      frequency: 'monthly',
      paymentMethods: ['Credit Card'],
    },
  ],
})

const liabilities: ClientArchetype['liabilities'] = [
  {
    id: 1,
    name: 'Tarjeta Tuya Éxito',
    type: 'credit-card',
    currentBalance: 5_800_000,
    originalBalance: 6_000_000,
    minPayment: 195_000,
    apr: 25.8,
    dueDay: 22,
    icon: CreditCard,
  },
  {
    id: 2,
    name: 'Tarjeta Nu Colombia',
    type: 'credit-card',
    currentBalance: 3_400_000,
    originalBalance: 3_800_000,
    minPayment: 160_000,
    apr: 24.5,
    dueDay: 27,
    icon: CreditCard,
  },
  {
    id: 3,
    name: 'Addi BNPL — Electrodoméstico',
    type: 'personal',
    currentBalance: 1_400_000,
    originalBalance: 2_200_000,
    minPayment: 120_000,
    apr: 22.0,
    dueDay: 5,
    icon: CreditCard,
  },
  {
    id: 4,
    name: 'Sistecrédito — Muebles',
    type: 'personal',
    currentBalance: 900_000,
    originalBalance: 1_800_000,
    minPayment: 95_000,
    apr: 20.0,
    dueDay: 12,
    icon: CreditCard,
  },
]

const monthlyFlow = computeMonthlyFlow(transactions)
const expensesByCategory = computeExpensesByCategory(transactions)
const topSpending = computeTopSpending(expensesByCategory)
const netWorth = computeNetWorth(monthlyFlow, 2_500_000, liabilities.reduce((s, l) => s + l.currentBalance, 0))
const payoffTimeline = computePayoffTimeline(liabilities)

const summary = computeSummary(
  transactions,
  liabilities,
  {
    balanceChange: -4.2,
    incomeChange: 0.8,
    expensesChange: 5.3,
    savingsChange: -22.1,
  },
  2_500_000
)

export const chronicLatePayer: ClientArchetype = {
  id: 'chronic-late-payer',
  displayName: 'The Chronic Late-Payer',
  displayNameEs: 'Pagador Crónicamente Tardío',
  description:
    'Mid-career salary that disappears into revolving card balances near the usury rate. Makes minimum payments only, two BNPL lines in arrears, recurring late-payment fees. FinFlow should nudge debt-avalanche and autopay.',
  descriptionEs:
    'Salario de media carrera que se diluye en saldos rotativos cerca de la tasa de usura. Solo paga mínimos, dos BNPL en mora, intereses moratorios recurrentes. FinFlow debería sugerir avalancha de deuda y pagos automáticos.',
  demoUsername: 'tardy@demo.finflow',
  demoPassword: 'DemoTardy!2026',
  profile: {
    estrato: '3',
    grossMonthlyIncomeCOP: 5_000_000,
    netMonthlyIncomeCOP: NET_INCOME,
    city: 'Bogotá',
    occupation: 'Call-center team lead',
    occupationEs: 'Líder de equipo en call-center',
    householdSize: 2,
  },
  tags: ['revolving-debt', 'usury-risk', 'bnpl-user', 'stressed'],
  transactions,
  budgets: [
    { id: 1, category: 'Groceries', limit: 550_000, spent: 620_000, icon: Utensils, recurring: true },
    { id: 2, category: 'Vivienda', limit: 1_150_000, spent: 1_150_000, icon: Home, recurring: true },
    { id: 3, category: 'Utilities', limit: 350_000, spent: 320_000, icon: Zap, recurring: true },
    { id: 4, category: 'Shopping', limit: 150_000, spent: 290_000, icon: ShoppingCart, recurring: false },
    { id: 5, category: 'Entertainment', limit: 120_000, spent: 180_000, icon: Film, recurring: false },
  ],
  liabilities,
  subscriptions: [
    { name: 'Netflix Básico', amount: 18_500, frequency: 'Monthly' },
    { name: 'Disney+', amount: 32_000, frequency: 'Monthly' },
    { name: 'Rappi Prime', amount: 12_900, frequency: 'Monthly' },
    { name: 'HBO Max', amount: 23_900, frequency: 'Monthly' },
  ],
  summary,
  summaryCards: buildSummaryCards(summary, (v) => formatCurrency(v, 'COP')),
  monthlyFlow,
  expensesByCategory,
  netWorth,
  topSpending,
  payoffTimeline,
}
