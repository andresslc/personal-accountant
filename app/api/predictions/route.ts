import { NextResponse } from "next/server"
import { z } from "zod"
import { getTransactions, getBudgets, getDebts } from "@/lib/data/dashboard-data"
import { generatePredictions, type PredictionType } from "@/lib/predictions"
import { requireAuth } from "@/lib/auth-guard"

const PredictionRequestSchema = z.object({
  prediction_types: z
    .array(
      z.enum([
        "spending_forecast",
        "budget_adherence",
        "debt_payoff",
        "savings_projection",
        "anomaly_detection",
        "spending_diagnosis",
      ])
    )
    .optional(),
})

async function fetchAndPredict(predictionTypes?: PredictionType[]) {
  const [transactions, budgets, debts] = await Promise.all([
    getTransactions(),
    getBudgets(),
    getDebts(),
  ])

  const txData = transactions.map((t) => ({
    date: t.date,
    category: t.category,
    type: t.type,
    amount: t.amount,
    description: t.description,
  }))

  const budgetData = budgets.map((b) => ({
    category: b.category,
    limit: b.limit,
    spent: b.spent,
  }))

  const debtData = debts.map((d) => ({
    name: d.name,
    currentBalance: d.currentBalance,
    apr: d.apr,
    minPayment: d.minPayment,
  }))

  return generatePredictions(txData, budgetData, debtData, predictionTypes)
}

export async function POST(request: Request) {
  const { response } = await requireAuth()
  if (response) return response

  try {
    const body = await request.json().catch(() => ({}))
    const parsed = PredictionRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid request.", retryable: false } },
        { status: 400 }
      )
    }

    const predictions = await fetchAndPredict(parsed.data.prediction_types as PredictionType[] | undefined)
    return NextResponse.json({ success: true, data: predictions })
  } catch (error) {
    console.error("predictions error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to generate predictions.", retryable: true } },
      { status: 500 }
    )
  }
}

export async function GET() {
  const { response } = await requireAuth()
  if (response) return response

  try {
    const predictions = await fetchAndPredict()
    return NextResponse.json({ success: true, data: predictions })
  } catch (error) {
    console.error("predictions error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to generate predictions.", retryable: true } },
      { status: 500 }
    )
  }
}
