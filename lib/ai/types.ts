import { z } from "zod"

export const ParsedTransactionSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  type: z.enum(["expense", "income", "debt-payment"]),
  category_id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  method: z.string().default("other"),
  liability_id: z.number().nullable().default(null),
  confidence: z.number().min(0).max(1),
})

export type ParsedTransaction = z.infer<typeof ParsedTransactionSchema>

export interface ParseRequest {
  text: string
}

export interface ParseResponse {
  success: true
  data: ParsedTransaction
}

export interface ParseErrorResponse {
  success: false
  error: string
}
