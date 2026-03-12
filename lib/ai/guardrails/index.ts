import { GUARDRAILS_CONFIG } from "./config"
import { runInputRails } from "./input-rails"
import { runOutputRails } from "./output-rails"
import type {
  GuardrailResult,
  GuardrailViolation,
  OutputRailResult,
  ViolationType,
} from "./types"

export type { GuardrailResult, OutputRailResult, GuardrailViolation, ViolationType }

type InputContext = "chat" | "transaction" | "multimodal" | "insights"

const MAX_LENGTHS: Record<InputContext, number> = {
  chat: GUARDRAILS_CONFIG.maxChatMessageLength,
  transaction: GUARDRAILS_CONFIG.maxTransactionTextLength,
  multimodal: GUARDRAILS_CONFIG.maxInputLength,
  insights: GUARDRAILS_CONFIG.maxInputLength,
}

const BLOCKING_TYPES: ViolationType[] = [
  "prompt_injection",
  "jailbreak",
  "harmful_content",
  "data_exfiltration",
  "excessive_length",
]

function getUserFacingMessage(violations: GuardrailViolation[]): string {
  const blocking = violations.find((v) => BLOCKING_TYPES.includes(v.type))
  if (blocking) {
    const template =
      GUARDRAILS_CONFIG.userFacingMessages[
        blocking.type as keyof typeof GUARDRAILS_CONFIG.userFacingMessages
      ] ?? GUARDRAILS_CONFIG.userFacingMessages.off_topic

    if (blocking.type === "excessive_length") {
      return template.replace("{maxLength}", String(GUARDRAILS_CONFIG.maxInputLength))
    }
    return template
  }

  const offTopic = violations.find((v) => v.type === "off_topic")
  if (offTopic && offTopic.confidence >= 0.8) {
    return GUARDRAILS_CONFIG.userFacingMessages.off_topic
  }

  return GUARDRAILS_CONFIG.userFacingMessages.off_topic
}

export function applyInputGuardrails(
  input: string,
  context: InputContext = "chat"
): GuardrailResult {
  const maxLength = MAX_LENGTHS[context]
  const violations = runInputRails(input, { maxLength })

  if (violations.length === 0) {
    return { verdict: "allowed", violations: [] }
  }

  const hasBlocking = violations.some(
    (v) => BLOCKING_TYPES.includes(v.type) || (v.type === "off_topic" && v.confidence >= 0.8)
  )

  if (hasBlocking) {
    return {
      verdict: "blocked",
      violations,
      userFacingMessage: getUserFacingMessage(violations),
    }
  }

  return {
    verdict: "warning",
    violations,
  }
}

export function applyOutputGuardrails(output: string): OutputRailResult {
  const { violations, sanitizedOutput } = runOutputRails(output)

  if (violations.length === 0) {
    return { verdict: "allowed", violations: [] }
  }

  const hasSensitiveLeak = violations.some((v) => v.type === "sensitive_data_leak")

  return {
    verdict: hasSensitiveLeak ? "blocked" : "warning",
    violations,
    sanitizedOutput: hasSensitiveLeak ? sanitizedOutput : undefined,
  }
}

export function applyConversationGuardrails(
  messages: Array<{ role: string; content: string }>
): GuardrailResult {
  const userMessages = messages.filter((m) => m.role === "user")
  if (userMessages.length === 0) {
    return { verdict: "allowed", violations: [] }
  }

  const lastUserMessage = userMessages[userMessages.length - 1]
  const result = applyInputGuardrails(lastUserMessage.content, "chat")

  if (result.verdict !== "allowed") return result

  const allUserText = userMessages.map((m) => m.content).join(" ")
  const totalLength = allUserText.length
  if (totalLength > GUARDRAILS_CONFIG.maxInputLength * 3) {
    return {
      verdict: "blocked",
      violations: [
        {
          type: "excessive_length",
          rail: "conversation_length",
          message: "Total conversation input exceeds safe limits.",
          confidence: 1.0,
        },
      ],
      userFacingMessage: "The conversation has become too long. Please start a new chat session.",
    }
  }

  return { verdict: "allowed", violations: [] }
}
