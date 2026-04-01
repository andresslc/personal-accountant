import { NextResponse } from "next/server"
import { extractAndMergeUserMemory } from "@/lib/ai/finance-service"
import { handleFinanceError, checkInsightsGuardrails } from "@/app/api/ai/_shared"
import { requireAuth } from "@/lib/auth-guard"

export async function POST(request: Request) {
  const { response } = await requireAuth()
  if (response) return response

  try {
    const body = await request.json()

    const blocked = checkInsightsGuardrails(body)
    if (blocked) return blocked

    const result = await extractAndMergeUserMemory({
      current_page: body?.current_page,
      user_message: body?.user_message ?? "",
      existing_user_memory: body?.existing_user_memory,
      recommendation_summary: body?.recommendation_summary,
    })
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return handleFinanceError(error)
  }
}
