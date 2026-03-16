import type { DebtPayoffComparison, DebtPayoffDetail, DebtPayoffPlan, DebtScheduleEntry } from "./types"

interface Debt {
  name: string
  currentBalance: number
  apr: number
  minPayment: number
}

const MAX_MONTHS = 360
const MAX_SCHEDULE_ENTRIES = 60

function computeDebtSchedule(debt: Debt): DebtPayoffDetail {
  const monthlyRate = debt.apr / 100 / 12
  const schedule: DebtScheduleEntry[] = []
  let balance = debt.currentBalance
  let totalInterest = 0
  let months = 0

  while (balance > 0.01 && months < MAX_MONTHS) {
    const interest = balance * monthlyRate
    const payment = Math.min(debt.minPayment, balance + interest)
    const principal = payment - interest

    if (principal <= 0) break

    balance = Math.max(0, balance - principal)
    totalInterest += interest
    months++

    if (schedule.length < MAX_SCHEDULE_ENTRIES) {
      schedule.push({
        month: months,
        payment: Math.round(payment * 100) / 100,
        principal: Math.round(principal * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        remainingBalance: Math.round(balance * 100) / 100,
      })
    }
  }

  return {
    name: debt.name,
    currentBalance: debt.currentBalance,
    apr: debt.apr,
    minPayment: debt.minPayment,
    payoffMonths: months,
    totalInterest: Math.round(totalInterest * 100) / 100,
    schedule,
  }
}

function computeStrategyPlan(
  debts: Debt[],
  order: Debt[],
  strategy: "avalanche" | "snowball"
): DebtPayoffPlan {
  const totalDebt = debts.reduce((s, d) => s + d.currentBalance, 0)
  const totalMinPayments = debts.reduce((s, d) => s + d.minPayment, 0)

  const balances = new Map(debts.map((d) => [d.name, d.currentBalance]))
  const rates = new Map(debts.map((d) => [d.name, d.apr / 100 / 12]))
  const mins = new Map(debts.map((d) => [d.name, d.minPayment]))

  const debtSchedules = new Map<string, DebtScheduleEntry[]>(debts.map((d) => [d.name, []]))
  const debtTotalInterest = new Map<string, number>(debts.map((d) => [d.name, 0]))
  const debtPayoffMonth = new Map<string, number>()

  let months = 0
  let totalInterest = 0

  while (months < MAX_MONTHS) {
    const activeDebts = order.filter((d) => (balances.get(d.name) ?? 0) > 0.01)
    if (activeDebts.length === 0) break

    months++
    let availableExtra = 0

    for (const debt of activeDebts) {
      const balance = balances.get(debt.name)!
      const rate = rates.get(debt.name)!
      const interest = balance * rate
      totalInterest += interest
      debtTotalInterest.set(debt.name, (debtTotalInterest.get(debt.name) ?? 0) + interest)
    }

    for (const debt of order) {
      const balance = balances.get(debt.name)!
      if (balance <= 0.01) {
        availableExtra += mins.get(debt.name)!
        continue
      }

      const rate = rates.get(debt.name)!
      const interest = balance * rate
      const minPay = mins.get(debt.name)!
      const isTarget = debt.name === activeDebts[0]?.name
      const payment = Math.min(minPay + (isTarget ? availableExtra : 0), balance + interest)
      const principal = payment - interest

      if (principal <= 0) continue

      const newBalance = Math.max(0, balance - principal)
      balances.set(debt.name, newBalance)

      const schedule = debtSchedules.get(debt.name)!
      if (schedule.length < MAX_SCHEDULE_ENTRIES) {
        schedule.push({
          month: months,
          payment: Math.round(payment * 100) / 100,
          principal: Math.round(principal * 100) / 100,
          interest: Math.round(interest * 100) / 100,
          remainingBalance: Math.round(newBalance * 100) / 100,
        })
      }

      if (newBalance <= 0.01 && !debtPayoffMonth.has(debt.name)) {
        debtPayoffMonth.set(debt.name, months)
        if (isTarget) availableExtra += minPay
      }
    }
  }

  const debtDetails: DebtPayoffDetail[] = order.map((d) => ({
    name: d.name,
    currentBalance: d.currentBalance,
    apr: d.apr,
    minPayment: d.minPayment,
    payoffMonths: debtPayoffMonth.get(d.name) ?? months,
    totalInterest: Math.round((debtTotalInterest.get(d.name) ?? 0) * 100) / 100,
    schedule: debtSchedules.get(d.name) ?? [],
  }))

  return {
    strategy,
    totalDebt: Math.round(totalDebt * 100) / 100,
    totalMinPayments: Math.round(totalMinPayments * 100) / 100,
    payoffMonths: months,
    totalInterestPaid: Math.round(totalInterest * 100) / 100,
    debts: debtDetails,
  }
}

export function compareDebtStrategies(debts: Debt[]): DebtPayoffComparison {
  if (debts.length === 0) {
    const emptyPlan: DebtPayoffPlan = {
      strategy: "avalanche",
      totalDebt: 0,
      totalMinPayments: 0,
      payoffMonths: 0,
      totalInterestPaid: 0,
      debts: [],
    }
    return {
      avalanche: { ...emptyPlan, strategy: "avalanche" },
      snowball: { ...emptyPlan, strategy: "snowball" },
      interestSaved: 0,
      monthsSaved: 0,
      recommendedStrategy: "avalanche",
    }
  }

  const avalancheOrder = [...debts].sort((a, b) => b.apr - a.apr)
  const snowballOrder = [...debts].sort((a, b) => a.currentBalance - b.currentBalance)

  const avalanche = computeStrategyPlan(debts, avalancheOrder, "avalanche")
  const snowball = computeStrategyPlan(debts, snowballOrder, "snowball")

  const interestSaved = Math.round((snowball.totalInterestPaid - avalanche.totalInterestPaid) * 100) / 100
  const monthsSaved = snowball.payoffMonths - avalanche.payoffMonths

  return {
    avalanche,
    snowball,
    interestSaved: Math.max(0, interestSaved),
    monthsSaved: Math.max(0, monthsSaved),
    recommendedStrategy: interestSaved > 0 ? "avalanche" : "snowball",
  }
}

export { computeDebtSchedule }
