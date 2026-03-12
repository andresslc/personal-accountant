import { describe, it, expect } from "vitest"
import { runOutputRails } from "@/lib/ai/guardrails/output-rails"
import { applyOutputGuardrails } from "@/lib/ai/guardrails"

// ─── Sensitive Data Redaction ──────────────────────────────────────────────────

describe("Output Rails — Sensitive Data Redaction", () => {
  it("redacts email addresses", () => {
    const { violations, sanitizedOutput } = runOutputRails(
      "Your account email is user@example.com and your balance is 500k."
    )
    expect(violations.some((v) => v.type === "sensitive_data_leak")).toBe(true)
    expect(sanitizedOutput).toContain("[REDACTED EMAIL ADDRESS]")
    expect(sanitizedOutput).not.toContain("user@example.com")
  })

  it("redacts API keys (sk- prefix)", () => {
    const { violations, sanitizedOutput } = runOutputRails(
      "The key is sk-abc123def456ghi789jkl012mno345pqr"
    )
    expect(violations.some((v) => v.type === "sensitive_data_leak")).toBe(true)
    expect(sanitizedOutput).toContain("[REDACTED API KEY]")
  })

  it("redacts API keys (pk- prefix)", () => {
    const { violations, sanitizedOutput } = runOutputRails(
      "Found pk-testkey1234567890abcdefgh"
    )
    expect(violations.some((v) => v.type === "sensitive_data_leak")).toBe(true)
    expect(sanitizedOutput).toContain("[REDACTED API KEY]")
  })

  it("redacts JWT tokens", () => {
    const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0"
    const { violations, sanitizedOutput } = runOutputRails(`Token: ${jwt}`)
    expect(violations.some((v) => v.type === "sensitive_data_leak")).toBe(true)
    expect(sanitizedOutput).toContain("[REDACTED JWT TOKEN]")
  })

  it("redacts Supabase credentials", () => {
    const { violations, sanitizedOutput } = runOutputRails(
      "supabase_url: https://abc.supabase.co"
    )
    expect(violations.some((v) => v.type === "sensitive_data_leak")).toBe(true)
    expect(sanitizedOutput).toContain("[REDACTED SUPABASE CREDENTIAL]")
  })

  it("redacts AI provider keys", () => {
    const { violations, sanitizedOutput } = runOutputRails(
      "OPENAI_API_KEY=sk-proj-abc123def456"
    )
    expect(violations.some((v) => v.type === "sensitive_data_leak")).toBe(true)
    expect(sanitizedOutput).not.toContain("sk-proj-abc123def456")
  })

  it("redacts passwords", () => {
    const { violations, sanitizedOutput } = runOutputRails(
      "password=mysecret123"
    )
    expect(violations.some((v) => v.type === "sensitive_data_leak")).toBe(true)
    expect(sanitizedOutput).toContain("[REDACTED PASSWORD]")
  })

  it("redacts database connection strings", () => {
    const { violations, sanitizedOutput } = runOutputRails(
      "Connect using postgresql://user:pass@host:5432/db"
    )
    expect(violations.some((v) => v.type === "sensitive_data_leak")).toBe(true)
    expect(sanitizedOutput).toContain("[REDACTED DATABASE CONNECTION STRING]")
  })

  it("redacts credit card numbers", () => {
    const { violations, sanitizedOutput } = runOutputRails(
      "Card ending in 4532 1234 5678 9012"
    )
    expect(violations.some((v) => v.type === "sensitive_data_leak")).toBe(true)
    expect(sanitizedOutput).toContain("[REDACTED CREDIT CARD NUMBER]")
  })

  it("redacts SSN-like numbers", () => {
    const { violations, sanitizedOutput } = runOutputRails(
      "SSN: 123-45-6789"
    )
    expect(violations.some((v) => v.type === "sensitive_data_leak")).toBe(true)
    expect(sanitizedOutput).toContain("[REDACTED SSN-LIKE NUMBER]")
  })

  it("redacts multiple sensitive items in same output", () => {
    const output = "Email: test@test.com, Key: sk-abcdef1234567890abcdefgh, SSN: 999-88-7777"
    const { violations, sanitizedOutput } = runOutputRails(output)
    expect(violations.length).toBeGreaterThanOrEqual(2)
    expect(sanitizedOutput).not.toContain("test@test.com")
    expect(sanitizedOutput).not.toContain("sk-abcdef1234567890abcdefgh")
    expect(sanitizedOutput).not.toContain("999-88-7777")
  })
})

// ─── Character Consistency (output relevance) ──────────────────────────────────

describe("Output Rails — Character Consistency", () => {
  it("flags AI self-disclosure patterns", () => {
    const { violations } = runOutputRails(
      "I'm just an AI language model and can't help with feelings."
    )
    expect(violations.some((v) => v.type === "output_relevance")).toBe(true)
  })

  it("flags 'as an AI' pattern", () => {
    const { violations } = runOutputRails(
      "As an AI, I can't provide medical advice."
    )
    expect(violations.some((v) => v.type === "output_relevance")).toBe(true)
  })

  it("flags emotion disclaimer", () => {
    const { violations } = runOutputRails(
      "I don't have personal feelings or opinions about your budget."
    )
    expect(violations.some((v) => v.type === "output_relevance")).toBe(true)
  })

  it("flags 'not a real person' pattern", () => {
    const { violations } = runOutputRails(
      "I'm not a real person, but I can analyze your data."
    )
    expect(violations.some((v) => v.type === "output_relevance")).toBe(true)
  })

  it("allows normal financial response", () => {
    const { violations } = runOutputRails(
      "Your total spending this month is $3,800,000 COP. The top category is Groceries at $420,000 COP."
    )
    expect(violations.some((v) => v.type === "output_relevance")).toBe(false)
  })
})

// ─── applyOutputGuardrails Integration ─────────────────────────────────────────

describe("applyOutputGuardrails — Integration", () => {
  it("returns 'allowed' for clean output", () => {
    const result = applyOutputGuardrails(
      "You spent 3.8M COP this month. Your top category is groceries."
    )
    expect(result.verdict).toBe("allowed")
    expect(result.violations).toHaveLength(0)
  })

  it("returns 'blocked' with sanitized output for sensitive data", () => {
    const result = applyOutputGuardrails("Your API key is sk-abc123456789012345678901")
    expect(result.verdict).toBe("blocked")
    expect(result.sanitizedOutput).toBeDefined()
    expect(result.sanitizedOutput).not.toContain("sk-abc123456789012345678901")
  })

  it("returns 'warning' for character break without sensitive data", () => {
    const result = applyOutputGuardrails(
      "I am an AI and don't have emotions about your finances."
    )
    expect(result.verdict).toBe("warning")
    expect(result.sanitizedOutput).toBeUndefined()
  })
})
