import type { SpendingForecast } from "./types"

/**
 * Simple Exponential Smoothing with Holt's linear trend method.
 * Works with 2+ data points; best with 3+.
 */
function holtForecast(
  values: number[],
  alpha = 0.3,
  beta = 0.1
): { predicted: number; trend: number } {
  if (values.length === 0) return { predicted: 0, trend: 0 }
  if (values.length === 1) return { predicted: values[0], trend: 0 }

  let level = values[0]
  let trend = values[1] - values[0]

  for (let i = 1; i < values.length; i++) {
    const prevLevel = level
    level = alpha * values[i] + (1 - alpha) * (level + trend)
    trend = beta * (level - prevLevel) + (1 - beta) * trend
  }

  return { predicted: level + trend, trend }
}

function computeConfidenceBounds(
  values: number[],
  predicted: number,
  confidenceLevel = 1.96
): { lower: number; upper: number } {
  if (values.length < 2) return { lower: predicted * 0.8, upper: predicted * 1.2 }

  const mean = values.reduce((s, v) => s + v, 0) / values.length
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1)
  const stdDev = Math.sqrt(variance)
  const margin = confidenceLevel * stdDev

  return {
    lower: Math.max(0, predicted - margin),
    upper: predicted + margin,
  }
}

export function forecastSpending(
  monthlyTotalsByCategory: Map<string, Map<string, number>>,
  sortedMonths: string[]
): SpendingForecast[] {
  const forecasts: SpendingForecast[] = []

  for (const [category, monthMap] of monthlyTotalsByCategory) {
    const values = sortedMonths.map((m) => monthMap.get(m) ?? 0)
    const nonZeroValues = values.filter((v) => v > 0)

    if (nonZeroValues.length === 0) continue

    const dataPoints = nonZeroValues.length
    const { predicted, trend } = holtForecast(nonZeroValues)
    const { lower, upper } = computeConfidenceBounds(nonZeroValues, predicted)

    const lastValue = nonZeroValues[nonZeroValues.length - 1]
    const changePercent = lastValue > 0 ? ((predicted - lastValue) / lastValue) * 100 : 0

    let trendDirection: SpendingForecast["trend"]
    if (Math.abs(changePercent) < 5) trendDirection = "stable"
    else if (trend > 0) trendDirection = "rising"
    else trendDirection = "falling"

    const confidence = Math.min(1, 0.4 + dataPoints * 0.1)

    forecasts.push({
      category,
      predictedNextMonth: Math.round(predicted * 100) / 100,
      lowerBound: Math.round(lower * 100) / 100,
      upperBound: Math.round(upper * 100) / 100,
      trend: trendDirection,
      changePercent: Math.round(changePercent * 10) / 10,
      confidence: Math.round(confidence * 100) / 100,
      dataPointsUsed: dataPoints,
    })
  }

  return forecasts.sort((a, b) => b.predictedNextMonth - a.predictedNextMonth)
}
