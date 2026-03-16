interface RawTransaction {
  date: string
  category: string
  type: string
  amount: number
  description: string
}

interface MonthlyAggregate {
  month: string
  yearMonth: string
  income: number
  expenses: number
  savings: number
}

interface CurrentMonthSpend {
  spent: number
  daysElapsed: number
  daysInMonth: number
  transactionCount: number
}

const toYearMonth = (dateStr: string): string => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

const toMonthLabel = (yearMonth: string): string => {
  const [year, month] = yearMonth.split("-")
  const d = new Date(Number(year), Number(month) - 1)
  return d.toLocaleString("en-US", { month: "short", year: "numeric" })
}

export function getMonthlyTotalsByCategory(
  transactions: RawTransaction[]
): Map<string, Map<string, number>> {
  const result = new Map<string, Map<string, number>>()

  for (const tx of transactions) {
    if (tx.amount >= 0) continue
    const category = tx.category
    const yearMonth = toYearMonth(tx.date)
    const absAmount = Math.abs(tx.amount)

    if (!result.has(category)) result.set(category, new Map())
    const catMap = result.get(category)!
    catMap.set(yearMonth, (catMap.get(yearMonth) ?? 0) + absAmount)
  }

  return result
}

export function getMonthlyAggregates(transactions: RawTransaction[]): MonthlyAggregate[] {
  const monthMap = new Map<string, { income: number; expenses: number }>()

  for (const tx of transactions) {
    const yearMonth = toYearMonth(tx.date)
    const entry = monthMap.get(yearMonth) ?? { income: 0, expenses: 0 }

    if (tx.amount >= 0) {
      entry.income += tx.amount
    } else {
      entry.expenses += Math.abs(tx.amount)
    }
    monthMap.set(yearMonth, entry)
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([yearMonth, data]) => ({
      month: toMonthLabel(yearMonth),
      yearMonth,
      income: data.income,
      expenses: data.expenses,
      savings: data.income - data.expenses,
    }))
}

export function getCurrentMonthSpendByCategory(
  transactions: RawTransaction[],
  referenceDate?: Date
): Map<string, CurrentMonthSpend> {
  const now = referenceDate ?? new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysElapsed = now.getDate()

  const result = new Map<string, CurrentMonthSpend>()

  for (const tx of transactions) {
    if (tx.amount >= 0) continue
    const txDate = new Date(tx.date)
    if (txDate.getFullYear() !== currentYear || txDate.getMonth() !== currentMonth) continue

    const category = tx.category
    const entry = result.get(category) ?? { spent: 0, daysElapsed, daysInMonth, transactionCount: 0 }
    entry.spent += Math.abs(tx.amount)
    entry.transactionCount++
    result.set(category, entry)
  }

  return result
}

export function getTransactionAmountsByCategory(
  transactions: RawTransaction[]
): Map<string, number[]> {
  const result = new Map<string, number[]>()

  for (const tx of transactions) {
    if (tx.amount >= 0) continue
    const category = tx.category
    if (!result.has(category)) result.set(category, [])
    result.get(category)!.push(Math.abs(tx.amount))
  }

  return result
}

export function getDistinctMonths(transactions: RawTransaction[]): string[] {
  const months = new Set<string>()
  for (const tx of transactions) {
    months.add(toYearMonth(tx.date))
  }
  return Array.from(months).sort()
}
