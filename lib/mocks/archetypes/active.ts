import 'server-only'
import { cookies } from 'next/headers'
import {
  DEFAULT_ARCHETYPE_ID,
  DEMO_ARCHETYPE_COOKIE,
  resolveArchetype,
} from './index'
import type { ClientArchetype } from './types'

export async function getActiveArchetype(): Promise<ClientArchetype> {
  try {
    const store = await cookies()
    const id = store.get(DEMO_ARCHETYPE_COOKIE)?.value
    return resolveArchetype(id)
  } catch {
    return resolveArchetype(DEFAULT_ARCHETYPE_ID)
  }
}
