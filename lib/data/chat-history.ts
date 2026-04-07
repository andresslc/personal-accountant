import type { SupabaseClient } from "@supabase/supabase-js"
import { USE_MOCK_DATA } from "@/lib/config/data-source"
import type { Database, ChatMessageRow } from "@/lib/supabase/types"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>

export interface PersistedChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  action?: Record<string, unknown>
  transcription?: string
}

const MAX_HISTORY = 100

function rowToMessage(row: ChatMessageRow): PersistedChatMessage {
  return {
    id: `db-${row.id}`,
    role: row.role,
    content: row.content,
    timestamp: new Date(row.created_at).getTime(),
    action: row.action ?? undefined,
    transcription: row.transcription ?? undefined,
  }
}

export async function getChatHistory(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit: number = MAX_HISTORY
): Promise<PersistedChatMessage[]> {
  if (USE_MOCK_DATA) return []

  const client = supabase as unknown as AnyClient
  const { data, error } = await client
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[getChatHistory] Supabase error:", error.message)
    return []
  }
  if (!data) return []

  return (data as ChatMessageRow[]).reverse().map(rowToMessage)
}

export async function saveChatMessage(
  supabase: SupabaseClient<Database>,
  userId: string,
  message: {
    role: "user" | "assistant"
    content: string
    action?: Record<string, unknown> | null
    transcription?: string | null
  }
): Promise<void> {
  if (USE_MOCK_DATA) return

  const client = supabase as unknown as AnyClient
  const { error } = await client.from("chat_messages").insert({
    user_id: userId,
    role: message.role,
    content: message.content,
    action: message.action ?? null,
    transcription: message.transcription ?? null,
  })

  if (error) {
    console.error("[saveChatMessage] Supabase error:", error.message)
  }
}

export async function clearChatHistory(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  if (USE_MOCK_DATA) return true

  const client = supabase as unknown as AnyClient
  const { error } = await client
    .from("chat_messages")
    .delete()
    .eq("user_id", userId)

  if (error) {
    console.error("[clearChatHistory] Supabase error:", error.message)
    return false
  }
  return true
}
