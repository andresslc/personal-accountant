import { z } from "zod"
import { ParsedTransactionSchema } from "./types"

export const IntentTypeSchema = z.enum(["transaction", "budget", "debt"])

export const ParsedBudgetSchema = z.object({
  category_id: z.string(),
  budget_limit: z.number().positive(),
  month_year: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  recurring: z.boolean().default(false),
  confidence: z.number().min(0).max(1),
})

export const ParsedDebtSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["credit-card", "car", "student", "personal", "mortgage"]),
  current_balance: z.number().positive(),
  original_balance: z.number().positive(),
  min_payment: z.number().positive(),
  apr: z.number().min(0).max(100),
  due_day: z.number().int().min(1).max(31).nullable().default(null),
  confidence: z.number().min(0).max(1),
})

export const MultimodalParseResultSchema = z.discriminatedUnion("intent", [
  z.object({ intent: z.literal("transaction"), data: ParsedTransactionSchema }),
  z.object({ intent: z.literal("budget"), data: ParsedBudgetSchema }),
  z.object({ intent: z.literal("debt"), data: ParsedDebtSchema }),
])

export type IntentType = z.infer<typeof IntentTypeSchema>
export type ParsedBudget = z.infer<typeof ParsedBudgetSchema>
export type ParsedDebt = z.infer<typeof ParsedDebtSchema>
export type MultimodalParseResult = z.infer<typeof MultimodalParseResultSchema>
