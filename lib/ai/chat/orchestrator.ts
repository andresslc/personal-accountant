import { getAIProvider } from "@/lib/ai/provider"
import type { ChatMessageInput } from "@/lib/ai/provider"
import { buildOrchestratorPrompt } from "./prompts"
import { buildFinancialContext } from "./context-builder"
import { toolDefinitions, executeTool } from "./tools"
import { runDebtAgent } from "./agents/debt-agent"
import { runAdvisoryAgent } from "./agents/advisory-agent"
import { runPredictionAgent } from "./agents/prediction-agent"
import type { StreamEvent, FinancialContext } from "./types"

interface OrchestratorInput {
  messages: Array<{ role: "user" | "assistant"; content: string }>
  userId: string
  recentSummaries?: string[]
}

export async function* runOrchestrator(
  input: OrchestratorInput
): AsyncGenerator<StreamEvent> {
  const provider = getAIProvider()

  const context = await buildFinancialContext(input.recentSummaries ?? [])
  const systemPrompt = buildOrchestratorPrompt(context)

  const apiMessages: ChatMessageInput[] = [
    { role: "system", content: systemPrompt },
    ...input.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ]

  const maxToolRounds = 5
  let round = 0

  while (round < maxToolRounds) {
    round++
    const stream = await provider.streamChatWithTools(apiMessages, toolDefinitions)

    let fullText = ""
    const toolCalls = new Map<string, { name: string; arguments: string }>()
    let hasToolCalls = false

    for await (const chunk of stream) {
      if (chunk.type === "text") {
        fullText += chunk.content
        yield { type: "text", content: chunk.content }
      } else if (chunk.type === "tool_call") {
        hasToolCalls = true
        toolCalls.set(chunk.id, { name: chunk.name, arguments: "" })
      } else if (chunk.type === "tool_call_delta") {
        const existing = toolCalls.get(chunk.id)
        if (existing) {
          existing.arguments += chunk.arguments
        }
      }
    }

    if (!hasToolCalls) {
      yield { type: "done" }
      return
    }

    const assistantToolCalls = Array.from(toolCalls.entries()).map(
      ([id, tc]) => ({
        id,
        type: "function" as const,
        function: { name: tc.name, arguments: tc.arguments },
      })
    )

    apiMessages.push({
      role: "assistant",
      content: fullText || "",
      tool_calls: assistantToolCalls,
    })

    for (const [callId, tc] of toolCalls.entries()) {
      let args: Record<string, unknown>
      try {
        args = JSON.parse(tc.arguments)
      } catch {
        apiMessages.push({
          role: "tool",
          content: "Invalid JSON arguments",
          tool_call_id: callId,
        })
        continue
      }

      if (tc.name === "route_to_sub_agent") {
        const agentName = args.agent as string
        const taskDesc = args.task_description as string

        const subAgentResult = yield* runSubAgent(agentName, taskDesc, context)

        apiMessages.push({
          role: "tool",
          content: subAgentResult,
          tool_call_id: callId,
        })
      } else {
        const result = await executeTool(tc.name, args, input.userId)

        if (result.action) {
          yield result.action
        }

        apiMessages.push({
          role: "tool",
          content: result.content,
          tool_call_id: callId,
        })
      }
    }
  }

  yield { type: "done" }
}

async function* runSubAgent(
  agentName: string,
  taskDescription: string,
  context: FinancialContext
): AsyncGenerator<StreamEvent, string> {
  let fullText = ""

  const agentGenerators: Record<
    string,
    (task: string, ctx: FinancialContext) => AsyncGenerator<StreamEvent>
  > = {
    debt_agent: runDebtAgent,
    advisory_agent: runAdvisoryAgent,
    prediction_agent: runPredictionAgent,
  }

  const agentFn = agentGenerators[agentName]
  if (!agentFn) {
    return `Unknown sub-agent: ${agentName}`
  }

  for await (const event of agentFn(taskDescription, context)) {
    if (event.type === "text") {
      fullText += event.content
      yield event
    } else if (event.type === "error") {
      yield event
      return event.message
    }
  }

  return fullText
}
