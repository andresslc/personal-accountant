import { Car, CreditCard, Film, Home, ShoppingCart, Utensils, Zap } from 'lucide-react'
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

const NET_INCOME = 7_800_000

const transactions = generateTransactions({
  seed: 'over-leveraged-aspirational-v1',
  netMonthlyIncomeCOP: NET_INCOME,
  incomeStream: 'salary',
  incomeSources: [
    { label: 'Salario Multinacional', category: 'Salary', share: 1 },
  ],
  primaMonths: [5, 11],
  fixedMonthly: [
    { category: 'Administración', description: 'Administración Conjunto', amountCOP: 420_000, day: 5, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'EPM — Energía + Agua', amountCOP: 340_000, day: 8, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'Claro Fijo — Internet', amountCOP: 130_000, day: 10, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'Claro Móvil', amountCOP: 95_000, day: 14, method: 'Bank Transfer' },
    { category: 'Insurance', description: 'SOAT + Todo Riesgo Allianz', amountCOP: 280_000, day: 20, method: 'Bank Transfer' },
  ],
  debtPayments: [
    { liabilityName: 'Hipoteca Davivienda', category: 'Debt Payment', amountCOP: 3_000_000, day: 2, method: 'Bank Transfer' },
    { liabilityName: 'Crédito Vehículo', category: 'Debt Payment', amountCOP: 1_240_000, day: 10, method: 'Bank Transfer' },
    { liabilityName: 'Libre Inversión', category: 'Debt Payment', amountCOP: 770_000, day: 15, method: 'Bank Transfer' },
    { liabilityName: 'Tarjeta Bancolombia', category: 'Debt Payment', amountCOP: 420_000, day: 22, method: 'Bank Transfer' },
    { liabilityName: 'Tarjeta Scotiabank', category: 'Debt Payment', amountCOP: 280_000, day: 27, method: 'Bank Transfer' },
  ],
  categoryPlan: [
    {
      category: 'Groceries',
      share: 0.08,
      merchants: MERCHANTS.groceries,
      frequency: 'biweekly',
      paymentMethods: ['Credit Card'],
    },
    {
      category: 'Restaurants',
      share: 0.04,
      merchants: MERCHANTS.diningOut,
      frequency: 'weekly',
      paymentMethods: ['Credit Card'],
    },
    {
      category: 'Transportation',
      share: 0.05,
      merchants: MERCHANTS.transport,
      frequency: 'weekly',
      paymentMethods: ['Credit Card', 'Debit Card'],
    },
    {
      category: 'Entertainment',
      share: 0.03,
      merchants: MERCHANTS.entertainment,
      frequency: 'monthly',
      paymentMethods: ['Credit Card'],
    },
    {
      category: 'Shopping',
      share: 0.04,
      merchants: MERCHANTS.shopping,
      frequency: 'biweekly',
      paymentMethods: ['Credit Card'],
    },
  ],
})

const liabilities: ClientArchetype['liabilities'] = [
  {
    id: 1,
    name: 'Hipoteca Davivienda',
    type: 'mortgage',
    currentBalance: 245_000_000,
    originalBalance: 260_000_000,
    minPayment: 3_000_000,
    apr: 12.0,
    dueDay: 2,
    icon: Home,
  },
  {
    id: 2,
    name: 'Crédito Vehículo Bancolombia',
    type: 'car',
    currentBalance: 42_000_000,
    originalBalance: 55_000_000,
    minPayment: 1_240_000,
    apr: 17.0,
    dueDay: 10,
    icon: Car,
  },
  {
    id: 3,
    name: 'Libre Inversión BBVA',
    type: 'personal',
    currentBalance: 17_500_000,
    originalBalance: 22_000_000,
    minPayment: 770_000,
    apr: 22.0,
    dueDay: 15,
    icon: CreditCard,
  },
  {
    id: 4,
    name: 'Tarjeta Bancolombia Platinum',
    type: 'credit-card',
    currentBalance: 4_200_000,
    originalBalance: 5_000_000,
    minPayment: 420_000,
    apr: 25.5,
    dueDay: 22,
    icon: CreditCard,
  },
  {
    id: 5,
    name: 'Tarjeta Scotiabank Amex',
    type: 'credit-card',
    currentBalance: 2_800_000,
    originalBalance: 3_500_000,
    minPayment: 280_000,
    apr: 25.5,
    dueDay: 27,
    icon: CreditCard,
  },
]

const monthlyFlow = computeMonthlyFlow(transactions)
const expensesByCategory = computeExpensesByCategory(transactions)
const topSpending = computeTopSpending(expensesByCategory)
const netWorth = computeNetWorth(monthlyFlow, 45_000_000, liabilities.reduce((s, l) => s + l.currentBalance, 0))
const payoffTimeline = computePayoffTimeline(liabilities)

const summary = computeSummary(
  transactions,
  liabilities,
  {
    debtChange: -1.1,
    incomeChange: 2.4,
    expensesChange: 1.1,
    savingsChange: -8.6,
  },
  45_000_000
)

export const overLeveragedAspirational: ClientArchetype = {
  id: 'over-leveraged-aspirational',
  displayName: 'The Over-Leveraged Aspirational',
  displayNameEs: 'Aspiracional Sobreendeudado',
  description:
    'Solid salary, but mortgage + car loan + personal loan + two active revolving cards push debt service past 75% of net income. One surprise expense from the edge. FinFlow should flag DTI and push compra-de-cartera.',
  descriptionEs:
    'Buen salario, pero hipoteca + vehículo + libre inversión + dos tarjetas rotativas empujan el servicio de deuda por encima del 75% del neto. Un imprevisto lo saca del equilibrio. FinFlow debe alertar DTI y sugerir compra de cartera.',
  demoUsername: 'leveraged@demo.finflow',
  demoPassword: 'DemoLeveraged!2026',
  profile: {
    estrato: '5',
    grossMonthlyIncomeCOP: 10_000_000,
    netMonthlyIncomeCOP: NET_INCOME,
    city: 'Bogotá',
    occupation: 'Mid-level manager at a multinational',
    occupationEs: 'Gerente medio en multinacional',
    householdSize: 2,
  },
  tags: ['over-leveraged', 'high-dti', 'mortgage-holder', 'revolving-debt'],
  transactions,
  budgets: [
    { id: 1, category: 'Groceries', limit: 700_000, spent: 680_000, icon: Utensils, recurring: true },
    { id: 2, category: 'Vivienda', limit: 3_420_000, spent: 3_420_000, icon: Home, recurring: true },
    { id: 3, category: 'Utilities', limit: 600_000, spent: 565_000, icon: Zap, recurring: true },
    { id: 4, category: 'Entertainment', limit: 250_000, spent: 310_000, icon: Film, recurring: false },
    { id: 5, category: 'Shopping', limit: 350_000, spent: 410_000, icon: ShoppingCart, recurring: false },
  ],
  liabilities,
  subscriptions: [
    { name: 'Netflix Premium', amount: 44_900, frequency: 'Monthly' },
    { name: 'Spotify Familiar', amount: 25_900, frequency: 'Monthly' },
    { name: 'Disney+', amount: 32_000, frequency: 'Monthly' },
    { name: 'Rappi Prime', amount: 12_900, frequency: 'Monthly' },
    { name: 'iCloud 2TB', amount: 45_000, frequency: 'Monthly' },
  ],
  summary,
  summaryCards: buildSummaryCards(summary, (v) => formatCurrency(v, 'COP')),
  monthlyFlow,
  expensesByCategory,
  netWorth,
  topSpending,
  payoffTimeline,
}
