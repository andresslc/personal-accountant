import { describe, it, expect } from "vitest"
import {
  FinanceInsightsDataSchema,
  FinanceInsightsRequestSchema,
  FinancialIntentMemorySchema,
} from "@/lib/ai/finance-types"

describe("FinanceInsightsDataSchema", () => {
  const validData = {
    summary: "Your spending this month shows strong discipline in groceries.",
    insights: [
      { title: "Groceries under budget", detail: "You're at 70% of your 600k budget.", severity: "low" },
      { title: "Transport trending up", detail: "75% used with 18 days left.", severity: "medium" },
    ],
    risks: [
      { title: "Utility overspend risk", detail: "83% consumed early in month.", severity: "high" },
    ],
    recommended_actions: [
      { action: "Reduce dining out", reason: "Food category at 70%", estimated_impact: "Save 120k COP/month" },
    ],
    confidence: 0.85,
    period_covered: "March 2026",
    data_points_used: 42,
  }

  it("validates a complete insights response", () => {
    const result = FinanceInsightsDataSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("requires at least 1 insight", () => {
    const result = FinanceInsightsDataSchema.safeParse({
      ...validData,
      insights: [],
    })
    expect(result.success).toBe(false)
  })

  it("allows max 8 insights", () => {
    const insights = Array.from({ length: 8 }, (_, i) => ({
      title: `Insight ${i}`,
      detail: `Detail ${i}`,
      severity: "medium",
    }))
    const result = FinanceInsightsDataSchema.safeParse({ ...validData, insights })
    expect(result.success).toBe(true)
  })

  it("rejects > 8 insights", () => {
    const insights = Array.from({ length: 9 }, (_, i) => ({
      title: `Insight ${i}`,
      detail: `Detail ${i}`,
      severity: "medium",
    }))
    const result = FinanceInsightsDataSchema.safeParse({ ...validData, insights })
    expect(result.success).toBe(false)
  })

  it("defaults risks to empty array", () => {
    const { risks: _, ...noRisks } = validData
    const result = FinanceInsightsDataSchema.safeParse(noRisks)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.risks).toEqual([])
    }
  })

  it("allows max 5 risks", () => {
    const risks = Array.from({ length: 5 }, (_, i) => ({
      title: `Risk ${i}`,
      detail: `Detail ${i}`,
    }))
    const result = FinanceInsightsDataSchema.safeParse({ ...validData, risks })
    expect(result.success).toBe(true)
  })

  it("rejects > 5 risks", () => {
    const risks = Array.from({ length: 6 }, (_, i) => ({
      title: `Risk ${i}`,
      detail: `Detail ${i}`,
    }))
    const result = FinanceInsightsDataSchema.safeParse({ ...validData, risks })
    expect(result.success).toBe(false)
  })

  it("allows max 10 recommended_actions", () => {
    const actions = Array.from({ length: 10 }, (_, i) => ({
      action: `Action ${i}`,
      reason: `Reason ${i}`,
      estimated_impact: `Impact ${i}`,
    }))
    const result = FinanceInsightsDataSchema.safeParse({
      ...validData,
      recommended_actions: actions,
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty summary", () => {
    const result = FinanceInsightsDataSchema.safeParse({ ...validData, summary: "" })
    expect(result.success).toBe(false)
  })

  it("rejects negative data_points_used", () => {
    const result = FinanceInsightsDataSchema.safeParse({
      ...validData,
      data_points_used: -1,
    })
    expect(result.success).toBe(false)
  })

  it("allows optional workflow_steps", () => {
    const result = FinanceInsightsDataSchema.safeParse({
      ...validData,
      workflow_steps: ["fetch_data", "analyze", "format"],
    })
    expect(result.success).toBe(true)
  })

  it("severity defaults to medium", () => {
    const result = FinanceInsightsDataSchema.safeParse({
      ...validData,
      insights: [{ title: "Test", detail: "Detail" }],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.insights[0].severity).toBe("medium")
    }
  })
})

describe("FinanceInsightsRequestSchema", () => {
  it("validates minimal request", () => {
    const result = FinanceInsightsRequestSchema.safeParse({
      analysis_type: "overview",
    })
    expect(result.success).toBe(true)
  })

  it("validates all analysis types", () => {
    const types = [
      "overview",
      "spending_diagnosis",
      "budget_recommendation",
      "debt_strategy",
      "report_summary",
      "anomaly_detection",
    ]
    for (const t of types) {
      const result = FinanceInsightsRequestSchema.safeParse({ analysis_type: t })
      expect(result.success).toBe(true)
    }
  })

  it("validates full request with all fields", () => {
    const result = FinanceInsightsRequestSchema.safeParse({
      analysis_type: "spending_diagnosis",
      current_page: "transactions",
      user_message: "Why are my expenses so high?",
      time_range: { from: "2026-03-01", to: "2026-03-31" },
      filters: { categories: ["food", "transport"], include_debts: true, limit: 100 },
      preferences: { currency: "COP", language: "es", risk_profile: "conservative" },
      max_actions: 8,
    })
    expect(result.success).toBe(true)
  })

  it("defaults max_actions to 5", () => {
    const result = FinanceInsightsRequestSchema.safeParse({
      analysis_type: "overview",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.max_actions).toBe(5)
    }
  })

  it("rejects invalid analysis_type", () => {
    const result = FinanceInsightsRequestSchema.safeParse({
      analysis_type: "investment_advice",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid page", () => {
    const result = FinanceInsightsRequestSchema.safeParse({
      analysis_type: "overview",
      current_page: "settings",
    })
    expect(result.success).toBe(false)
  })

  it("rejects filter limit > 500", () => {
    const result = FinanceInsightsRequestSchema.safeParse({
      analysis_type: "overview",
      filters: { limit: 501 },
    })
    expect(result.success).toBe(false)
  })
})

describe("FinancialIntentMemorySchema", () => {
  it("validates empty memory with defaults", () => {
    const result = FinancialIntentMemorySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.financial_intent_profile.primary_goal).toBe("")
      expect(result.data.page_specific_patterns.transactions).toEqual([])
    }
  })

  it("validates populated memory", () => {
    const result = FinancialIntentMemorySchema.safeParse({
      financial_intent_profile: {
        primary_goal: "Become debt-free",
        secondary_goals: ["Build emergency fund"],
        focus_areas: ["debt reduction", "savings"],
        commitment_level: "high",
      },
      page_specific_patterns: {
        transactions: ["frequent grocery tracking"],
        debts: ["monthly debt review"],
      },
    })
    expect(result.success).toBe(true)
  })
})
