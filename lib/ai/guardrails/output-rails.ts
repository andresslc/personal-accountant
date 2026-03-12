import type { GuardrailViolation } from "./types"

const SENSITIVE_PATTERNS = [
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, label: "email address" },
  { pattern: /\b(?:sk|pk)[-_][a-zA-Z0-9]{20,}\b/g, label: "API key" },
  { pattern: /\b(eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,})/g, label: "JWT token" },
  { pattern: /\bsupabase[_\s]*(?:url|key|secret|anon)[:\s]*\S+/gi, label: "Supabase credential" },
  { pattern: /\b(?:OPENAI|GEMINI|AI)_(?:API_)?KEY[=:\s]+\S+/gi, label: "AI provider key" },
  { pattern: /\bpassword[=:\s]+\S+/gi, label: "password" },
  { pattern: /\bpostgres(?:ql)?:\/\/[^\s]+/gi, label: "database connection string" },
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, label: "credit card number" },
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, label: "SSN-like number" },
]

const OFF_CHARACTER_PATTERNS = [
  /i('m| am) (just )?an? (ai|language model|llm|chatbot|artificial intelligence)/i,
  /as an ai(,| )? i (can't|cannot|don't|do not)/i,
  /i don'?t have (personal )?(feelings|emotions|opinions|beliefs)/i,
  /i('m| am) not (a )?(real|human|actual) (person|being)/i,
]

export function runOutputRails(output: string): {
  violations: GuardrailViolation[]
  sanitizedOutput: string
} {
  const violations: GuardrailViolation[] = []
  let sanitized = output

  for (const { pattern, label } of SENSITIVE_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags)
    if (regex.test(sanitized)) {
      violations.push({
        type: "sensitive_data_leak",
        rail: "output_sensitive_data",
        message: `Output contained ${label} — redacted.`,
        confidence: 0.95,
      })
      sanitized = sanitized.replace(
        new RegExp(pattern.source, pattern.flags),
        `[REDACTED ${label.toUpperCase()}]`
      )
    }
  }

  for (const pattern of OFF_CHARACTER_PATTERNS) {
    if (pattern.test(sanitized)) {
      violations.push({
        type: "output_relevance",
        rail: "output_character",
        message: "Output broke financial assistant character.",
        confidence: 0.7,
      })
      break
    }
  }

  return { violations, sanitizedOutput: sanitized }
}
