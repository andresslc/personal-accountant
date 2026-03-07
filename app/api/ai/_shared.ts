import { NextResponse } from "next/server"
import { FinanceInsightsError } from "@/lib/ai/finance-service"
import type { FinanceErrorResponse } from "@/lib/ai/finance-types"

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
