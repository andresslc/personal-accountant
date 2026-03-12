import { getAIProvider } from "@/lib/ai/provider"
import { buildAdvisoryAgentPrompt } from "../prompts"
import type { FinancialContext, StreamEvent } from "../types"

export async function* runAdvisoryAgent(
  taskDescription: string,
  context: FinancialContext
): AsyncGenerator<StreamEvent> {
  const provider = getAIProvider()
  const systemPrompt = buildAdvisoryAgentPrompt(context)

  try {
    const stream = await provider.streamText(systemPrompt, taskDescription)
    for await (const chunk of stream) {
      yield { type: "text", content: chunk }
    }
  } catch (error) {
    yield {
      type: "error",
      message: `Advisory analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }

  yield { type: "done" }
}
