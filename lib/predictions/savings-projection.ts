import type { SavingsProjection } from "./types"

interface MonthlyAggregate {
  month: string
  income: number
  expenses: number
  savings: number
}

function weightedMovingAverage(values: number[], weights?: number[]): number {
  if (values.length === 0) return 0

  const w = weights ?? values.map((_, i) => i + 1)
  const totalWeight = w.reduce((s, v) => s + v, 0)
  const weighted = values.reduce((s, v, i) => s + v * w[i], 0)

  return weighted / totalWeight
}

export function projectSavings(monthlyData: MonthlyAggregate[]): SavingsProjection {
  if (monthlyData.length === 0) {
    return {
      monthlyAvgSavings: 0,
      savingsRate: 0,
      trend: "stable",
      projections: { threeMonths: 0, sixMonths: 0, twelveMonths: 0 },
      recentMonths: [],
    }
  }

  const savingsValues = monthlyData.map((m) => m.savings)
  const incomeValues = monthlyData.map((m) => m.income)

  const monthlyAvg = weightedMovingAverage(savingsValues)
  const avgIncome = incomeValues.reduce((s, v) => s + v, 0) / incomeValues.length
  const savingsRate = avgIncome > 0 ? (monthlyAvg / avgIncome) * 100 : 0

  let trend: SavingsProjection["trend"] = "stable"
  if (savingsValues.length >= 2) {
    const recent = savingsValues.slice(-3)
    const older = savingsValues.slice(0, Math.max(1, savingsValues.length - 3))
    const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length
    const olderAvg = older.reduce((s, v) => s + v, 0) / older.length
    const changePct = olderAvg !== 0 ? ((recentAvg - olderAvg) / Math.abs(olderAvg)) * 100 : 0

    if (changePct > 10) trend = "rising"
    else if (changePct < -10) trend = "falling"
  }

  return {
    monthlyAvgSavings: Math.round(monthlyAvg * 100) / 100,
    savingsRate: Math.round(savingsRate * 10) / 10,
    trend,
    projections: {
      threeMonths: Math.round(monthlyAvg * 3 * 100) / 100,
      sixMonths: Math.round(monthlyAvg * 6 * 100) / 100,
      twelveMonths: Math.round(monthlyAvg * 12 * 100) / 100,
    },
    recentMonths: monthlyData.slice(-6).map((m) => ({
      month: m.month,
      income: Math.round(m.income * 100) / 100,
      expenses: Math.round(m.expenses * 100) / 100,
      savings: Math.round(m.savings * 100) / 100,
    })),
  }
}
