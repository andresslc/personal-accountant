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

const NET_INCOME = 9_200_000

const transactions = generateTransactions({
  seed: 'family-provider-v1',
  netMonthlyIncomeCOP: NET_INCOME,
  incomeStream: 'salary',
  incomeSources: [
    { label: 'Salario Hogar (Titular)', category: 'Salary', share: 0.7 },
    { label: 'Salario Cónyuge', category: 'Salary', share: 0.3 },
  ],
  primaMonths: [5, 11],
  fixedMonthly: [
    { category: 'Administración', description: 'Administración Conjunto', amountCOP: 480_000, day: 5, method: 'Bank Transfer' },
    { category: 'Education', description: 'Pensión Colegio Privado', amountCOP: 1_250_000, day: 5, method: 'Bank Transfer' },
    { category: 'Healthcare', description: 'Medicina Prepagada Colsanitas', amountCOP: 620_000, day: 7, method: 'Bank Transfer' },
    { category: 'Insurance', description: 'Seguro de Vida Sura', amountCOP: 185_000, day: 12, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'EPM — Energía + Agua', amountCOP: 360_000, day: 8, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'Gas Natural Vanti', amountCOP: 55_000, day: 10, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'Claro Fijo — Internet + TV', amountCOP: 145_000, day: 12, method: 'Bank Transfer' },
    { category: 'Utilities', description: 'Claro Móvil Familiar', amountCOP: 180_000, day: 14, method: 'Bank Transfer' },
    { category: 'Kids', description: 'Ruta Escolar', amountCOP: 320_000, day: 5, method: 'Bank Transfer' },
  ],
  debtPayments: [
    { liabilityName: 'Hipoteca Bancolombia', category: 'Debt Payment', amountCOP: 2_400_000, day: 2, method: 'Bank Transfer' },
    { liabilityName: 'Tarjeta Bancolombia Gold', category: 'Debt Payment', amountCOP: 380_000, day: 22, method: 'Bank Transfer' },
  ],
  savingsContribution: {
    amountCOP: 500_000,
    description: 'CDT Davivienda — Fondo Universitario',
    day: 20,
  },
  categoryPlan: [
    {
      category: 'Groceries',
      share: 0.11,
      merchants: MERCHANTS.groceries,
      frequency: 'weekly',
      paymentMethods: ['Credit Card', 'Debit Card'],
    },
    {
      category: 'Restaurants',
      share: 0.03,
      merchants: MERCHANTS.diningOut,
      frequency: 'biweekly',
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
      share: 0.02,
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
    {
      category: 'Kids',
      share: 0.03,
      merchants: ['Falabella — Niños', 'Panamericana — Útiles', 'Juguetería', 'Baby Ganga'],
      frequency: 'monthly',
      paymentMethods: ['Credit Card'],
    },
  ],
})

const liabilities: ClientArchetype['liabilities'] = [
  {
    id: 1,
    name: 'Hipoteca Bancolombia',
    type: 'mortgage',
    currentBalance: 180_000_000,
    originalBalance: 220_000_000,
    minPayment: 2_400_000,
    apr: 11.5,
    dueDay: 2,
    icon: Home,
  },
  {
    id: 2,
    name: 'Tarjeta Bancolombia Gold',
    type: 'credit-card',
    currentBalance: 3_600_000,
    originalBalance: 4_500_000,
    minPayment: 380_000,
    apr: 25.0,
    dueDay: 22,
    icon: CreditCard,
  },
]

const monthlyFlow = computeMonthlyFlow(transactions)
const expensesByCategory = computeExpensesByCategory(transactions)
const topSpending = computeTopSpending(expensesByCategory)
const netWorth = computeNetWorth(monthlyFlow, 55_000_000, liabilities.reduce((s, l) => s + l.currentBalance, 0))
const payoffTimeline = computePayoffTimeline(liabilities)

const summary = computeSummary(
  transactions,
  liabilities,
  {
    balanceChange: 3.2,
    incomeChange: 1.8,
    expensesChange: 2.1,
    savingsChange: -0.7,
  },
  55_000_000
)

export const familyProvider: ClientArchetype = {
  id: 'family-provider',
  displayName: 'The Family Provider',
  displayNameEs: 'Proveedor de Familia',
  description:
    'Dual-income household with two kids in colegio privado, mortgage, medicina prepagada, and a modest college-fund CDT. Low discretionary spend. FinFlow should surface family-goal planning and category-level anomaly alerts.',
  descriptionEs:
    'Hogar con doble ingreso, dos hijos en colegio privado, hipoteca, medicina prepagada y un CDT modesto para universidad. Poco gasto discrecional. FinFlow debe mostrar metas familiares y alertas de anomalías por categoría.',
  demoUsername: 'family@demo.finflow',
  demoPassword: 'DemoFamily!2026',
  profile: {
    estrato: '4',
    grossMonthlyIncomeCOP: 12_000_000,
    netMonthlyIncomeCOP: NET_INCOME,
    city: 'Cali',
    occupation: 'Senior engineer + teacher',
    occupationEs: 'Ingeniero senior + docente',
    householdSize: 4,
  },
  tags: ['family-provider', 'mortgage-holder', 'stable', 'low-debt'],
  transactions,
  budgets: [
    { id: 1, category: 'Groceries', limit: 1_100_000, spent: 1_040_000, icon: Utensils, recurring: true },
    { id: 2, category: 'Vivienda', limit: 2_880_000, spent: 2_880_000, icon: Home, recurring: true },
    { id: 3, category: 'Utilities', limit: 740_000, spent: 705_000, icon: Zap, recurring: true },
    { id: 4, category: 'Education', limit: 1_250_000, spent: 1_250_000, icon: Briefcase, recurring: true },
    { id: 5, category: 'Healthcare', limit: 620_000, spent: 620_000, icon: Pill, recurring: true },
    { id: 6, category: 'Kids', limit: 600_000, spent: 490_000, icon: ShoppingCart, recurring: false },
    { id: 7, category: 'Entertainment', limit: 200_000, spent: 165_000, icon: Film, recurring: false },
  ],
  liabilities,
  subscriptions: [
    { name: 'Netflix Familiar', amount: 44_900, frequency: 'Monthly' },
    { name: 'Disney+ Familiar', amount: 32_000, frequency: 'Monthly' },
    { name: 'Spotify Familiar', amount: 25_900, frequency: 'Monthly' },
    { name: 'Crunchyroll Kids', amount: 22_900, frequency: 'Monthly' },
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
