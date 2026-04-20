import { describe, it, expect } from "vitest"
import {
  MultimodalParseResultSchema,
  MultimodalParseResultsSchema,
  ParsedBudgetSchema,
  ParsedDebtSchema,
} from "@/lib/ai/multimodal-types"

describe("MultimodalParseResultSchema — Discriminated Union", () => {
  it("accepts transaction intent", () => {
    const input = {
      intent: "transaction",
      data: {
        description: "Grocery shopping",
        amount: 180_000,
        type: "expense",
        category_id: "groceries",
        date: "2026-03-12",
        method: "card",
        liability_id: null,
        confidence: 0.9,
      },
    }
    const result = MultimodalParseResultSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it("accepts budget intent", () => {
    const input = {
      intent: "budget",
      data: {
        category_id: "groceries",
        budget_limit: 600_000,
        month_year: "2026-03-01",
        recurring: true,
        confidence: 0.85,
      },
    }
    const result = MultimodalParseResultSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it("accepts debt intent", () => {
    const input = {
      intent: "debt",
      data: {
        name: "Chase Sapphire",
        type: "credit-card",
        current_balance: 3_200_000,
        original_balance: 5_000_000,
        min_payment: 250_000,
        apr: 24.5,
        due_day: 15,
        confidence: 0.8,
      },
    }
    const result = MultimodalParseResultSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it("rejects unknown intent", () => {
    const input = {
      intent: "subscription",
      data: { name: "Netflix", amount: 45_000 },
    }
    const result = MultimodalParseResultSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("rejects mismatched intent and data (budget data with transaction intent)", () => {
    const input = {
      intent: "transaction",
      data: {
        category_id: "groceries",
        budget_limit: 600_000,
        month_year: "2026-03-01",
        confidence: 0.85,
      },
    }
    const result = MultimodalParseResultSchema.safeParse(input)
    expect(result.success).toBe(false)
  })
})

describe("ParsedBudgetSchema", () => {
  it("validates valid budget", () => {
    const result = ParsedBudgetSchema.safeParse({
      category_id: "food",
      budget_limit: 400_000,
      month_year: "2026-03-01",
      recurring: false,
      confidence: 0.9,
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid month_year format", () => {
    const result = ParsedBudgetSchema.safeParse({
      category_id: "food",
      budget_limit: 400_000,
      month_year: "March 2026",
      confidence: 0.9,
    })
    expect(result.success).toBe(false)
  })

  it("rejects zero budget_limit", () => {
    const result = ParsedBudgetSchema.safeParse({
      category_id: "food",
      budget_limit: 0,
      month_year: "2026-03-01",
      confidence: 0.9,
    })
    expect(result.success).toBe(false)
  })

  it("defaults recurring to false", () => {
    const result = ParsedBudgetSchema.safeParse({
      category_id: "food",
      budget_limit: 400_000,
      month_year: "2026-03-01",
      confidence: 0.9,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.recurring).toBe(false)
    }
  })
})

describe("ParsedDebtSchema", () => {
  it("validates all debt types", () => {
    const types = ["credit-card", "car", "student", "personal", "mortgage"] as const
    for (const type of types) {
      const result = ParsedDebtSchema.safeParse({
        name: `Test ${type}`,
        type,
        current_balance: 1_000_000,
        original_balance: 2_000_000,
        min_payment: 50_000,
        apr: 15,
        due_day: 15,
        confidence: 0.9,
      })
      expect(result.success).toBe(true)
    }
  })

  it("accepts null due_day", () => {
    const result = ParsedDebtSchema.safeParse({
      name: "Personal Loan",
      type: "personal",
      current_balance: 500_000,
      original_balance: 500_000,
      min_payment: 50_000,
      apr: 10,
      due_day: null,
      confidence: 0.85,
    })
    expect(result.success).toBe(true)
  })

  it("rejects APR > 100", () => {
    const result = ParsedDebtSchema.safeParse({
      name: "Bad Loan",
      type: "personal",
      current_balance: 500_000,
      original_balance: 500_000,
      min_payment: 50_000,
      apr: 150,
      due_day: null,
      confidence: 0.85,
    })
    expect(result.success).toBe(false)
  })

  it("rejects due_day > 31", () => {
    const result = ParsedDebtSchema.safeParse({
      name: "Card",
      type: "credit-card",
      current_balance: 500_000,
      original_balance: 500_000,
      min_payment: 50_000,
      apr: 20,
      due_day: 32,
      confidence: 0.85,
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty name", () => {
    const result = ParsedDebtSchema.safeParse({
      name: "",
      type: "personal",
      current_balance: 500_000,
      original_balance: 500_000,
      min_payment: 50_000,
      apr: 10,
      due_day: null,
      confidence: 0.85,
    })
    expect(result.success).toBe(false)
  })
})

describe("MultimodalParseResultsSchema — Items Wrapper", () => {
  it("accepts a single item in the array", () => {
    const input = {
      items: [
        {
          intent: "transaction",
          data: {
            description: "Ice cream",
            amount: 5_000,
            type: "expense",
            category_id: "food",
            date: "2026-04-01",
            method: "cash",
            liability_id: null,
            confidence: 0.95,
          },
        },
      ],
    }
    const result = MultimodalParseResultsSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.items).toHaveLength(1)
    }
  })

  it("accepts multiple items with mixed intents", () => {
    const input = {
      items: [
        {
          intent: "transaction",
          data: {
            description: "Ice cream",
            amount: 5_000,
            type: "expense",
            category_id: "food",
            date: "2026-04-01",
            method: "cash",
            liability_id: null,
            confidence: 0.9,
          },
        },
        {
          intent: "transaction",
          data: {
            description: "Electricity bill",
            amount: 80_000,
            type: "expense",
            category_id: "utilities",
            date: "2026-04-01",
            method: "transfer",
            liability_id: null,
            confidence: 0.85,
          },
        },
        {
          intent: "budget",
          data: {
            category_id: "food",
            budget_limit: 500_000,
            month_year: "2026-04-01",
            recurring: false,
            confidence: 0.8,
          },
        },
      ],
    }
    const result = MultimodalParseResultsSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.items).toHaveLength(3)
      expect(result.data.items[0].intent).toBe("transaction")
      expect(result.data.items[1].intent).toBe("transaction")
      expect(result.data.items[2].intent).toBe("budget")
    }
  })

  it("rejects empty items array", () => {
    const result = MultimodalParseResultsSchema.safeParse({ items: [] })
    expect(result.success).toBe(false)
  })

  it("rejects missing items field", () => {
    const result = MultimodalParseResultsSchema.safeParse({
      intent: "transaction",
      data: { description: "test", amount: 100 },
    })
    expect(result.success).toBe(false)
  })
})
