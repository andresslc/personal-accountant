import { getAIProvider } from "@/lib/ai/provider"
import { z } from "zod"
import {
  FinancialIntentMemorySchema,
  FinanceInsightsDataSchema,
  FinanceInsightsRequestSchema,
  MemoryUpdateSchema,
  type FinancialIntentMemory,
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

const EMPTY_MEMORY: FinancialIntentMemory = {
  financial_intent_profile: {
    primary_goal: "",
    secondary_goals: [],
    priority_order: [],
    motivations: [],
    obstacles: [],
    focus_areas: [],
    commitment_level: "",
    support_preferences: [],
  },
  page_specific_patterns: {
    transactions: [],
    budgets: [],
    debts: [],
    reports: [],
  },
}

const parseMemoryRecord = (memory: unknown): FinancialIntentMemory => {
  if (!memory) return EMPTY_MEMORY
  try {
    const parsed = FinancialIntentMemorySchema.safeParse(memory)
    return parsed.success ? parsed.data : EMPTY_MEMORY
  } catch {
    return EMPTY_MEMORY
  }
}

const getPersistedUserMemory = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<FinancialIntentMemory> => {
  const { data, error } = await supabase
    .from("user_financial_memory" as never)
    .select("memory")
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !data) return EMPTY_MEMORY
  return parseMemoryRecord((data as { memory?: unknown }).memory)
}

const persistUserMemory = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  memory: FinancialIntentMemory
) => {
  await supabase.from("user_financial_memory" as never).upsert(
    {
      user_id: userId,
      memory,
    } as never,
    { onConflict: "user_id" }
  )
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

const getPageBehaviorInstruction = (currentPage: FinanceInsightsRequest["current_page"]) => {
  switch (currentPage) {
    case "transactions":
      return "Transactions page: focus on spending patterns, unnecessary expenses, recurring subscriptions, unusual transactions, and category overspending."
    case "budgets":
      return "Budgets page: focus on allocation quality, over-limit categories, underutilized categories, and budget realism aligned with goals."
    case "debts":
      return "Debts page: focus on highest-interest liabilities, payoff opportunities, debt prioritization, and monthly debt burden."
    case "reports":
      return "Reports page: provide strategic diagnosis with prioritized, goal-aligned recommendations and a clear action plan."
    case "dashboard":
    default:
      return "Global overview: synthesize spending, budgets, debts, and reports into a coherent financial recommendation set."
  }
}

const getPageSpecificData = (currentPage: FinanceInsightsRequest["current_page"], context: FinanceContext) => {
  switch (currentPage) {
    case "transactions":
      return {
        recent_transactions: context.recentTransactions,
        top_spending_categories: context.topSpendingCategories,
      }
    case "budgets":
      return {
        budgets: context.budgets,
        expenses_by_category: context.expensesByCategory,
      }
    case "debts":
      return {
        debts: context.debts,
      }
    case "reports":
      return {
        summary_cards: context.summaryCards,
        income_vs_expenses: context.incomeVsExpenses,
        top_spending_categories: context.topSpendingCategories,
      }
    case "dashboard":
    default:
      return {
        summary_cards: context.summaryCards,
        budgets_count: context.budgets.length,
        debts_count: context.debts.length,
        transactions_count: context.transactions.length,
      }
  }
}

const getAnalysisTypeInstructions = (analysisType: string): string => {
  switch (analysisType) {
    case "spending_diagnosis":
      return `
SPENDING DIAGNOSIS INSTRUCTIONS:
- Identify the top 3 expense categories by total amount.
- For each, compare against the user's average from prior months if data exists.
- Provide specific, quantified savings recommendations (e.g., "Reduce dining from $450K/mo to $300K/mo — save $150K").
- Flag any single transaction that is unusually large compared to category average.
- Highlight recurring subscriptions that could be cut.
- Tone: friendly financial advisor, not judgmental.`

    case "budget_recommendation":
      return `
BUDGET RECOMMENDATION INSTRUCTIONS:
- For each budget item, show whether spending is on track, close to limit, or over limit.
- Suggest reallocating unused budget from under-spent categories to over-spent ones.
- If no budget exists for a high-spend category, recommend creating one with a specific limit.
- Provide a "recommended budget" adjustment for each category that needs it.
- Include a monthly savings projection if the user follows your recommendations.`

    case "debt_strategy":
      return `
DEBT STRATEGY INSTRUCTIONS:
- Calculate and compare avalanche (high interest first) vs snowball (lowest balance first) approaches.
- Show projected payoff dates for each strategy.
- Identify the single debt with the highest interest cost and prioritize it.
- Suggest a specific monthly extra payment amount and which debt to apply it to.
- Calculate total interest saved under your recommended plan vs minimum payments.
- If any debt has unusually high APR, flag refinancing as an option.`

    case "report_summary":
      return `
FINANCIAL REPORT INSTRUCTIONS:
- Write a cohesive narrative report in the "summary" field, NOT bullet points.
- Structure with clear sections: Executive Summary, Income Analysis, Expense Analysis, Budget Adherence, Debt Health, Outlook.
- Include specific numbers, percentages, and month-over-month comparisons throughout.
- The "summary" field should contain the FULL report text (minimum 3 paragraphs).
- Use professional but accessible language, like a financial advisor letter.
- In "insights", provide the 3-5 most important data-driven observations.
- In "recommended_actions", list the top priorities for the next month.`

    case "anomaly_detection":
      return `
ANOMALY DETECTION INSTRUCTIONS:
- Identify transactions that deviate significantly from category averages.
- Flag any sudden spikes or drops in spending patterns.
- Highlight categories where spending changed dramatically month-over-month.
- Note any missing expected transactions (e.g., regular bills not paid).`

    default:
      return ""
  }
}

const buildFinanceSystemPrompt = (request: FinanceInsightsRequest, context: FinanceContext) => {
  const currentPage = request.current_page ?? "dashboard"
  const existingMemory = request.existing_user_memory ?? EMPTY_MEMORY
  const pageSpecificData = getPageSpecificData(currentPage, context)
  const analysisInstructions = getAnalysisTypeInstructions(request.analysis_type)

  return `You are a personal finance advisor providing actionable recommendations.
You are a financial copilot, not a generic chatbot.
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
- Be specific and quantify recommendations with actual amounts when possible.
- Never invent non-existing categories/debts; use only provided context.
- Focus on actionable advice the user can implement immediately.
- If confidence is low, explicitly add risks and cautious recommendations.
- Always include estimated_impact with concrete numbers (e.g., "Save $200K/month" not "Save money").
- Align recommendations to user's durable goals, motivations, obstacles, and priorities.
${analysisInstructions}

Analysis type: ${request.analysis_type}
Current page: ${currentPage}
Page behavior: ${getPageBehaviorInstruction(currentPage)}
Preferences:
- language: ${request.preferences?.language ?? "en"}
- currency: ${request.preferences?.currency ?? "COP"}
- risk_profile: ${request.preferences?.risk_profile ?? "balanced"}
- max_actions: ${request.max_actions}

Existing user memory:
${JSON.stringify(existingMemory)}

Context snapshot:
- summary cards: ${JSON.stringify(context.summaryCards)}
- recent transactions: ${JSON.stringify(context.recentTransactions)}
- transactions_count: ${context.transactions.length}
- budgets: ${JSON.stringify(context.budgets)}
- debts: ${JSON.stringify(context.debts)}
- top_spending_categories: ${JSON.stringify(context.topSpendingCategories)}
- income_vs_expenses: ${JSON.stringify(context.incomeVsExpenses)}
- expenses_by_category: ${JSON.stringify(context.expensesByCategory)}
- subscriptions: ${JSON.stringify(context.subscriptions)}
- page_specific_data: ${JSON.stringify(pageSpecificData)}
`
}

const buildFinanceUserPrompt = (request: FinanceInsightsRequest) => {
  const userMessage = request.user_message ?? request.prompt
  const lines = [
    `Create insights for analysis_type "${request.analysis_type}".`,
    userMessage ? `User focus: ${userMessage}` : "",
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
  const dbMemory = await getPersistedUserMemory(supabase, user.id)
  const resolvedMemory = request.existing_user_memory ?? dbMemory
  const requestWithMemory: FinanceInsightsRequest = {
    ...request,
    existing_user_memory: resolvedMemory,
  }
  const context = await buildFinanceContext()
  const provider = getAIProvider()
  const startedAt = Date.now()
  const userPrompt = buildFinanceUserPrompt(requestWithMemory)
  const systemPrompt = buildFinanceSystemPrompt(requestWithMemory, context)

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

const unique = (values: string[]) => [...new Set(values.filter(Boolean))]

const mergeMemory = (existing: FinancialIntentMemory, update: FinancialIntentMemory): FinancialIntentMemory => {
  return {
    financial_intent_profile: {
      primary_goal: update.financial_intent_profile.primary_goal || existing.financial_intent_profile.primary_goal,
      secondary_goals: unique([
        ...existing.financial_intent_profile.secondary_goals,
        ...update.financial_intent_profile.secondary_goals,
      ]),
      priority_order: unique([
        ...existing.financial_intent_profile.priority_order,
        ...update.financial_intent_profile.priority_order,
      ]),
      motivations: unique([
        ...existing.financial_intent_profile.motivations,
        ...update.financial_intent_profile.motivations,
      ]),
      obstacles: unique([
        ...existing.financial_intent_profile.obstacles,
        ...update.financial_intent_profile.obstacles,
      ]),
      focus_areas: unique([
        ...existing.financial_intent_profile.focus_areas,
        ...update.financial_intent_profile.focus_areas,
      ]),
      commitment_level:
        update.financial_intent_profile.commitment_level || existing.financial_intent_profile.commitment_level,
      support_preferences: unique([
        ...existing.financial_intent_profile.support_preferences,
        ...update.financial_intent_profile.support_preferences,
      ]),
    },
    page_specific_patterns: {
      transactions: unique([
        ...existing.page_specific_patterns.transactions,
        ...update.page_specific_patterns.transactions,
      ]),
      budgets: unique([...existing.page_specific_patterns.budgets, ...update.page_specific_patterns.budgets]),
      debts: unique([...existing.page_specific_patterns.debts, ...update.page_specific_patterns.debts]),
      reports: unique([...existing.page_specific_patterns.reports, ...update.page_specific_patterns.reports]),
    },
  }
}

export const extractAndMergeUserMemory = async (input: {
  current_page?: FinanceInsightsRequest["current_page"]
  user_message: string
  existing_user_memory?: FinancialIntentMemory
  recommendation_summary?: string
}) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new FinanceInsightsError("You must be authenticated.", "UNAUTHORIZED", false, 401)
  }

  const provider = getAIProvider()
  const persistedMemory = await getPersistedUserMemory(supabase, user.id)
  const existingMemory = input.existing_user_memory ?? persistedMemory

  const summarySchema = z.object({
    summary: z.string().min(1),
  })

  const summaryResult = await provider.generateStructured({
    systemPrompt:
      "Summarize only durable user financial signals (goals, motivations, obstacles, priorities). Return JSON: {\"summary\": string}.",
    userPrompt: `Current page: ${input.current_page ?? "dashboard"}
User message: ${input.user_message}
Recommendation summary: ${input.recommendation_summary ?? ""}
Existing memory: ${JSON.stringify(existingMemory)}`,
    schema: summarySchema,
  })

  const memoryResult = await provider.generateStructured({
    systemPrompt: `Extract durable user memory only. Never include transient details, raw transactions, or full transcript.
Return strict JSON with shape:
{
  "memory_update": {
    "financial_intent_profile": {
      "primary_goal": "",
      "secondary_goals": [],
      "priority_order": [],
      "motivations": [],
      "obstacles": [],
      "focus_areas": [],
      "commitment_level": "",
      "support_preferences": []
    },
    "page_specific_patterns": {
      "transactions": [],
      "budgets": [],
      "debts": [],
      "reports": []
    }
  }
}`,
    userPrompt: `Conversation summary:
${summaryResult.summary}

Existing user memory:
${JSON.stringify(existingMemory)}`,
    schema: MemoryUpdateSchema,
  })

  const mergedMemory = mergeMemory(existingMemory, memoryResult.memory_update)
  await persistUserMemory(supabase, user.id, mergedMemory)

  return {
    summary: summaryResult.summary,
    memory_update: memoryResult.memory_update,
    merged_memory: mergedMemory,
  }
}
