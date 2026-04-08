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
  actions?: Record<string, unknown>[]
  transcription?: string
}

const MAX_HISTORY = 100

function normalizeActions(
  raw: Record<string, unknown> | Record<string, unknown>[] | null
): Record<string, unknown>[] | undefined {
  if (!raw) return undefined
  if (Array.isArray(raw)) return raw.length > 0 ? raw : undefined
  return [raw]
}

function rowToMessage(row: ChatMessageRow): PersistedChatMessage {
  return {
    id: `db-${row.id}`,
    role: row.role,
    content: row.content,
    timestamp: new Date(row.created_at).getTime(),
    actions: normalizeActions(row.action),
    transcription: row.transcription ?? undefined,
  }
}

async function getClearedAt(
  client: AnyClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await client
    .from("chat_state")
    .select("cleared_at")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("[getClearedAt] Supabase error:", error.message)
    return null
  }
  return (data?.cleared_at as string | undefined) ?? null
}

export async function getChatHistory(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit: number = MAX_HISTORY
): Promise<PersistedChatMessage[]> {
  if (USE_MOCK_DATA) return []

  const client = supabase as unknown as AnyClient
  const clearedAt = await getClearedAt(client, userId)

  let query = client
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (clearedAt) {
    query = query.gt("created_at", clearedAt)
  }

  const { data, error } = await query

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
    actions?: Record<string, unknown>[] | null
    transcription?: string | null
  }
): Promise<void> {
  if (USE_MOCK_DATA) return

  const client = supabase as unknown as AnyClient
  const { error } = await client.from("chat_messages").insert({
    user_id: userId,
    role: message.role,
    content: message.content,
    action: message.actions && message.actions.length > 0 ? message.actions : null,
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
    .from("chat_state")
    .upsert(
      { user_id: userId, cleared_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )

  if (error) {
    console.error("[clearChatHistory] Supabase error:", error.message)
    return false
  }
  return true
}
