import { NextResponse } from "next/server"
import { z } from "zod"
import { getTransactions, getBudgets, getDebts } from "@/lib/data/dashboard-data"
import { generatePredictions, type PredictionType } from "@/lib/predictions"

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

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = PredictionRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid request.", retryable: false } },
        { status: 400 }
      )
    }

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

    const predictions = generatePredictions(
      txData,
      budgetData,
      debtData,
      parsed.data.prediction_types as PredictionType[] | undefined
    )

    return NextResponse.json({ success: true, data: predictions })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
          retryable: true,
        },
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
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

    const predictions = generatePredictions(txData, budgetData, debtData)

    return NextResponse.json({ success: true, data: predictions })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
          retryable: true,
        },
      },
      { status: 500 }
    )
  }
}
