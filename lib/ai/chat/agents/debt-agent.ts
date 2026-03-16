import { getAIProvider, hasAIProvider } from "@/lib/ai/provider"
import { buildDebtAgentPrompt } from "../prompts"
import type { FinancialContext, StreamEvent } from "../types"
import { compareDebtStrategies } from "@/lib/predictions/debt-payoff"

function buildDebtAnalysis(context: FinancialContext): string {
  const debts = context.debts
  if (debts.length === 0) return "No debts to analyze."

  const comparison = compareDebtStrategies(debts)
  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`

  const lines = [
    `Total debt: ${fmt(comparison.avalanche.totalDebt)} COP`,
    `Total minimum payments: ${fmt(comparison.avalanche.totalMinPayments)} COP/month`,
    "",
    `**Avalanche strategy** (highest APR first):`,
    `  Order: ${comparison.avalanche.debts.map((d) => `${d.name} (${d.apr}%)`).join(" → ")}`,
    `  Payoff: ~${comparison.avalanche.payoffMonths} months`,
    `  Total interest: ${fmt(comparison.avalanche.totalInterestPaid)}`,
    "",
    `**Snowball strategy** (lowest balance first):`,
    `  Order: ${comparison.snowball.debts.map((d) => `${d.name} (${fmt(d.currentBalance)})`).join(" → ")}`,
    `  Payoff: ~${comparison.snowball.payoffMonths} months`,
    `  Total interest: ${fmt(comparison.snowball.totalInterestPaid)}`,
    "",
    `**Recommendation**: ${comparison.recommendedStrategy}`,
  ]

  if (comparison.interestSaved > 0) {
    lines.push(`  Saves ${fmt(comparison.interestSaved)} in interest and ${comparison.monthsSaved} months vs ${comparison.recommendedStrategy === "avalanche" ? "snowball" : "avalanche"}.`)
  }

  lines.push("")
  lines.push("Per-debt breakdown:")
  for (const d of comparison.avalanche.debts) {
    lines.push(`  - ${d.name}: ${fmt(d.currentBalance)} at ${d.apr}% → payoff in ${d.payoffMonths} months, ${fmt(d.totalInterest)} interest`)
  }

  return lines.join("\n")
}

export async function* runDebtAgent(
  taskDescription: string,
  context: FinancialContext
): AsyncGenerator<StreamEvent> {
  const debtAnalysis = buildDebtAnalysis(context)

  if (!hasAIProvider()) {
    const output = `## Debt Strategy Analysis\n\n${debtAnalysis}`
    for (const chunk of output.match(/.{1,100}/g) ?? [output]) {
      yield { type: "text", content: chunk }
    }
    yield { type: "done" }
    return
  }

  const provider = getAIProvider()
  const systemPrompt = buildDebtAgentPrompt(context)

  const userPrompt = `${taskDescription}

Here is the computed mathematical analysis of the current debts (use these exact numbers in your response):
${debtAnalysis}`

  try {
    const stream = await provider.streamText(systemPrompt, userPrompt)
    for await (const chunk of stream) {
      yield { type: "text", content: chunk }
    }
  } catch (error) {
    yield { type: "text", content: `## Debt Strategy Analysis\n\n${debtAnalysis}` }
    yield {
      type: "error",
      message: `LLM narration failed, showing raw analysis: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }

  yield { type: "done" }
}
