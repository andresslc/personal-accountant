import { createClient } from "@/lib/supabase/server"
import { getChatHistory, clearChatHistory } from "@/lib/data/chat-history"

export const runtime = "nodejs"

export async function GET() {
  try {
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

    const messages = await getChatHistory(supabase, user.id)
    return new Response(JSON.stringify({ messages }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Chat history GET error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to load chat history" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

export async function DELETE() {
  try {
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

    const ok = await clearChatHistory(supabase, user.id)
    return new Response(JSON.stringify({ success: ok }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Chat history DELETE error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to clear chat history" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
