export type GuardrailVerdict = "allowed" | "blocked" | "warning"

export type ViolationType =
  | "prompt_injection"
  | "jailbreak"
  | "off_topic"
  | "harmful_content"
  | "data_exfiltration"
  | "excessive_length"
  | "output_relevance"
  | "sensitive_data_leak"

export interface GuardrailViolation {
  type: ViolationType
  rail: string
  message: string
  confidence: number
}

export interface GuardrailResult {
  verdict: GuardrailVerdict
  violations: GuardrailViolation[]
  sanitizedInput?: string
  userFacingMessage?: string
}

export interface OutputRailResult {
  verdict: GuardrailVerdict
  violations: GuardrailViolation[]
  sanitizedOutput?: string
}

export interface RailCheckFn {
  name: string
  check: (input: string) => GuardrailViolation | null
}
