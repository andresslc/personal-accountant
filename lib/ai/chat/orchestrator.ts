import type { SupabaseClient } from "@supabase/supabase-js"
import { Annotation, StateGraph, START, END } from "@langchain/langgraph"
import type { LangGraphRunnableConfig } from "@langchain/langgraph"
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch"
import { getAIProvider } from "@/lib/ai/provider"
import type { ChatMessageInput } from "@/lib/ai/provider"
import { buildOrchestratorPrompt } from "./prompts"
import { buildFinancialContext } from "./context-builder"
import { toolDefinitions, executeTool } from "./tools"
import { runDebtAgent } from "./agents/debt-agent"
import { runAdvisoryAgent } from "./agents/advisory-agent"
import { runPredictionAgent } from "./agents/prediction-agent"
import { applyOutputGuardrails } from "@/lib/ai/guardrails"
import type { StreamEvent, FinancialContext } from "./types"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>

interface OrchestratorInput {
  messages: Array<{ role: "user" | "assistant"; content: string }>
  userId: string
  recentSummaries?: string[]
  supabase?: AnySupabaseClient
}

const MAX_TOOL_ROUNDS = 5
const STREAM_EVENT_NAME = "finflow:stream"

// Annotation.Root defines the graph's state schema. Fields without a reducer
// use LastValue (replace-on-write), which is what we want for all of these.
// `messages` grows across rounds so it uses a concat reducer.
const OrchestratorState = Annotation.Root({
  userInput: Annotation<OrchestratorInput>,
  messages: Annotation<ChatMessageInput[]>({
    reducer: (left, right) => (right ? left.concat(right) : left),
    default: () => [],
  }),
  context: Annotation<FinancialContext | null>({
    reducer: (_left, right) => right,
    default: () => null,
  }),
  round: Annotation<number>({
    reducer: (_left, right) => right,
    default: () => 0,
  }),
  lastRoundHadToolCalls: Annotation<boolean>({
    reducer: (_left, right) => right,
    default: () => false,
  }),
  lastRoundText: Annotation<string>({
    reducer: (_left, right) => right,
    default: () => "",
  }),
  finalText: Annotation<string>({
    reducer: (_left, right) => right,
    default: () => "",
  }),
})

type OrchestratorStateType = typeof OrchestratorState.State

type AssistantToolCall = {
  id: string
  type: "function"
  function: { name: string; arguments: string }
}

async function dispatch(event: StreamEvent, config?: LangGraphRunnableConfig) {
  await dispatchCustomEvent(STREAM_EVENT_NAME, event, config)
}

async function buildContextNode(
  state: OrchestratorStateType
): Promise<Partial<OrchestratorStateType>> {
  const input = state.userInput
  const context = await buildFinancialContext(input.recentSummaries ?? [])
  const systemPrompt = buildOrchestratorPrompt(context)

  const seededMessages: ChatMessageInput[] = [
    { role: "system", content: systemPrompt },
    ...input.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ]

  // We return the full messages array — reducer concatenates onto the empty
  // default, so the resulting state has exactly these messages.
  return {
    context,
    messages: seededMessages,
  }
}

async function agentRoundNode(
  state: OrchestratorStateType,
  config?: LangGraphRunnableConfig
): Promise<Partial<OrchestratorStateType>> {
  const provider = getAIProvider()
  const stream = await provider.streamChatWithTools(state.messages, toolDefinitions)

  let fullText = ""
  const toolCalls = new Map<string, { name: string; arguments: string }>()
  let hasToolCalls = false

  for await (const chunk of stream) {
    if (chunk.type === "text") {
      fullText += chunk.content
      await dispatch({ type: "text", content: chunk.content }, config)
    } else if (chunk.type === "tool_call") {
      hasToolCalls = true
      toolCalls.set(chunk.id, { name: chunk.name, arguments: chunk.arguments ?? "" })
    } else if (chunk.type === "tool_call_delta") {
      const existing = toolCalls.get(chunk.id)
      if (existing) {
        existing.arguments += chunk.arguments
      }
    }
  }

  const assistantToolCalls: AssistantToolCall[] = Array.from(toolCalls.entries()).map(
    ([id, tc]) => ({
      id,
      type: "function" as const,
      function: { name: tc.name, arguments: tc.arguments },
    })
  )

  const appendedMessages: ChatMessageInput[] = [
    {
      role: "assistant",
      content: fullText || "",
      ...(assistantToolCalls.length > 0 ? { tool_calls: assistantToolCalls } : {}),
    },
  ]

  return {
    messages: appendedMessages,
    round: state.round + 1,
    lastRoundHadToolCalls: hasToolCalls,
    lastRoundText: fullText,
    finalText: state.finalText + fullText,
  }
}

async function executeToolsNode(
  state: OrchestratorStateType,
  config?: LangGraphRunnableConfig
): Promise<Partial<OrchestratorStateType>> {
  const input = state.userInput
  const lastAssistant = [...state.messages].reverse().find((m) => m.role === "assistant")
  const toolCalls = lastAssistant?.tool_calls ?? []

  const appendedMessages: ChatMessageInput[] = []

  for (const call of toolCalls) {
    const callId = call.id
    const name = call.function.name
    const rawArgs = call.function.arguments

    let args: Record<string, unknown>
    try {
      args = JSON.parse(rawArgs)
    } catch {
      appendedMessages.push({
        role: "tool",
        content: "Invalid JSON arguments",
        tool_call_id: callId,
      })
      continue
    }

    if (name === "route_to_sub_agent") {
      const agentName = args.agent as string
      const taskDesc = args.task_description as string
      const subAgentResult = await runSubAgent(
        agentName,
        taskDesc,
        state.context,
        config
      )
      appendedMessages.push({
        role: "tool",
        content: subAgentResult,
        tool_call_id: callId,
      })
      continue
    }

    try {
      const result = await executeTool(name, args, input.userId, input.supabase)
      if (result.action) {
        await dispatch(result.action, config)
      }
      appendedMessages.push({
        role: "tool",
        content: result.content,
        tool_call_id: callId,
      })
    } catch (toolError) {
      const errorMsg =
        toolError instanceof Error ? toolError.message : "Tool execution failed"
      appendedMessages.push({
        role: "tool",
        content: `Error executing ${name}: ${errorMsg}`,
        tool_call_id: callId,
      })
    }
  }

  return { messages: appendedMessages }
}

async function outputGuardrailsNode(
  state: OrchestratorStateType,
  config?: LangGraphRunnableConfig
): Promise<Partial<OrchestratorStateType>> {
  const text = state.lastRoundText
  if (!text) return {}

  const outputCheck = applyOutputGuardrails(text)
  if (outputCheck.sanitizedOutput && outputCheck.sanitizedOutput !== text) {
    await dispatch(
      { type: "text", content: "\n\n[Some content was redacted for security.]" },
      config
    )
  }
  return {}
}

async function runSubAgent(
  agentName: string,
  taskDescription: string,
  context: FinancialContext | null,
  config?: LangGraphRunnableConfig
): Promise<string> {
  if (!context) {
    return "Sub-agent unavailable: missing financial context."
  }

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

  let fullText = ""
  for await (const event of agentFn(taskDescription, context)) {
    if (event.type === "text") {
      fullText += event.content
      await dispatch(event, config)
    } else if (event.type === "error") {
      await dispatch(event, config)
      return event.message
    }
  }
  return fullText
}

function routeAfterAgentRound(
  state: OrchestratorStateType
): "executeTools" | "outputGuardrails" {
  if (state.lastRoundHadToolCalls && state.round < MAX_TOOL_ROUNDS) {
    return "executeTools"
  }
  return "outputGuardrails"
}

function buildOrchestratorGraph() {
  const builder = new StateGraph(OrchestratorState)
    .addNode("buildContext", buildContextNode)
    .addNode("agentRound", agentRoundNode)
    .addNode("executeTools", executeToolsNode)
    .addNode("outputGuardrails", outputGuardrailsNode)
    .addEdge(START, "buildContext")
    .addEdge("buildContext", "agentRound")
    .addConditionalEdges("agentRound", routeAfterAgentRound, {
      executeTools: "executeTools",
      outputGuardrails: "outputGuardrails",
    })
    .addEdge("executeTools", "agentRound")
    .addEdge("outputGuardrails", END)

  return builder.compile()
}

let cachedGraph: ReturnType<typeof buildOrchestratorGraph> | null = null
function getGraph() {
  if (!cachedGraph) cachedGraph = buildOrchestratorGraph()
  return cachedGraph
}

export async function* runOrchestrator(
  input: OrchestratorInput
): AsyncGenerator<StreamEvent> {
  const graph = getGraph()

  // Recursion limit must cover: buildContext + (agentRound + executeTools) *
  // MAX_TOOL_ROUNDS + outputGuardrails. Give it a generous cushion so the
  // orchestrator never trips LangGraph's default limit (25) as we scale rounds.
  const recursionLimit = 4 + MAX_TOOL_ROUNDS * 2 + 10

  const events = graph.streamEvents(
    { userInput: input },
    { version: "v2", recursionLimit }
  )

  for await (const ev of events) {
    if (ev.event === "on_custom_event" && ev.name === STREAM_EVENT_NAME) {
      const payload = ev.data as StreamEvent
      yield payload
    }
  }

  yield { type: "done" }
}
