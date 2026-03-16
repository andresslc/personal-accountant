import type { SpendingAnomaly } from "./types"

interface RawTransaction {
  date: string
  description: string
  amount: number
  category: string
}

const Z_SCORE_THRESHOLD = 2.0

function computeStats(values: number[]): { mean: number; stdDev: number } {
  if (values.length < 2) return { mean: values[0] ?? 0, stdDev: 0 }

  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1)
  return { mean, stdDev: Math.sqrt(variance) }
}

export function detectAnomalies(
  transactions: RawTransaction[],
  amountsByCategory: Map<string, number[]>
): SpendingAnomaly[] {
  const anomalies: SpendingAnomaly[] = []

  const categoryStats = new Map<string, { mean: number; stdDev: number }>()
  for (const [category, amounts] of amountsByCategory) {
    categoryStats.set(category, computeStats(amounts))
  }

  for (const tx of transactions) {
    if (tx.amount >= 0) continue
    const absAmount = Math.abs(tx.amount)
    const stats = categoryStats.get(tx.category)
    if (!stats || stats.stdDev === 0) continue

    const zScore = (absAmount - stats.mean) / stats.stdDev

    if (zScore > Z_SCORE_THRESHOLD) {
      const multiplier = Math.round((absAmount / stats.mean) * 10) / 10
      anomalies.push({
        date: tx.date,
        description: tx.description,
        amount: absAmount,
        category: tx.category,
        categoryAvg: Math.round(stats.mean * 100) / 100,
        zScore: Math.round(zScore * 100) / 100,
        explanation: `This ${tx.category} transaction ($${absAmount.toLocaleString()}) is ${multiplier}x the category average ($${Math.round(stats.mean).toLocaleString()}).`,
      })
    }
  }

  return anomalies.sort((a, b) => b.zScore - a.zScore)
}
