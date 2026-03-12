import { NextResponse } from "next/server"
import { analyzeFinanceInsights } from "@/lib/ai/finance-service"
import { handleFinanceError, checkInsightsGuardrails } from "@/app/api/ai/_shared"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const blocked = checkInsightsGuardrails(body)
    if (blocked) return blocked

    const result = await analyzeFinanceInsights({
      ...body,
      analysis_type: "budget_recommendation",
    })
    return NextResponse.json(result)
  } catch (error) {
    return handleFinanceError(error)
  }
}
