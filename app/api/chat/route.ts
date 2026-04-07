import { createClient } from "@/lib/supabase/server"
import { runOrchestrator } from "@/lib/ai/chat/orchestrator"
import { getAIProvider } from "@/lib/ai/provider"
import { buildSummaryPrompt } from "@/lib/ai/chat/prompts"
import { applyConversationGuardrails, applyInputGuardrails } from "@/lib/ai/guardrails"
import { saveChatMessage } from "@/lib/data/chat-history"
import type { StreamEvent, ActionEvent } from "@/lib/ai/chat/types"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

export const runtime = "nodejs"
export const maxDuration = 60

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || ""
    let action: string | null = null
    let messages: Array<{ role: "user" | "assistant"; content: string }> = []
    let audioFile: File | null = null
    let imageFile: File | null = null
    let textContent: string | null = null

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      action = formData.get("action") as string | null
      const messagesRaw = formData.get("messages") as string | null
      if (messagesRaw) {
        messages = JSON.parse(messagesRaw)
      }
      audioFile = formData.get("audio") as File | null
      imageFile = formData.get("image") as File | null
      textContent = formData.get("text") as string | null
    } else {
      const body = await request.json()
      action = body.action ?? null
      messages = body.messages ?? []
      textContent = body.text ?? null
    }

    if (textContent) {
      const inputCheck = applyInputGuardrails(textContent, "chat")
      if (inputCheck.verdict === "blocked") {
        return new Response(
          JSON.stringify({ error: inputCheck.userFacingMessage }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        )
      }
    }

    const conversationCheck = applyConversationGuardrails(messages)
    if (conversationCheck.verdict === "blocked") {
      return new Response(
        JSON.stringify({ error: conversationCheck.userFacingMessage }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    const userId = user.id

    if (action === "summarize") {
      return handleSummarize(messages, userId, supabase)
    }

    if (audioFile && audioFile.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "Audio file too large. Maximum size is 10 MB." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    if (imageFile && imageFile.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "Image file too large. Maximum size is 10 MB." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    if (audioFile) {
      const provider = getAIProvider()
      const arrayBuffer = await audioFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const transcription = await provider.transcribeAudio(buffer, audioFile.type)

      messages.push({ role: "user", content: transcription })

      await saveChatMessage(supabase, userId, {
        role: "user",
        content: transcription,
        transcription,
      })

      return streamOrchestrator(supabase, userId, messages, transcription)
    }

    let lastUserContent: string | null = null
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString("base64")
      const caption = textContent || "Analyze this image for financial information"
      const imageMsg = `[Image attached: ${imageFile.type}]\n${caption}\n[base64:${base64.slice(0, 100)}...]`

      messages.push({ role: "user", content: imageMsg })
      lastUserContent = caption
    } else if (textContent) {
      messages.push({ role: "user", content: textContent })
      lastUserContent = textContent
    }

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (lastUserContent) {
      await saveChatMessage(supabase, userId, {
        role: "user",
        content: lastUserContent,
      })
    }

    return streamOrchestrator(supabase, userId, messages)
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

function streamOrchestrator(
  supabase: SupabaseClient<Database>,
  userId: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  transcription?: string
) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let assistantText = ""
      let lastAction: ActionEvent | undefined

      if (transcription) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "transcription", text: transcription })}\n\n`
          )
        )
      }

      try {
        const orchestratorStream = runOrchestrator({
          messages,
          userId,
        })

        for await (const event of orchestratorStream) {
          if (event.type === "text") {
            assistantText += event.content
          } else if (event.type === "action") {
            lastAction = event
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          )
        }
      } catch (error) {
        const errorEvent: StreamEvent = {
          type: "error",
          message: error instanceof Error ? error.message : "Orchestrator error",
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`)
        )
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        )
      }

      if (assistantText) {
        try {
          await saveChatMessage(supabase, userId, {
            role: "assistant",
            content: assistantText,
            action: lastAction
              ? (lastAction as unknown as Record<string, unknown>)
              : null,
          })
        } catch (err) {
          console.error("Failed to persist assistant message:", err)
        }
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

async function handleSummarize(
  messages: Array<{ role: string; content: string }>,
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
) {
  try {
    const provider = getAIProvider()
    const conversationText = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n")

    const result = await provider.generateStructured({
      systemPrompt: buildSummaryPrompt(),
      userPrompt: conversationText,
      schema: (await import("zod")).z.object({
        summary: (await import("zod")).z.string(),
        topics: (await import("zod")).z.array((await import("zod")).z.string()),
      }),
    })

    if (supabase) {
      await supabase.from("chat_summaries").insert({
        user_id: userId,
        summary: result.summary,
        topics: result.topics,
        actions_taken: [],
        message_count: messages.length,
      })
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Summarize error:", error)
    return new Response(
      JSON.stringify({ success: false, error: "Failed to summarize" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
