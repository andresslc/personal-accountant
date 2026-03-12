import { describe, it, expect } from "vitest"
import { buildSystemPrompt } from "@/lib/ai/prompt"
import { buildMultimodalSystemPrompt, buildImageIntentPrompt } from "@/lib/ai/multimodal-prompt"
import {
  buildOrchestratorPrompt,
  buildDebtAgentPrompt,
  buildAdvisoryAgentPrompt,
  buildPredictionAgentPrompt,
  buildSummaryPrompt,
} from "@/lib/ai/chat/prompts"
import { FROZEN_FINANCIAL_CONTEXT } from "../../fixtures/financial-context"

describe("Prompt Snapshots — Transaction Parser", () => {
  it("buildSystemPrompt matches snapshot", () => {
    const prompt = buildSystemPrompt()
    expect(prompt).toMatchSnapshot()
  })
})

describe("Prompt Snapshots — Multimodal", () => {
  it("buildMultimodalSystemPrompt matches snapshot", () => {
    const prompt = buildMultimodalSystemPrompt()
    expect(prompt).toMatchSnapshot()
  })

  it("buildImageIntentPrompt matches snapshot", () => {
    const prompt = buildImageIntentPrompt()
    expect(prompt).toMatchSnapshot()
  })
})

describe("Prompt Snapshots — Chat Orchestrator", () => {
  it("buildOrchestratorPrompt matches snapshot", () => {
    const prompt = buildOrchestratorPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toMatchSnapshot()
  })
})

describe("Prompt Snapshots — Sub-Agents", () => {
  it("buildDebtAgentPrompt matches snapshot", () => {
    const prompt = buildDebtAgentPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toMatchSnapshot()
  })

  it("buildAdvisoryAgentPrompt matches snapshot", () => {
    const prompt = buildAdvisoryAgentPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toMatchSnapshot()
  })

  it("buildPredictionAgentPrompt matches snapshot", () => {
    const prompt = buildPredictionAgentPrompt(FROZEN_FINANCIAL_CONTEXT)
    expect(prompt).toMatchSnapshot()
  })
})

describe("Prompt Snapshots — Summary", () => {
  it("buildSummaryPrompt matches snapshot", () => {
    const prompt = buildSummaryPrompt()
    expect(prompt).toMatchSnapshot()
  })
})
