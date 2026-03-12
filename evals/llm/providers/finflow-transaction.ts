import type { ApiProvider, ProviderResponse } from "promptfoo"

export default class FinflowTransactionProvider implements ApiProvider {
  private providerName: string

  constructor(options: { config?: { provider?: string } } = {}) {
    this.providerName = options.config?.provider ?? "openai"
  }

  id() {
    return `finflow-transaction:${this.providerName}`
  }

  async callApi(prompt: string): Promise<ProviderResponse> {
    process.env.AI_PROVIDER = this.providerName
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = "true"

    try {
      const { getAIProvider } = await import("@/lib/ai/provider")
      const provider = getAIProvider()
      const result = await provider.parse(prompt)
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
