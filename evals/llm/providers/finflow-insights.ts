import type { ApiProvider, ProviderResponse } from "promptfoo"

export default class FinflowInsightsProvider implements ApiProvider {
  private providerName: string

  constructor(options: { config?: { provider?: string } } = {}) {
    this.providerName = options.config?.provider ?? "openai"
  }

  id() {
    return `finflow-insights:${this.providerName}`
  }

  async callApi(prompt: string): Promise<ProviderResponse> {
    process.env.AI_PROVIDER = this.providerName
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = "true"

    try {
      const vars = JSON.parse(prompt)
      const { getAIProvider } = await import("@/lib/ai/provider")
      const { FinanceInsightsDataSchema } = await import("@/lib/ai/finance-types")

      const provider = getAIProvider()

      const systemPrompt = `You are a financial insights analyst. Analyze the provided financial data and return structured insights.
Analysis type: ${vars.analysis_type}
Currency: COP (Colombian Pesos).`

      const userPrompt = `Financial context: ${JSON.stringify(vars.context)}
${vars.user_message ? `User question: ${vars.user_message}` : ""}`

      const result = await provider.generateStructured({
        systemPrompt,
        userPrompt,
        schema: FinanceInsightsDataSchema,
        schemaName: "FinanceInsights",
      })

      return {
        output: JSON.stringify(result),
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }
}
