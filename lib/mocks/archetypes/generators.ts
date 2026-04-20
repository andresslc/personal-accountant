import type {
  PaymentMethod,
  Transaction,
} from '@/lib/mocks/transactions'
import type {
  CategoryExpense,
  MonthlyData,
  NetWorthPoint,
  SpendingRank,
} from '@/lib/mocks/analytics'
import type { Liability, PayoffTimelinePoint } from '@/lib/mocks/debts'
import type { SummaryCard } from '@/lib/mocks/summary'
import type { ArchetypeSummary } from './types'

// Mulberry32 — small, fast, reproducible PRNG so the same seed yields the same
// 12-month transaction stream across SSR, client hydration, and re-renders.
export function createRng(seed: number): () => number {
  let s = seed >>> 0
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashSeed(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

type Rng = () => number

const pick = <T,>(rng: Rng, arr: readonly T[]): T =>
  arr[Math.floor(rng() * arr.length) % arr.length]

const jitter = (rng: Rng, base: number, pct: number): number => {
  const delta = base * pct
  return Math.round(base - delta + rng() * delta * 2)
}

// Merchants grouped by category — all Colombian brands and chains so the demo
// reads as authentic across the six archetypes.
const MERCHANTS = {
  groceries: [
    'Éxito Chapinero',
    'Carulla Virrey',
    'D1 Cedritos',
    'Ara Suba',
    'Jumbo Unicentro',
    'Makro Venecia',
    'Olímpica Calle 80',
  ],
  diningOut: [
    'Rappi — Frisby',
    'Rappi — Crepes & Waffles',
    'DiDi Food — El Corral',
    'iFood — Subway',
    'Juan Valdez Café',
    'Tostao Café',
  ],
  transport: [
    'TransMilenio',
    'Uber Bogotá',
    'DiDi Viaje',
    'Taxi Libre',
    'Terpel',
    'Esso Mobil',
    'Primax',
  ],
  utilities: [
    'EPM — Energía',
    'Codensa',
    'Gas Natural Vanti',
    'Acueducto EAAB',
    'Claro Fijo',
    'Movistar Hogar',
    'ETB Internet',
  ],
  mobile: ['Claro Móvil', 'Movistar Móvil', 'Tigo Móvil', 'WOM'],
  healthcare: [
    'Colsanitas Copago',
    'Sura Consulta',
    'Farmatodo',
    'Cruz Verde',
    'Droguerías La Rebaja',
  ],
  entertainment: [
    'Cine Colombia',
    'Procinal',
    'Netflix',
    'Spotify',
    'Disney+',
    'HBO Max',
    'Teatro Colón',
  ],
  shopping: [
    'Falabella',
    'Homecenter Sodimac',
    'Éxito — Ropa',
    'Arturo Calle',
    'Studio F',
    'Mercado Libre CO',
    'Amazon Colombia',
  ],
  education: [
    'ICETEX — Cuota',
    'Colegio San Bartolomé',
    'Universidad Javeriana',
    'Platzi',
    'Coursera',
  ],
  housing: [
    'Arriendo Apartamento',
    'Administración Conjunto',
    'Davivienda Hipoteca',
    'Bancolombia Hipoteca',
  ],
  kids: [
    'Colegio — Pensión',
    'Uniforme Escolar',
    'Útiles Escolares',
    'Ruta Escolar',
  ],
  insurance: [
    'Seguros Sura — Vida',
    'SOAT — Sura',
    'Todo Riesgo Allianz',
    'Medicina Prepagada Colsanitas',
  ],
  subscriptions: [
    'Netflix',
    'Spotify',
    'Disney+',
    'HBO Max',
    'YouTube Premium',
    'Rappi Prime',
  ],
  savings: ['CDT Bancolombia', 'Fondo Davivienda', 'Trii Inversión', 'Dólares Nu'],
  bnpl: ['Addi — Cuota', 'Sistecrédito — Cuota', 'Mercado Crédito — Cuota'],
  lateFees: [
    'Intereses Moratorios — Tarjeta',
    'Cargo por Mora — BNPL',
    'Cobranza Tarjeta Tuya',
  ],
  gig: [
    'Rappi — Pago Repartidor',
    'Didi Express — Pagos',
    'Freelance — Cliente USA',
    'Proyecto Diseño Web',
    'Fiverr Payout',
  ],
  debtPayment: [
    'Pago Tarjeta Bancolombia',
    'Pago Nu Colombia',
    'Pago RappiCard',
    'Pago Libre Inversión',
    'Pago Crédito Vehículo',
    'Pago Hipoteca',
    'Pago ICETEX',
  ],
} as const

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

// 12 months ending at March 2026 — matches the demo "current" date of April 2026.
export const WINDOW_MONTHS: Array<{ year: number; monthIndex: number; label: string }> =
  Array.from({ length: 12 }, (_, i) => {
    const date = new Date(Date.UTC(2025, 3 + i, 1))
    return {
      year: date.getUTCFullYear(),
      monthIndex: date.getUTCMonth(),
      label: MONTH_LABELS[date.getUTCMonth()],
    }
  })

function fmtDate(year: number, monthIndex: number, day: number): string {
  const mm = String(monthIndex + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

export type CategorySpendPlan = {
  category: string
  share: number
  merchants: readonly string[]
  method?: PaymentMethod
  frequency?: 'monthly' | 'weekly' | 'biweekly'
  paymentMethods?: readonly PaymentMethod[]
}

export interface GeneratorConfig {
  seed: string
  netMonthlyIncomeCOP: number
  incomeVariance?: number
  incomeStream: 'salary' | 'gig'
  incomeSources: readonly { label: string; category: string; share: number }[]
  primaMonths?: readonly number[]
  categoryPlan: readonly CategorySpendPlan[]
  fixedMonthly?: readonly {
    category: string
    description: string
    amountCOP: number
    day: number
    method: PaymentMethod
  }[]
  debtPayments?: readonly {
    liabilityName: string
    category: string
    amountCOP: number
    day: number
    method: PaymentMethod
    description?: string
  }[]
  latePaymentFrequency?: number
  savingsContribution?: {
    amountCOP: number
    description: string
    day: number
  }
}

// Generates one year of deterministic transactions for an archetype. The
// output is intentionally compact (~80–140 rows/year) so the UI stays legible
// in demos while still showing seasonal structure like primas and mid-year trips.
export function generateTransactions(config: GeneratorConfig): Transaction[] {
  const rng = createRng(hashSeed(config.seed))
  const rows: Array<Omit<Transaction, 'id'>> = []

  const incomeVariance = config.incomeVariance ?? 0

  WINDOW_MONTHS.forEach(({ year, monthIndex }, monthOrdinal) => {
    const isPrimaMonth = config.primaMonths?.includes(monthIndex) ?? false
    const incomeMultiplier = isPrimaMonth ? 2 : 1
    const monthIncome =
      config.netMonthlyIncomeCOP *
      incomeMultiplier *
      (1 + (rng() * 2 - 1) * incomeVariance)

    // Split the income across declared sources, dropping income entries on days
    // that feel realistic for each stream (salary on 15th/last day, gigs on
    // random weekdays throughout the month).
    config.incomeSources.forEach((source) => {
      const amount = Math.round(monthIncome * source.share)
      if (amount <= 0) return

      if (config.incomeStream === 'salary') {
        const half = Math.round(amount / 2)
        rows.push({
          date: fmtDate(year, monthIndex, 15),
          category: source.category,
          type: 'income',
          description: source.label,
          amount: half,
          method: 'Bank Transfer',
        })
        rows.push({
          date: fmtDate(year, monthIndex, Math.min(daysInMonth(year, monthIndex), 30)),
          category: source.category,
          type: 'income',
          description: source.label,
          amount: amount - half,
          method: 'Bank Transfer',
        })
      } else {
        const chunks = 3 + Math.floor(rng() * 3)
        const baseChunk = Math.round(amount / chunks)
        for (let i = 0; i < chunks; i += 1) {
          const day = 3 + Math.floor(rng() * (daysInMonth(year, monthIndex) - 4))
          const chunkAmount =
            i === chunks - 1 ? amount - baseChunk * (chunks - 1) : baseChunk
          rows.push({
            date: fmtDate(year, monthIndex, day),
            category: source.category,
            type: 'income',
            description: source.label,
            amount: Math.max(chunkAmount, 0),
            method: 'Bank Transfer',
          })
        }
      }
    })

    if (isPrimaMonth) {
      rows.push({
        date: fmtDate(year, monthIndex, monthIndex === 5 ? 30 : 20),
        category: 'Prima',
        type: 'income',
        description: monthIndex === 5 ? 'Prima de Servicios' : 'Prima de Navidad',
        amount: Math.round(config.netMonthlyIncomeCOP * 0.5),
        method: 'Bank Transfer',
      })
    }

    // Fixed monthly obligations — rent, mortgage, school tuition, insurance.
    config.fixedMonthly?.forEach((fixed) => {
      rows.push({
        date: fmtDate(year, monthIndex, Math.min(fixed.day, daysInMonth(year, monthIndex))),
        category: fixed.category,
        type: 'expense',
        description: fixed.description,
        amount: -fixed.amountCOP,
        method: fixed.method,
      })
    })

    // Scheduled debt payments.
    config.debtPayments?.forEach((debt) => {
      rows.push({
        date: fmtDate(year, monthIndex, Math.min(debt.day, daysInMonth(year, monthIndex))),
        category: debt.category,
        type: 'expense',
        description: debt.description ?? `Pago ${debt.liabilityName}`,
        amount: -debt.amountCOP,
        method: debt.method,
      })
    })

    // Variable spending drawn from the category plan — realistic frequency &
    // merchant variety so the dashboard pies and tables look populated.
    config.categoryPlan.forEach((plan) => {
      const budget = config.netMonthlyIncomeCOP * plan.share
      const frequency = plan.frequency ?? 'monthly'
      const tickets =
        frequency === 'weekly' ? 4 : frequency === 'biweekly' ? 2 : 1
      const ticketSize = budget / tickets
      for (let i = 0; i < tickets; i += 1) {
        const day =
          frequency === 'weekly'
            ? 3 + i * 7 + Math.floor(rng() * 3)
            : frequency === 'biweekly'
              ? 10 + i * 14
              : 5 + Math.floor(rng() * (daysInMonth(year, monthIndex) - 6))
        const amount = jitter(rng, ticketSize, 0.25)
        if (amount <= 0) continue
        rows.push({
          date: fmtDate(year, monthIndex, Math.min(day, daysInMonth(year, monthIndex))),
          category: plan.category,
          type: 'expense',
          description: pick(rng, plan.merchants),
          amount: -amount,
          method: plan.paymentMethods
            ? pick(rng, plan.paymentMethods)
            : (plan.method ?? 'Credit Card'),
        })
      }
    })

    // Savings contribution — only fires if the archetype actually saves.
    if (config.savingsContribution && monthOrdinal % 1 === 0) {
      const sc = config.savingsContribution
      rows.push({
        date: fmtDate(year, monthIndex, Math.min(sc.day, daysInMonth(year, monthIndex))),
        category: 'Ahorro',
        type: 'expense',
        description: sc.description,
        amount: -sc.amountCOP,
        method: 'Bank Transfer',
      })
    }

    // Late-payment fees appear stochastically for the chronic-late-payer only.
    if (config.latePaymentFrequency && rng() < config.latePaymentFrequency) {
      rows.push({
        date: fmtDate(year, monthIndex, 5 + Math.floor(rng() * 20)),
        category: 'Intereses Moratorios',
        type: 'expense',
        description: pick(rng, MERCHANTS.lateFees),
        amount: -jitter(rng, 85_000, 0.4),
        method: 'Credit Card',
      })
    }
  })

  rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

  return rows.map((row, index) => ({
    id: index + 1,
    ...row,
  }))
}

export function computeMonthlyFlow(transactions: Transaction[]): MonthlyData[] {
  return WINDOW_MONTHS.map(({ label, year, monthIndex }) => {
    const bucket = transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getUTCFullYear() === year && d.getUTCMonth() === monthIndex
    })
    const income = bucket
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
    const expenses = Math.abs(
      bucket.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
    )
    return { month: label, income, expenses }
  })
}

export function computeExpensesByCategory(
  transactions: Transaction[]
): CategoryExpense[] {
  const map = new Map<string, number>()
  for (const t of transactions) {
    if (t.amount >= 0) continue
    map.set(t.category, (map.get(t.category) ?? 0) + Math.abs(t.amount))
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function computeTopSpending(
  byCategory: CategoryExpense[]
): SpendingRank[] {
  return byCategory.slice(0, 3).map((item, index) => ({
    rank: index + 1,
    category: item.name,
    amount: item.value,
  }))
}

export function computeNetWorth(
  monthlyFlow: MonthlyData[],
  startingValueCOP: number,
  totalDebtCOP: number
): NetWorthPoint[] {
  let running = startingValueCOP
  return monthlyFlow.map((m) => {
    running += m.income - m.expenses
    return {
      month: m.month,
      value: Math.max(running - totalDebtCOP / monthlyFlow.length, 0),
    }
  })
}

export function computePayoffTimeline(
  liabilities: Liability[]
): PayoffTimelinePoint[] {
  const totalNow = liabilities.reduce((sum, l) => sum + l.currentBalance, 0)
  const monthlyDelta = liabilities.reduce((sum, l) => sum + l.minPayment, 0)
  return WINDOW_MONTHS.map(({ label }, index) => ({
    month: label,
    balance: Math.max(totalNow - monthlyDelta * (index + 1), 0),
  }))
}

export function computeSummary(
  transactions: Transaction[],
  liabilities: Liability[],
  changes: Pick<
    ArchetypeSummary,
    'balanceChange' | 'incomeChange' | 'expensesChange' | 'savingsChange'
  >,
  startingNetWorth: number
): ArchetypeSummary {
  // Use the most recent month in the window as the "current" figures so the
  // KPI cards feel like this month rather than a running 12-month total.
  const mostRecent = WINDOW_MONTHS[WINDOW_MONTHS.length - 1]
  const bucket = transactions.filter((t) => {
    const d = new Date(t.date)
    return (
      d.getUTCFullYear() === mostRecent.year &&
      d.getUTCMonth() === mostRecent.monthIndex
    )
  })
  const income = bucket
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)
  const expenses = Math.abs(
    bucket.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
  )
  const savings = income - expenses

  const monthsElapsed = WINDOW_MONTHS.length
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = Math.abs(
    transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
  )
  const accumulatedNet = totalIncome - totalExpenses
  const totalDebt = liabilities.reduce((sum, l) => sum + l.currentBalance, 0)
  const totalBalance = startingNetWorth + accumulatedNet - totalDebt

  void monthsElapsed
  return {
    totalBalance,
    income,
    expenses,
    savings,
    ...changes,
  }
}

export function buildSummaryCards(
  summary: ArchetypeSummary,
  formatter: (value: number) => string
): SummaryCard[] {
  const base: Array<
    Pick<SummaryCard, 'title' | 'color'> & {
      key: 'balance' | 'income' | 'expenses' | 'savings'
    }
  > = [
    { title: 'Total Balance', color: 'bg-blue-500/10 text-blue-500', key: 'balance' },
    { title: 'Income', color: 'bg-green-500/10 text-green-500', key: 'income' },
    { title: 'Expenses', color: 'bg-red-500/10 text-red-500', key: 'expenses' },
    { title: 'Savings', color: 'bg-purple-500/10 text-purple-500', key: 'savings' },
  ]

  const values: Record<typeof base[number]['key'], { amount: number; change: number }> = {
    balance: { amount: summary.totalBalance, change: summary.balanceChange },
    income: { amount: summary.income, change: summary.incomeChange },
    expenses: { amount: summary.expenses, change: summary.expensesChange },
    savings: { amount: summary.savings, change: summary.savingsChange },
  }

  const signed = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`

  return base.map((card) => {
    const v = values[card.key]
    return {
      title: card.title,
      value: formatter(v.amount),
      change: signed(v.change),
      positive: card.key === 'expenses' ? v.change < 0 : v.change >= 0,
      // icon is filled in by the data layer via getSummaryIcon to avoid
      // serialization issues when archetype data crosses server→client.
      icon: undefined as unknown as SummaryCard['icon'],
      color: card.color,
    }
  })
}

export { MERCHANTS }
