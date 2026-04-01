import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const UNAUTHORIZED = NextResponse.json(
  { success: false, error: "Unauthorized" },
  { status: 401 }
)

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { user: null, response: UNAUTHORIZED }

  return { user, response: null }
}
