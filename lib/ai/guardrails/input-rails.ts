import { GUARDRAILS_CONFIG } from "./config"
import type { GuardrailViolation, RailCheckFn } from "./types"

const checkPromptInjection: RailCheckFn = {
  name: "prompt_injection",
  check(input: string): GuardrailViolation | null {
    for (const pattern of GUARDRAILS_CONFIG.promptInjectionPatterns) {
      if (pattern.test(input)) {
        return {
          type: "prompt_injection",
          rail: "prompt_injection",
          message: "Prompt injection attempt detected.",
          confidence: 0.95,
        }
      }
    }

    const lowered = input.toLowerCase()
    const injectionPhrases = [
      "ignore everything above",
      "ignore all above",
      "disregard everything",
      "forget everything",
      "start new conversation",
      "new system prompt",
      "you are chatgpt",
      "you are gpt",
      "respond as if",
      "from now on you will",
      "from now on, you",
    ]
    for (const phrase of injectionPhrases) {
      if (lowered.includes(phrase)) {
        return {
          type: "prompt_injection",
          rail: "prompt_injection",
          message: "Prompt injection attempt detected.",
          confidence: 0.9,
        }
      }
    }

    return null
  },
}

const checkJailbreak: RailCheckFn = {
  name: "jailbreak",
  check(input: string): GuardrailViolation | null {
    const lowered = input.toLowerCase()

    const jailbreakPhrases = [
      "do anything now",
      "dan mode",
      "developer mode enabled",
      "jailbreak",
      "unfiltered mode",
      "god mode",
      "chaos mode",
      "unrestricted mode",
      "no ethical guidelines",
      "no content policy",
      "ignore your programming",
      "ignore your training",
      "break character",
      "evil mode",
      "opposite mode",
      "hypothetically, if you had no restrictions",
      "in a fictional world where you have no rules",
    ]

    for (const phrase of jailbreakPhrases) {
      if (lowered.includes(phrase)) {
        return {
          type: "jailbreak",
          rail: "jailbreak",
          message: "Jailbreak attempt detected.",
          confidence: 0.95,
        }
      }
    }

    const roleplayPattern = /(?:roleplay|role-play|pretend|act)\s+as\s+(?:a\s+)?(?:hacker|criminal|thief|scammer|evil|malicious|unrestricted|unfiltered)/i
    if (roleplayPattern.test(input)) {
      return {
        type: "jailbreak",
        rail: "jailbreak",
        message: "Jailbreak via roleplay detected.",
        confidence: 0.9,
      }
    }

    return null
  },
}

const checkOffTopic: RailCheckFn = {
  name: "off_topic",
  check(input: string): GuardrailViolation | null {
    for (const { pattern, topic } of GUARDRAILS_CONFIG.blockedTopicPatterns) {
      if (pattern.test(input)) {
        return {
          type: "off_topic",
          rail: "off_topic",
          message: `Off-topic request detected: ${topic}.`,
          confidence: 0.85,
        }
      }
    }

    const lowered = input.toLowerCase().trim()
    if (lowered.length < 3) return null

    const hasFinanceKeyword = GUARDRAILS_CONFIG.allowedTopicKeywords.some(
      (keyword) => lowered.includes(keyword.toLowerCase())
    )

    if (hasFinanceKeyword) return null

    const words = lowered.split(/\s+/)
    if (words.length <= 4) return null

    const hasNumbers = /\d/.test(input)
    const hasCurrency = /[\$\€]|\bcop\b|\bpesos?\b|\busd\b/i.test(input)
    if (hasNumbers || hasCurrency) return null

    if (words.length > 15) {
      return {
        type: "off_topic",
        rail: "off_topic",
        message: "Message does not appear to be related to personal finance.",
        confidence: 0.6,
      }
    }

    return null
  },
}

const checkHarmfulContent: RailCheckFn = {
  name: "harmful_content",
  check(input: string): GuardrailViolation | null {
    for (const pattern of GUARDRAILS_CONFIG.harmfulContentPatterns) {
      if (pattern.test(input)) {
        return {
          type: "harmful_content",
          rail: "harmful_content",
          message: "Request involves potentially fraudulent or harmful financial activity.",
          confidence: 0.9,
        }
      }
    }
    return null
  },
}

const checkDataExfiltration: RailCheckFn = {
  name: "data_exfiltration",
  check(input: string): GuardrailViolation | null {
    for (const pattern of GUARDRAILS_CONFIG.dataExfiltrationPatterns) {
      if (pattern.test(input)) {
        return {
          type: "data_exfiltration",
          rail: "data_exfiltration",
          message: "Attempt to access restricted data detected.",
          confidence: 0.9,
        }
      }
    }
    return null
  },
}

function checkLength(input: string, maxLength: number): GuardrailViolation | null {
  if (input.length > maxLength) {
    return {
      type: "excessive_length",
      rail: "input_length",
      message: `Input exceeds maximum length of ${maxLength} characters.`,
      confidence: 1.0,
    }
  }
  return null
}

export const INPUT_RAILS: RailCheckFn[] = [
  checkPromptInjection,
  checkJailbreak,
  checkDataExfiltration,
  checkHarmfulContent,
  checkOffTopic,
]

export function runInputRails(
  input: string,
  options?: { maxLength?: number }
): GuardrailViolation[] {
  const violations: GuardrailViolation[] = []

  const maxLen = options?.maxLength ?? GUARDRAILS_CONFIG.maxInputLength
  const lengthViolation = checkLength(input, maxLen)
  if (lengthViolation) violations.push(lengthViolation)

  for (const rail of INPUT_RAILS) {
    const violation = rail.check(input)
    if (violation) {
      violations.push(violation)
    }
  }

  return violations
}
