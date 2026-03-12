import type { ParsedTransaction } from "@/lib/ai/types"

export const VALID_EXPENSE: ParsedTransaction = {
  description: "Almuerzo en restaurante",
  amount: 35_000,
  type: "expense",
  category_id: "food",
  date: "2026-03-12",
  method: "card",
  liability_id: null,
  confidence: 0.95,
}

export const VALID_INCOME: ParsedTransaction = {
  description: "Freelance web project",
  amount: 2_000_000,
  type: "income",
  category_id: "freelance",
  date: "2026-03-01",
  method: "transfer",
  liability_id: null,
  confidence: 0.9,
}

export const VALID_DEBT_PAYMENT: ParsedTransaction = {
  description: "Chase Sapphire monthly payment",
  amount: 500_000,
  type: "debt-payment",
  category_id: "other",
  date: "2026-03-06",
  method: "transfer",
  liability_id: 1,
  confidence: 0.85,
}

export const EDGE_CASE_LARGE_AMOUNT: ParsedTransaction = {
  description: "Salary deposit",
  amount: 12_000_000,
  type: "income",
  category_id: "salary",
  date: "2026-03-01",
  method: "transfer",
  liability_id: null,
  confidence: 0.98,
}

export const EDGE_CASE_LOW_CONFIDENCE: ParsedTransaction = {
  description: "Something",
  amount: 10_000,
  type: "expense",
  category_id: "other",
  date: "2026-03-12",
  method: "other",
  liability_id: null,
  confidence: 0.3,
}
