import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { runOrchestrator } from "@/lib/ai/chat/orchestrator"
import { getAIProvider } from "@/lib/ai/provider"
import { buildSummaryPrompt } from "@/lib/ai/chat/prompts"
import { applyConversationGuardrails, applyInputGuardrails } from "@/lib/ai/guardrails"
import { saveChatMessage } from "@/lib/data/chat-history"
import { USE_MOCK_DATA } from "@/lib/config/data-source"
import { DEFAULT_ARCHETYPE_ID, DEMO_ARCHETYPE_COOKIE } from "@/lib/mocks/archetypes"
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

    // In demo (mock) mode there's no Supabase auth session — the archetype
    // cookie stands in for the user. Synthesize a stable userId from it so
    // no-op persistence helpers still receive a deterministic key.
    let supabase: SupabaseClient<Database>
    let userId: string
    if (USE_MOCK_DATA) {
      const store = await cookies()
      const archetypeId = store.get(DEMO_ARCHETYPE_COOKIE)?.value ?? DEFAULT_ARCHETYPE_ID
      userId = `demo-${archetypeId}`
      // createClient still works without a session; chat-history helpers
      // short-circuit on USE_MOCK_DATA so the client is never actually hit.
      supabase = await createClient()
    } else {
      supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        )
      }

      userId = user.id
    }

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
      const cleanTranscription = transcription.trim()

      if (!cleanTranscription) {
        return new Response(
          JSON.stringify({
            error:
              "We couldn't hear anything clearly. Try recording again, speak a bit closer to your microphone, and make sure it's not muted.",
          }),
          { status: 422, headers: { "Content-Type": "application/json" } }
        )
      }

      messages.push({ role: "user", content: cleanTranscription })

      await saveChatMessage(supabase, userId, {
        role: "user",
        content: cleanTranscription,
        transcription: cleanTranscription,
      })

      return streamOrchestrator(supabase, userId, messages, cleanTranscription)
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
    } else {
      // Fallback: the client sent the full history via `messages` with no
      // separate `text` field. Persist the most recent user message so the
      // stored history matches what the UI shows.
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")
      if (lastUserMsg) {
        lastUserContent = lastUserMsg.content
      }
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
      const actions: ActionEvent[] = []

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
          supabase,
        })

        for await (const event of orchestratorStream) {
          if (event.type === "text") {
            assistantText += event.content
          } else if (event.type === "action") {
            actions.push(event)
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
            actions:
              actions.length > 0
                ? (actions as unknown as Record<string, unknown>[])
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

    if (supabase && !USE_MOCK_DATA) {
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
