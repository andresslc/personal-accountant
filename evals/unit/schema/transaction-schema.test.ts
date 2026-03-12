import { describe, it, expect } from "vitest"
import { ParsedTransactionSchema } from "@/lib/ai/types"
import {
  VALID_EXPENSE,
  VALID_INCOME,
  VALID_DEBT_PAYMENT,
  EDGE_CASE_LARGE_AMOUNT,
  EDGE_CASE_LOW_CONFIDENCE,
} from "../../fixtures/mock-transactions"

describe("ParsedTransactionSchema — Valid Inputs", () => {
  it("validates a standard expense", () => {
    const result = ParsedTransactionSchema.safeParse(VALID_EXPENSE)
    expect(result.success).toBe(true)
  })

  it("validates income", () => {
    const result = ParsedTransactionSchema.safeParse(VALID_INCOME)
    expect(result.success).toBe(true)
  })

  it("validates debt payment with liability_id", () => {
    const result = ParsedTransactionSchema.safeParse(VALID_DEBT_PAYMENT)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.liability_id).toBe(1)
      expect(result.data.type).toBe("debt-payment")
    }
  })

  it("validates large amount", () => {
    const result = ParsedTransactionSchema.safeParse(EDGE_CASE_LARGE_AMOUNT)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.amount).toBe(12_000_000)
    }
  })

  it("validates low confidence", () => {
    const result = ParsedTransactionSchema.safeParse(EDGE_CASE_LOW_CONFIDENCE)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.confidence).toBe(0.3)
    }
  })

  it("applies default method='other' when omitted", () => {
    const input = {
      description: "Test",
      amount: 10_000,
      type: "expense",
      category_id: "other",
      date: "2026-03-12",
      confidence: 0.8,
    }
    const result = ParsedTransactionSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.method).toBe("other")
    }
  })

  it("applies default liability_id=null when omitted", () => {
    const input = {
      description: "Coffee",
      amount: 5_000,
      type: "expense",
      category_id: "food",
      date: "2026-03-12",
      confidence: 0.9,
    }
    const result = ParsedTransactionSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.liability_id).toBeNull()
    }
  })
})

describe("ParsedTransactionSchema — Invalid Inputs", () => {
  it("rejects empty description", () => {
    const input = { ...VALID_EXPENSE, description: "" }
    const result = ParsedTransactionSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("rejects zero amount", () => {
    const input = { ...VALID_EXPENSE, amount: 0 }
    const result = ParsedTransactionSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("rejects negative amount", () => {
    const input = { ...VALID_EXPENSE, amount: -50_000 }
    const result = ParsedTransactionSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("rejects invalid type", () => {
    const input = { ...VALID_EXPENSE, type: "refund" }
    const result = ParsedTransactionSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("rejects invalid date format (MM/DD/YYYY)", () => {
    const input = { ...VALID_EXPENSE, date: "03/12/2026" }
    const result = ParsedTransactionSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("rejects invalid date format (no dashes)", () => {
    const input = { ...VALID_EXPENSE, date: "20260312" }
    const result = ParsedTransactionSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("rejects confidence > 1", () => {
    const input = { ...VALID_EXPENSE, confidence: 1.5 }
    const result = ParsedTransactionSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("rejects confidence < 0", () => {
    const input = { ...VALID_EXPENSE, confidence: -0.1 }
    const result = ParsedTransactionSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("rejects missing required fields", () => {
    const result = ParsedTransactionSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("rejects string amount", () => {
    const input = { ...VALID_EXPENSE, amount: "50000" }
    const result = ParsedTransactionSchema.safeParse(input)
    expect(result.success).toBe(false)
  })
})

describe("ParsedTransactionSchema — Boundary Values", () => {
  it("accepts confidence of exactly 0", () => {
    const result = ParsedTransactionSchema.safeParse({ ...VALID_EXPENSE, confidence: 0 })
    expect(result.success).toBe(true)
  })

  it("accepts confidence of exactly 1", () => {
    const result = ParsedTransactionSchema.safeParse({ ...VALID_EXPENSE, confidence: 1 })
    expect(result.success).toBe(true)
  })

  it("accepts smallest positive amount", () => {
    const result = ParsedTransactionSchema.safeParse({ ...VALID_EXPENSE, amount: 0.01 })
    expect(result.success).toBe(true)
  })

  it("accepts all three valid types", () => {
    for (const type of ["expense", "income", "debt-payment"]) {
      const result = ParsedTransactionSchema.safeParse({ ...VALID_EXPENSE, type })
      expect(result.success).toBe(true)
    }
  })
})
