import { getAIProvider } from "@/lib/ai/provider"
import {
  FinanceInsightsDataSchema,
  FinanceInsightsRequestSchema,
  type FinanceErrorResponse,
  type FinanceInsightsRequest,
  type FinanceSuccessResponse,
} from "@/lib/ai/finance-types"
import { createClient } from "@/lib/supabase/server"
import {
  getBudgets,
  getDebts,
  getExpensesByCategory,
  getIncomeVsExpenses,
  getRecentTransactions,
  getSubscriptions,
  getSummaryCards,
  getTopSpendingCategories,
  getTransactions,
} from "@/lib/data/dashboard-data"

const REQUEST_TIMEOUT_MS = 20_000

export class FinanceInsightsError extends Error {
  code: FinanceErrorResponse["error"]["code"]
  retryable: boolean
  status: number

  constructor(
    message: string,
    code: FinanceErrorResponse["error"]["code"],
    retryable: boolean,
    status = 500
  ) {
    super(message)
    this.code = code
    this.retryable = retryable
    this.status = status
  }
}

type FinanceContext = {
  summaryCards: Awaited<ReturnType<typeof getSummaryCards>>
  recentTransactions: Awaited<ReturnType<typeof getRecentTransactions>>
  transactions: Awaited<ReturnType<typeof getTransactions>>
  incomeVsExpenses: Awaited<ReturnType<typeof getIncomeVsExpenses>>
  expensesByCategory: Awaited<ReturnType<typeof getExpensesByCategory>>
  budgets: Awaited<ReturnType<typeof getBudgets>>
  debts: Awaited<ReturnType<typeof getDebts>>
  topSpendingCategories: Awaited<ReturnType<typeof getTopSpendingCategories>>
  subscriptions: Awaited<ReturnType<typeof getSubscriptions>>
}

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new FinanceInsightsError("AI request timed out.", "TIMEOUT", true, 504))
        }, timeoutMs)
      }),
    ])
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle)
  }
}

const buildFinanceSystemPrompt = (request: FinanceInsightsRequest, context: FinanceContext) => {
  return `You are a personal finance assistant.
Return strictly valid JSON matching this shape:
{
  "summary": string,
  "insights": [{ "title": string, "detail": string, "severity": "low" | "medium" | "high" }],
  "risks": [{ "title": string, "detail": string, "severity": "low" | "medium" | "high" }],
  "recommended_actions": [{ "action": string, "reason": string, "estimated_impact": string }],
  "confidence": number (0-1),
  "period_covered": string,
  "data_points_used": number,
  "workflow_steps": string[]
}

Rules:
- Keep recommendations practical and specific.
- Never invent non-existing categories/debts; use only provided context.
- Keep output concise and actionable.
- If confidence is low, explicitly add risks and cautious recommendations.

Analysis type: ${request.analysis_type}
Preferences:
- language: ${request.preferences?.language ?? "en"}
- currency: ${request.preferences?.currency ?? "COP"}
- risk_profile: ${request.preferences?.risk_profile ?? "balanced"}
- max_actions: ${request.max_actions}

Context snapshot:
- summary cards: ${JSON.stringify(context.summaryCards)}
- recent transactions: ${JSON.stringify(context.recentTransactions)}
- transactions_count: ${context.transactions.length}
- budgets_count: ${context.budgets.length}
- debts_count: ${context.debts.length}
- top_spending_categories: ${JSON.stringify(context.topSpendingCategories)}
- income_vs_expenses: ${JSON.stringify(context.incomeVsExpenses)}
- expenses_by_category: ${JSON.stringify(context.expensesByCategory)}
- subscriptions: ${JSON.stringify(context.subscriptions)}
`
}

const buildFinanceUserPrompt = (request: FinanceInsightsRequest) => {
  const lines = [
    `Create insights for analysis_type "${request.analysis_type}".`,
    request.prompt ? `User focus: ${request.prompt}` : "",
    request.time_range
      ? `Time range: ${request.time_range.from} to ${request.time_range.to}`
      : "Time range: latest available data.",
    request.filters?.categories?.length
      ? `Focus categories: ${request.filters.categories.join(", ")}`
      : "",
    request.filters?.include_debts === false
      ? "Exclude debt-focused recommendations when possible."
      : "Debt-related guidance is allowed.",
  ].filter(Boolean)

  return lines.join("\n")
}

const buildFinanceContext = async (): Promise<FinanceContext> => {
  const [
    summaryCards,
    recentTransactions,
    transactions,
    incomeVsExpenses,
    expensesByCategory,
    budgets,
    debts,
    topSpendingCategories,
    subscriptions,
  ] = await Promise.all([
    getSummaryCards(),
    getRecentTransactions(),
    getTransactions(),
    getIncomeVsExpenses(),
    getExpensesByCategory(),
    getBudgets(),
    getDebts(),
    getTopSpendingCategories(),
    getSubscriptions(),
  ])

  return {
    summaryCards,
    recentTransactions,
    transactions,
    incomeVsExpenses,
    expensesByCategory,
    budgets,
    debts,
    topSpendingCategories,
    subscriptions,
  }
}

export const analyzeFinanceInsights = async (
  rawRequest: unknown
): Promise<FinanceSuccessResponse> => {
  const parsedRequest = FinanceInsightsRequestSchema.safeParse(rawRequest)
  if (!parsedRequest.success) {
    throw new FinanceInsightsError("Invalid request payload.", "VALIDATION_ERROR", false, 400)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new FinanceInsightsError("You must be authenticated.", "UNAUTHORIZED", false, 401)
  }

  const request = parsedRequest.data
  const context = await buildFinanceContext()
  const provider = getAIProvider()
  const startedAt = Date.now()
  const userPrompt = buildFinanceUserPrompt(request)
  const systemPrompt = buildFinanceSystemPrompt(request, context)

  try {
    const data = await withTimeout(
      provider.generateStructured({
        systemPrompt,
        userPrompt,
        schema: FinanceInsightsDataSchema,
      }),
      REQUEST_TIMEOUT_MS
    )

    const outputChars = JSON.stringify(data).length

    return {
      success: true,
      data,
      meta: {
        provider: provider.getProviderName(),
        model: provider.getModelName(),
        latency_ms: Date.now() - startedAt,
        input_chars: systemPrompt.length + userPrompt.length,
        output_chars: outputChars,
      },
    }
  } catch (error) {
    if (error instanceof FinanceInsightsError) throw error
    throw new FinanceInsightsError("Failed to generate finance insights.", "PROVIDER_ERROR", true, 502)
  }
}
