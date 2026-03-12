import { getAIProvider } from "@/lib/ai/provider"
import { buildPredictionAgentPrompt } from "../prompts"
import type { FinancialContext, StreamEvent } from "../types"

export async function* runPredictionAgent(
  taskDescription: string,
  context: FinancialContext
): AsyncGenerator<StreamEvent> {
  const provider = getAIProvider()
  const systemPrompt = buildPredictionAgentPrompt(context)

  try {
    const stream = await provider.streamText(systemPrompt, taskDescription)
    for await (const chunk of stream) {
      yield { type: "text", content: chunk }
    }
  } catch (error) {
    yield {
      type: "error",
      message: `Prediction analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }

  yield { type: "done" }
}
