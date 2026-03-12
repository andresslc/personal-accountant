import { NextResponse } from "next/server"
import { FinanceInsightsError } from "@/lib/ai/finance-service"
import type { FinanceErrorResponse } from "@/lib/ai/finance-types"
import { applyInputGuardrails } from "@/lib/ai/guardrails"

export const createFinanceErrorResponse = (
  code: FinanceErrorResponse["error"]["code"],
  message: string,
  retryable: boolean,
  status: number
) => {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        retryable,
      },
    } satisfies FinanceErrorResponse,
    { status }
  )
}

export const handleFinanceError = (error: unknown) => {
  if (error instanceof FinanceInsightsError) {
    return createFinanceErrorResponse(error.code, error.message, error.retryable, error.status)
  }

  return createFinanceErrorResponse(
    "PROVIDER_ERROR",
    "Unexpected error while generating finance insights.",
    true,
    500
  )
}

export const checkInsightsGuardrails = (body: Record<string, unknown>) => {
  const userText = (body.user_message ?? body.prompt ?? "") as string
  if (!userText) return null

  const result = applyInputGuardrails(userText, "insights")
  if (result.verdict === "blocked") {
    return createFinanceErrorResponse(
      "VALIDATION_ERROR",
      result.userFacingMessage ?? "Request blocked by content guardrails.",
      false,
      400
    )
  }
  return null
}
