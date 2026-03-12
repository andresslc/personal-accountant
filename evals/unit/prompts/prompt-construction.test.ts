import { describe, it, expect } from "vitest"
import { buildSystemPrompt } from "@/lib/ai/prompt"
import { buildMultimodalSystemPrompt } from "@/lib/ai/multimodal-prompt"
import {
  buildOrchestratorPrompt,
  buildDebtAgentPrompt,
  buildAdvisoryAgentPrompt,
  buildPredictionAgentPrompt,
  buildSummaryPrompt,
} from "@/lib/ai/chat/prompts"
import {
  FROZEN_FINANCIAL_CONTEXT,
  EMPTY_FINANCIAL_CONTEXT,
} from "../../fixtures/financial-context"

describe("Prompt Construction — Transaction Parser", () => {
  it("includes today's date", () => {
    const prompt = buildSystemPrompt()
    expect(prompt).toMatch(/Today's date: \d{4}-\d{2}-\d{2}/)
  })

  it("includes categories from mocks", () => {
    const prompt = buildSystemPrompt()
    expect(prompt).toContain("Available categories:")
    expect(prompt).toContain("category_id")
  })

  it("includes liabilities from mocks", () => {
    const prompt = buildSystemPrompt()
    expect(prompt).toContain("Available liabilities")
  })

  it("specifies COP as default currency", () => {
    const prompt = buildSystemPrompt()
    expect(prompt).toContain("COP")
    expect(prompt).toContain("Colombian Pesos")
  })

  it("defines multiplier rules (k, millones)", () => {
    const prompt = buildSystemPrompt()
    expect(prompt).toContain("mil")
    expect(prompt).toContain("1,000")
    expect(prompt).toContain("millones")
    expect(prompt).toContain("1,000,000")
  })

  it("requires JSON-only response", () => {
    const prompt = buildSystemPrompt()
    expect(prompt).toMatch(/respond only with.*(valid )?json/i)
  })
})

describe("Prompt Construction — Multimodal", () => {
  it("includes all three intents", () => {
    const prompt = buildMultimodalSystemPrompt()
    expect(prompt).toContain('"transaction"')
    expect(prompt).toContain('"budget"')
    expect(prompt).toContain('"debt"')
  })

  it("specifies transaction as default intent", () => {
    const prompt = buildMultimodalSystemPrompt()
    expect(prompt).toMatch(/default/i)
    expect(prompt).toContain("transaction")
  })

  it("includes intent classification section", () => {
    const prompt = buildMultimodalSystemPrompt()
    expect(prompt).toContain("Intent Classification")
  })
})

describe("Prompt Construction — Orchestrator", () => {
  it("includes summary financial data", () => {
    const prompt = buildOrchestratorPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toContain("4,250,000")
    expect(prompt).toContain("6,500,000")
    expect(prompt).toContain("3,800,000")
  })

  it("includes recent transactions", () => {
    const prompt = buildOrchestratorPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toContain("Uber ride to office")
    expect(prompt).toContain("Éxito groceries")
  })

  it("includes budget data", () => {
    const prompt = buildOrchestratorPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toContain("Groceries")
    expect(prompt).toContain("420,000")
    expect(prompt).toContain("600,000")
  })

  it("includes debt data", () => {
    const prompt = buildOrchestratorPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toContain("Chase Sapphire")
    expect(prompt).toContain("24.5%")
  })

  it("includes categories", () => {
    const prompt = buildOrchestratorPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toContain("groceries")
    expect(prompt).toContain("transport")
  })

  it("includes conversation summaries", () => {
    const prompt = buildOrchestratorPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toContain("Previous Conversation Summaries")
    expect(prompt).toContain("avalanche strategy")
  })

  it("includes guardrails section", () => {
    const prompt = buildOrchestratorPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toContain("Guardrails")
    expect(prompt).toContain("MUST NOT")
  })

  it("includes sub-agent routing info", () => {
    const prompt = buildOrchestratorPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toContain("debt_agent")
    expect(prompt).toContain("advisory_agent")
    expect(prompt).toContain("prediction_agent")
  })

  it("handles empty context gracefully", () => {
    const prompt = buildOrchestratorPrompt(EMPTY_FINANCIAL_CONTEXT)
    expect(prompt).toContain("0 COP")
    expect(prompt).not.toContain("undefined")
    expect(prompt).not.toContain("null")
  })
})

describe("Prompt Construction — Debt Agent", () => {
  it("lists debts with balances and APRs", () => {
    const prompt = buildDebtAgentPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toContain("Chase Sapphire")
    expect(prompt).toContain("3,200,000")
    expect(prompt).toContain("24.5%")
    expect(prompt).toContain("Car Loan")
    expect(prompt).toContain("Student Loan")
  })

  it("mentions avalanche and snowball strategies", () => {
    const prompt = buildDebtAgentPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toContain("avalanche")
    expect(prompt).toContain("snowball")
  })

  it("handles empty debts", () => {
    const prompt = buildDebtAgentPrompt(EMPTY_FINANCIAL_CONTEXT)
    expect(prompt).toContain("No debts")
  })
})

describe("Prompt Construction — Advisory Agent", () => {
  it("includes financial snapshot", () => {
    const prompt = buildAdvisoryAgentPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toContain("4,250,000")
    expect(prompt).toContain("6,500,000")
  })

  it("includes budget categories", () => {
    const prompt = buildAdvisoryAgentPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toContain("Groceries")
    expect(prompt).toContain("420,000")
  })
})

describe("Prompt Construction — Prediction Agent", () => {
  it("includes savings rate calculation", () => {
    const prompt = buildPredictionAgentPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toContain("Savings Rate")
    expect(prompt).toMatch(/\d+\.\d%/)
  })

  it("includes budget utilization percentages", () => {
    const prompt = buildPredictionAgentPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toContain("% used")
  })

  it("includes recent transactions", () => {
    const prompt = buildPredictionAgentPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toContain("Uber ride to office")
  })
})

describe("Prompt Construction — Summary", () => {
  it("requests JSON output", () => {
    const prompt = buildSummaryPrompt()
    expect(prompt).toContain("JSON")
    expect(prompt).toContain("summary")
    expect(prompt).toContain("topics")
  })

  it("specifies response format", () => {
    const prompt = buildSummaryPrompt()
    expect(prompt).toMatch(/respond only with/i)
  })
})
