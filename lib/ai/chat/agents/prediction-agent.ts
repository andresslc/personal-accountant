import { traceable } from "langsmith/traceable"
import { getAIProvider, hasAIProvider } from "@/lib/ai/provider"
import { buildPredictionAgentPrompt } from "../prompts"
import type { FinancialContext, StreamEvent } from "../types"
import { generatePredictions as _generatePredictions } from "@/lib/predictions"
import type { PredictionResponse } from "@/lib/predictions/types"

// Surface the pure-TS forecasting step as its own LangSmith span so the trace
// tree separates the deterministic predictions from the LLM narration.
const generatePredictions = traceable(_generatePredictions, {
  name: "prediction_agent.generatePredictions",
  run_type: "chain",
})

function _buildPredictionSummary(predictions: PredictionResponse): string {
  const parts: string[] = []
  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`

  if (predictions.spendingForecasts?.length) {
    parts.push("## Spending Forecast (Next Month)\n")
    for (const f of predictions.spendingForecasts) {
      const arrow = f.trend === "rising" ? "↑" : f.trend === "falling" ? "↓" : "→"
      parts.push(`- **${f.category}**: ${fmt(f.predictedNextMonth)} ${arrow} (${f.changePercent > 0 ? "+" : ""}${f.changePercent.toFixed(1)}%) — range: ${fmt(f.lowerBound)} to ${fmt(f.upperBound)}`)
    }
  }

  if (predictions.budgetAdherence?.length) {
    parts.push("\n## Budget Status\n")
    for (const b of predictions.budgetAdherence) {
      const emoji = b.status === "on-track" ? "✅" : b.status === "at-risk" ? "⚠️" : "🔴"
      parts.push(`- ${emoji} **${b.category}**: ${fmt(b.spentSoFar)} / ${fmt(b.budgetLimit)} (${b.percentUsed.toFixed(0)}%) — projected: ${fmt(b.projectedEndOfMonth)}, safe daily: ${fmt(b.safeDailyBudget)}`)
    }
  }

  if (predictions.savingsProjection) {
    const sp = predictions.savingsProjection
    const arrow = sp.trend === "rising" ? "↑" : sp.trend === "falling" ? "↓" : "→"
    parts.push("\n## Savings Projection\n")
    parts.push(`- Monthly average: ${fmt(sp.monthlyAvgSavings)} (${sp.savingsRate.toFixed(1)}% rate) ${arrow}`)
    parts.push(`- 3-month projection: ${fmt(sp.projections.threeMonths)}`)
    parts.push(`- 6-month projection: ${fmt(sp.projections.sixMonths)}`)
    parts.push(`- 12-month projection: ${fmt(sp.projections.twelveMonths)}`)
  }

  if (predictions.debtPayoff && predictions.debtPayoff.avalanche.totalDebt > 0) {
    const dp = predictions.debtPayoff
    parts.push("\n## Debt Payoff Analysis\n")
    parts.push(`- **Total debt**: ${fmt(dp.avalanche.totalDebt)}`)
    parts.push(`- **Avalanche** (highest APR first): ${dp.avalanche.payoffMonths} months, ${fmt(dp.avalanche.totalInterestPaid)} interest`)
    parts.push(`- **Snowball** (lowest balance first): ${dp.snowball.payoffMonths} months, ${fmt(dp.snowball.totalInterestPaid)} interest`)
    if (dp.interestSaved > 0) {
      parts.push(`- **Recommendation**: ${dp.recommendedStrategy} saves ${fmt(dp.interestSaved)} and ${dp.monthsSaved} months`)
    }
  }

  if (predictions.anomalies?.length) {
    parts.push("\n## Anomalies Detected\n")
    for (const a of predictions.anomalies.slice(0, 5)) {
      parts.push(`- **${a.description}** (${a.date}): ${fmt(a.amount)} — ${a.explanation}`)
    }
  }

  if (predictions.spendingDiagnosis) {
    const d = predictions.spendingDiagnosis
    if (d.potentialMonthlySavings > 0) {
      parts.push(`\n## Potential Savings\n`)
      parts.push(`You could save approximately **${fmt(d.potentialMonthlySavings)}/month** by bringing elevated categories back to their historical averages.`)
    }
  }

  if (predictions.metadata.isLimitedData) {
    parts.push("\n*Note: Limited historical data available. Predictions will improve with more transaction history.*")
  }

  return parts.join("\n")
}

const buildPredictionSummary = traceable(_buildPredictionSummary, {
  name: "prediction_agent.buildSummary",
  run_type: "chain",
})

async function* _runPredictionAgent(
  taskDescription: string,
  context: FinancialContext
): AsyncGenerator<StreamEvent> {
  const txData = context.recentTransactions.map((t) => ({
    date: t.date,
    category: t.category,
    type: t.type,
    amount: t.amount,
    description: t.description,
  }))

  const budgetData = context.budgets.map((b) => ({
    category: b.category,
    limit: b.limit,
    spent: b.spent,
  }))

  const debtData = context.debts.map((d) => ({
    name: d.name,
    currentBalance: d.currentBalance,
    apr: d.apr,
    minPayment: d.minPayment,
  }))

  const predictions = await generatePredictions(txData, budgetData, debtData)
  const predictionSummary = await buildPredictionSummary(predictions)

  if (!hasAIProvider()) {
    for (const chunk of predictionSummary.match(/.{1,100}/g) ?? [predictionSummary]) {
      yield { type: "text", content: chunk }
    }
    yield { type: "done" }
    return
  }

  const provider = getAIProvider()
  const systemPrompt = buildPredictionAgentPrompt(context)

  const userPrompt = `${taskDescription}

Here are the computed financial predictions and analysis (use these exact numbers in your response):

${predictionSummary}`

  try {
    const stream = await provider.streamText(systemPrompt, userPrompt)
    for await (const chunk of stream) {
      yield { type: "text", content: chunk }
    }
  } catch (error) {
    yield { type: "text", content: predictionSummary }
    yield {
      type: "error",
      message: `LLM narration failed, showing raw predictions: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }

  yield { type: "done" }
}

export const runPredictionAgent = traceable(_runPredictionAgent, {
  name: "prediction_agent",
  run_type: "chain",
})
