// @ts-expect-error -- promptfoo type name varies by version
import type { AssertionResult } from "promptfoo"

export default async function groundingCheck(
  output: string,
  context: { vars?: Record<string, string> }
): Promise<AssertionResult> {
  try {
    const data = JSON.parse(output)
    const contextData = context.vars?.context ? JSON.parse(context.vars.context) : null

    if (!contextData) {
      return { pass: true }
    }

    const knownNumbers = extractNumbers(JSON.stringify(contextData))
    const outputNumbers = extractNumbers(JSON.stringify(data.recommended_actions ?? []))

    if (outputNumbers.length === 0) {
      return { pass: true }
    }

    const ungroundedNumbers: number[] = []
    for (const num of outputNumbers) {
      if (num < 100) continue

      const isGrounded = knownNumbers.some((known) => {
        if (known === num) return true
        if (Math.abs(known - num) / Math.max(known, 1) < 0.1) return true
        if (knownNumbers.some((a) => knownNumbers.some((b) => Math.abs(a + b - num) < 1))) return true
        if (knownNumbers.some((a) => knownNumbers.some((b) => b !== 0 && Math.abs(a / b - num) < 1))) return true
        if (knownNumbers.some((k) => Math.abs(k * 12 - num) < 1 || Math.abs(k / 12 - num) < 1)) return true
        return false
      })

      if (!isGrounded) {
        ungroundedNumbers.push(num)
      }
    }

    if (ungroundedNumbers.length === 0) {
      return { pass: true }
    }

    const ratio = ungroundedNumbers.length / outputNumbers.length
    if (ratio > 0.5) {
      return {
        pass: false,
        reason: `${ungroundedNumbers.length}/${outputNumbers.length} numbers in recommendations appear ungrounded: ${ungroundedNumbers.slice(0, 5).join(", ")}`,
      }
    }

    return { pass: true }
  } catch (error) {
    return {
      pass: false,
      reason: `Grounding check error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

function extractNumbers(text: string): number[] {
  const matches = text.match(/\d[\d,]*\.?\d*/g) ?? []
  return matches
    .map((m) => parseFloat(m.replace(/,/g, "")))
    .filter((n) => !isNaN(n) && n > 0)
}
