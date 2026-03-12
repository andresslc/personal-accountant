import { getAIProvider } from "@/lib/ai/provider"
import { buildDebtAgentPrompt } from "../prompts"
import type { FinancialContext, StreamEvent } from "../types"

export async function* runDebtAgent(
  taskDescription: string,
  context: FinancialContext
): AsyncGenerator<StreamEvent> {
  const provider = getAIProvider()
  const systemPrompt = buildDebtAgentPrompt(context)

  const debtAnalysis = buildDebtAnalysis(context)

  const userPrompt = `${taskDescription}

Here is a mathematical analysis of the current debts to use in your response:
${debtAnalysis}`

  try {
    const stream = await provider.streamText(systemPrompt, userPrompt)
    for await (const chunk of stream) {
      yield { type: "text", content: chunk }
    }
  } catch (error) {
    yield {
      type: "error",
      message: `Debt analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }

  yield { type: "done" }
}

function buildDebtAnalysis(context: FinancialContext): string {
  const debts = context.debts
  if (debts.length === 0) return "No debts to analyze."

  const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0)
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minPayment, 0)

  const avalancheOrder = [...debts].sort((a, b) => b.apr - a.apr)
  const snowballOrder = [...debts].sort((a, b) => a.currentBalance - b.currentBalance)

  const avalancheMonths = estimatePayoff(debts, avalancheOrder)
  const snowballMonths = estimatePayoff(debts, snowballOrder)

  return `Total debt: $${totalDebt.toLocaleString()} COP
Total minimum payments: $${totalMinPayment.toLocaleString()} COP/month

Avalanche order (highest APR first): ${avalancheOrder.map((d) => `${d.name} (${d.apr}%)`).join(" → ")}
Estimated payoff: ~${avalancheMonths} months paying minimums

Snowball order (lowest balance first): ${snowballOrder.map((d) => `${d.name} ($${d.currentBalance.toLocaleString()})`).join(" → ")}
Estimated payoff: ~${snowballMonths} months paying minimums`
}

function estimatePayoff(
  debts: FinancialContext["debts"],
  _order: FinancialContext["debts"]
): number {
  if (debts.length === 0) return 0

  let totalBalance = debts.reduce((sum, d) => sum + d.currentBalance, 0)
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minPayment, 0)
  const avgApr = debts.reduce((sum, d) => sum + d.apr, 0) / debts.length
  const monthlyRate = avgApr / 100 / 12

  let months = 0
  const maxMonths = 360

  while (totalBalance > 0 && months < maxMonths) {
    const interest = totalBalance * monthlyRate
    const principal = Math.max(totalMinPayment - interest, 0)
    totalBalance = Math.max(totalBalance - principal, 0)
    months++

    if (principal <= 0) break
  }

  return months
}
