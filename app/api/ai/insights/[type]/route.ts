import { NextResponse } from "next/server"
import { analyzeFinanceInsights } from "@/lib/ai/finance-service"
import { handleFinanceError, checkInsightsGuardrails } from "@/app/api/ai/_shared"
import { requireAuth } from "@/lib/auth-guard"

const ANALYSIS_TYPES: Record<string, string | null> = {
  budget: "budget_recommendation",
  debts: "debt_strategy",
  finance: null,
  reports: "report_summary",
  transactions: "spending_diagnosis",
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { response } = await requireAuth()
  if (response) return response

  const { type } = await params

  if (!(type in ANALYSIS_TYPES)) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: `Unknown insight type: ${type}`, retryable: false } },
      { status: 404 }
    )
  }

  try {
    const body = await request.json()

    const blocked = checkInsightsGuardrails(body)
    if (blocked) return blocked

    const analysisType = ANALYSIS_TYPES[type]
    const result = await analyzeFinanceInsights(
      analysisType ? { ...body, analysis_type: analysisType } : body
    )
    return NextResponse.json(result)
  } catch (error) {
    return handleFinanceError(error)
  }
}
