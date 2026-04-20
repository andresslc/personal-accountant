// @ts-expect-error -- promptfoo type name varies by version
import type { AssertionResult } from "promptfoo"

export default async function zodValidator(
  output: string,
  context: { vars?: Record<string, string> }
): Promise<AssertionResult> {
  const schemaName = context.vars?.schema ?? "ParsedTransactionSchema"

  try {
    const parsed = JSON.parse(output)

    let schema
    switch (schemaName) {
      case "ParsedTransactionSchema": {
        const mod = await import("@/lib/ai/types")
        schema = mod.ParsedTransactionSchema
        break
      }
      case "MultimodalParseResultSchema": {
        const mod = await import("@/lib/ai/multimodal-types")
        schema = mod.MultimodalParseResultSchema
        break
      }
      case "MultimodalParseResultsSchema": {
        const mod = await import("@/lib/ai/multimodal-types")
        schema = mod.MultimodalParseResultsSchema
        break
      }
      case "FinanceInsightsDataSchema": {
        const mod = await import("@/lib/ai/finance-types")
        schema = mod.FinanceInsightsDataSchema
        break
      }
      default:
        return { pass: false, reason: `Unknown schema: ${schemaName}` }
    }

    const result = schema.safeParse(parsed)
    if (result.success) {
      return { pass: true }
    }

    const issues = result.error.issues
      .map((i: { path: (string | number)[]; message: string }) => `${i.path.join(".")}: ${i.message}`)
      .join("; ")

    return { pass: false, reason: `Zod validation failed: ${issues}` }
  } catch (error) {
    return {
      pass: false,
      reason: `Failed to parse output as JSON: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
