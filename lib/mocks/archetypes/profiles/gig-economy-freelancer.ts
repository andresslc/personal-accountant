import { Briefcase, Film, Home, Pill, ShoppingCart, Utensils, Zap } from 'lucide-react'
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

const NET_INCOME = 5_200_000

const transactions = generateTransactions({
  seed: 'gig-economy-freelancer-v1',
  netMonthlyIncomeCOP: NET_INCOME,
  incomeStream: 'gig',
  incomeVariance: 0.45,
  incomeSources: [
    { label: 'Freelance — Cliente USA', category: 'Freelance', share: 0.55 },
    { label: 'Rappi — Pago Repartidor', category: 'Gig', share: 0.25 },
    { label: 'Fiverr Payout', category: 'Freelance', share: 0.2 },
  ],
  fixedMonthly: [
    { category: 'Vivienda', description: 'Arriendo Coworking + Habitación', amountCOP: 1_400_000, day: 5, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'Tigo Fijo — Internet', amountCOP: 95_000, day: 12, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'Movistar Móvil', amountCOP: 60_000, day: 14, method: 'Bank Transfer' },
  ],
  categoryPlan: [
    {
      category: 'Groceries',
      share: 0.09,
      merchants: MERCHANTS.groceries,
      frequency: 'weekly',
      paymentMethods: ['Debit Card', 'Credit Card'],
    },
    {
      category: 'Restaurants',
      share: 0.09,
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
      frequency: 'biweekly',
      paymentMethods: ['Credit Card'],
    },
    {
      category: 'Tech Tools',
      share: 0.03,
      merchants: ['Adobe Creative', 'Figma', 'Notion Plus', 'GitHub Copilot', 'AWS'],
      frequency: 'monthly',
      paymentMethods: ['Credit Card'],
    },
  ],
})

const liabilities: ClientArchetype['liabilities'] = []

const monthlyFlow = computeMonthlyFlow(transactions)
const expensesByCategory = computeExpensesByCategory(transactions)
const topSpending = computeTopSpending(expensesByCategory)
const netWorth = computeNetWorth(monthlyFlow, 6_500_000, 0)
const payoffTimeline = computePayoffTimeline(liabilities)

const summary = computeSummary(
  transactions,
  liabilities,
  {
    balanceChange: 2.3,
    incomeChange: -11.8,
    expensesChange: -3.7,
    savingsChange: -18.4,
  },
  6_500_000
)

export const gigEconomyFreelancer: ClientArchetype = {
  id: 'gig-economy-freelancer',
  displayName: 'The Gig-Economy Freelancer',
  displayNameEs: 'Freelancer Economía Gig',
  description:
    'Irregular monthly income between 3M and 9M COP from Rappi, freelance, and Fiverr. No prima, no libranza, lumpy savings. FinFlow should smooth income for planning and push a one-month buffer.',
  descriptionEs:
    'Ingreso mensual variable entre 3M y 9M COP entre Rappi, freelance y Fiverr. Sin prima, sin libranza, ahorro irregular. FinFlow debe suavizar el ingreso para la planeación y sugerir un colchón de un mes.',
  demoUsername: 'gig@demo.finflow',
  demoPassword: 'DemoGig!2026',
  profile: {
    estrato: '3',
    grossMonthlyIncomeCOP: 6_000_000,
    netMonthlyIncomeCOP: NET_INCOME,
    city: 'Medellín',
    occupation: 'Freelance designer + Rappi driver',
    occupationEs: 'Diseñador freelance + repartidor Rappi',
    householdSize: 1,
  },
  tags: ['gig-income', 'irregular-cashflow', 'low-debt', 'young-professional'],
  transactions,
  budgets: [
    { id: 1, category: 'Groceries', limit: 500_000, spent: 480_000, icon: Utensils, recurring: true },
    { id: 2, category: 'Vivienda', limit: 1_400_000, spent: 1_400_000, icon: Home, recurring: true },
    { id: 3, category: 'Utilities', limit: 180_000, spent: 155_000, icon: Zap, recurring: true },
    { id: 4, category: 'Entertainment', limit: 220_000, spent: 205_000, icon: Film, recurring: false },
    { id: 5, category: 'Shopping', limit: 160_000, spent: 140_000, icon: ShoppingCart, recurring: false },
    { id: 6, category: 'Healthcare', limit: 180_000, spent: 90_000, icon: Pill, recurring: false },
  ],
  liabilities,
  subscriptions: [
    { name: 'Spotify Individual', amount: 16_900, frequency: 'Monthly' },
    { name: 'Adobe Creative Cloud', amount: 82_900, frequency: 'Monthly' },
    { name: 'Figma Pro', amount: 54_000, frequency: 'Monthly' },
    { name: 'Notion Plus', amount: 38_000, frequency: 'Monthly' },
  ],
  summary,
  summaryCards: buildSummaryCards(summary, (v) => formatCurrency(v, 'COP')),
  monthlyFlow,
  expensesByCategory,
  netWorth,
  topSpending,
  payoffTimeline,
}

void Briefcase
