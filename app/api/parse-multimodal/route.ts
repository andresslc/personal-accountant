import { NextResponse } from "next/server"
import { runMultimodalGraph } from "@/lib/ai/multimodal-graph"
import { applyInputGuardrails } from "@/lib/ai/guardrails"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const type = formData.get("type") as string | null
    const text = formData.get("text") as string | null
    const file = formData.get("file") as File | null

    if (!type || !["text", "image", "audio"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Field 'type' is required (text, image, or audio)." },
        { status: 400 }
      )
    }

    if (type === "text" && (!text || !text.trim())) {
      return NextResponse.json(
        { success: false, error: "Text input is required." },
        { status: 400 }
      )
    }

    if (text) {
      const guardrailResult = applyInputGuardrails(text, "multimodal")
      if (guardrailResult.verdict === "blocked") {
        return NextResponse.json(
          { success: false, error: guardrailResult.userFacingMessage },
          { status: 400 }
        )
      }
    }

    if ((type === "image" || type === "audio") && !file) {
      return NextResponse.json(
        { success: false, error: `A file is required for ${type} input.` },
        { status: 400 }
      )
    }

    let imageBase64: string | undefined
    let imageMimeType: string | undefined
    let audioBuffer: Buffer | undefined
    let audioMimeType: string | undefined

    if (type === "image" && file) {
      const arrayBuffer = await file.arrayBuffer()
      imageBase64 = Buffer.from(arrayBuffer).toString("base64")
      imageMimeType = file.type
    }

    if (type === "audio" && file) {
      const arrayBuffer = await file.arrayBuffer()
      audioBuffer = Buffer.from(arrayBuffer)
      audioMimeType = file.type
    }

    const result = await runMultimodalGraph({
      type: type as "text" | "image" | "audio",
      text: text ?? undefined,
      imageBase64,
      imageMimeType,
      audioBuffer,
      audioMimeType,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("parse-multimodal error:", error)

    const message =
      error instanceof Error ? error.message : "Failed to parse input. Please try again."

    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
