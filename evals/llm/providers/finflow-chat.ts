import type { ApiProvider, ProviderResponse } from "promptfoo"

export default class FinflowChatProvider implements ApiProvider {
  private providerName: string

  constructor(options: { config?: { provider?: string } } = {}) {
    this.providerName = options.config?.provider ?? "openai"
  }

  id() {
    return `finflow-chat:${this.providerName}`
  }

  async callApi(prompt: string): Promise<ProviderResponse> {
    process.env.AI_PROVIDER = this.providerName
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = "true"

    try {
      const { getAIProvider } = await import("@/lib/ai/provider")
      const { buildOrchestratorPrompt } = await import("@/lib/ai/chat/prompts")
      const { toolDefinitions } = await import("@/lib/ai/chat/tools")

      const context = (await import("../../fixtures/financial-context")).FROZEN_FINANCIAL_CONTEXT
      const provider = getAIProvider()

      const systemPrompt = buildOrchestratorPrompt(context)
      const messages = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: prompt },
      ]

      const stream = await provider.streamChatWithTools(messages, toolDefinitions)
      const toolCalls: Array<{ name: string; arguments: string }> = []
      let textContent = ""

      for await (const chunk of stream) {
        if (chunk.type === "text") {
          textContent += chunk.content
        } else if (chunk.type === "tool_call") {
          toolCalls.push({ name: chunk.name, arguments: chunk.arguments })
        } else if (chunk.type === "done") {
          break
        }
      }

      const output = {
        text: textContent,
        tool_calls: toolCalls,
      }

      return {
        output: JSON.stringify(output),
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }
}
