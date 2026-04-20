import { z } from "zod"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  actions?: ActionEvent[]
  transcription?: string
}

export type StreamEventType = "text" | "action" | "transcription" | "error" | "done"

export interface TextEvent {
  type: "text"
  content: string
}

export interface ActionEvent {
  type: "action"
  action: {
    kind:
      | "transaction_created"
      | "budget_created"
      | "debt_created"
      | "transaction_deleted"
      | "transaction_updated"
      | "debt_deleted"
      | "debt_updated"
    data: Record<string, unknown>
  }
}

export interface TranscriptionEvent {
  type: "transcription"
  text: string
}

export interface ErrorEvent {
  type: "error"
  message: string
}

export interface DoneEvent {
  type: "done"
}

export type StreamEvent = TextEvent | ActionEvent | TranscriptionEvent | ErrorEvent | DoneEvent

export interface ToolDefinition {
  name: string
  description: string
  parameters: z.ZodTypeAny
}

export type SubAgentType = "debt_agent" | "advisory_agent" | "prediction_agent"

export const RouteToSubAgentSchema = z.object({
  agent: z.enum(["debt_agent", "advisory_agent", "prediction_agent"]),
  task_description: z.string(),
  context: z.record(z.unknown()).optional(),
})

export type RouteToSubAgentParams = z.infer<typeof RouteToSubAgentSchema>

export interface FinancialContext {
  summary: { totalDebt: number; income: number; expenses: number; savings: number }
  recentTransactions: Array<{ date: string; description: string; amount: number; category: string; type: string }>
  budgets: Array<{ category: string; limit: number; spent: number; remaining: number }>
  debts: Array<{ name: string; type: string; currentBalance: number; minPayment: number; apr: number }>
  categories: Array<{ id: string; name: string; type: string }>
  recentSummaries: string[]
}

export interface ChatSummary {
  id: number
  user_id: string
  summary: string
  topics: string[]
  actions_taken: Array<Record<string, unknown>>
  message_count: number
  created_at: string
}
