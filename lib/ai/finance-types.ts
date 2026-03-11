import { z } from "zod"

export const FinancePageSchema = z.enum([
  "dashboard",
  "transactions",
  "budgets",
  "debts",
  "reports",
])

export const FinanceAnalysisTypeSchema = z.enum([
  "overview",
  "spending_diagnosis",
  "budget_recommendation",
  "debt_strategy",
  "report_summary",
  "anomaly_detection",
])

export const FinanceRiskProfileSchema = z.enum(["conservative", "balanced", "aggressive"])
export const FinanceLanguageSchema = z.enum(["en", "es"])

export const FinanceTimeRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const FinanceFiltersSchema = z.object({
  categories: z.array(z.string()).optional(),
  include_debts: z.boolean().optional(),
  limit: z.number().int().min(1).max(500).optional(),
})

export const FinancePreferencesSchema = z.object({
  currency: z.string().default("COP"),
  language: FinanceLanguageSchema.default("en"),
  risk_profile: FinanceRiskProfileSchema.optional(),
})

export const FinanceInsightItemSchema = z.object({
  title: z.string().min(1),
  detail: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]).default("medium"),
})

export const FinanceActionItemSchema = z.object({
  action: z.string().min(1),
  reason: z.string().min(1),
  estimated_impact: z.string().min(1),
})

export const FinancialIntentProfileSchema = z.object({
  primary_goal: z.string().default(""),
  secondary_goals: z.array(z.string()).default([]),
  priority_order: z.array(z.string()).default([]),
  motivations: z.array(z.string()).default([]),
  obstacles: z.array(z.string()).default([]),
  focus_areas: z.array(z.string()).default([]),
  commitment_level: z.string().default(""),
  support_preferences: z.array(z.string()).default([]),
})

export const PageSpecificPatternsSchema = z.object({
  transactions: z.array(z.string()).default([]),
  budgets: z.array(z.string()).default([]),
  debts: z.array(z.string()).default([]),
  reports: z.array(z.string()).default([]),
})

export const FinancialIntentMemorySchema = z.object({
  financial_intent_profile: FinancialIntentProfileSchema.default({
    primary_goal: "",
    secondary_goals: [],
    priority_order: [],
    motivations: [],
    obstacles: [],
    focus_areas: [],
    commitment_level: "",
    support_preferences: [],
  }),
  page_specific_patterns: PageSpecificPatternsSchema.default({
    transactions: [],
    budgets: [],
    debts: [],
    reports: [],
  }),
})

export const MemoryUpdateSchema = z.object({
  memory_update: FinancialIntentMemorySchema,
})

export const FinanceInsightsRequestSchema = z.object({
  analysis_type: FinanceAnalysisTypeSchema,
  current_page: FinancePageSchema.optional(),
  page_data: z.record(z.string(), z.any()).optional(),
  user_message: z.string().optional(),
  existing_user_memory: FinancialIntentMemorySchema.optional(),
  prompt: z.string().optional(),
  time_range: FinanceTimeRangeSchema.optional(),
  filters: FinanceFiltersSchema.optional(),
  preferences: FinancePreferencesSchema.optional(),
  max_actions: z.number().int().min(1).max(10).default(5),
})

export const FinanceInsightsDataSchema = z.object({
  summary: z.string().min(1),
  insights: z.array(FinanceInsightItemSchema).min(1).max(8),
  risks: z.array(FinanceInsightItemSchema).max(5).default([]),
  recommended_actions: z.array(FinanceActionItemSchema).max(10),
  confidence: z.number().min(0).max(1),
  period_covered: z.string().min(1),
  data_points_used: z.number().int().min(0),
  workflow_steps: z.array(z.string()).optional(),
})

export const FinanceMetaSchema = z.object({
  provider: z.string(),
  model: z.string(),
  latency_ms: z.number().int().min(0),
  input_chars: z.number().int().min(0).optional(),
  output_chars: z.number().int().min(0).optional(),
})

export const FinanceSuccessResponseSchema = z.object({
  success: z.literal(true),
  data: FinanceInsightsDataSchema,
  meta: FinanceMetaSchema,
})

export const FinanceErrorCodeSchema = z.enum([
  "UNAUTHORIZED",
  "VALIDATION_ERROR",
  "PROVIDER_ERROR",
  "TIMEOUT",
  "RATE_LIMITED",
])

export const FinanceErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: FinanceErrorCodeSchema,
    message: z.string(),
    retryable: z.boolean(),
  }),
})

export type FinanceAnalysisType = z.infer<typeof FinanceAnalysisTypeSchema>
export type FinancePage = z.infer<typeof FinancePageSchema>
export type FinanceInsightsRequest = z.infer<typeof FinanceInsightsRequestSchema>
export type FinanceInsightsData = z.infer<typeof FinanceInsightsDataSchema>
export type FinanceSuccessResponse = z.infer<typeof FinanceSuccessResponseSchema>
export type FinanceErrorResponse = z.infer<typeof FinanceErrorResponseSchema>
export type FinancialIntentMemory = z.infer<typeof FinancialIntentMemorySchema>
export type MemoryUpdate = z.infer<typeof MemoryUpdateSchema>
