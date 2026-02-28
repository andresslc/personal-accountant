import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { getAIProvider } from "@/lib/ai/provider"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const text = body?.text?.trim()

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Transaction text is required" },
        { status: 400 }
      )
    }

    const provider = getAIProvider()
    const data = await provider.parse(text)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "AI returned invalid data. Please try rephrasing." },
        { status: 422 }
      )
    }

    console.error("parse-transaction error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to parse transaction. Please try again." },
      { status: 500 }
    )
  }
}
