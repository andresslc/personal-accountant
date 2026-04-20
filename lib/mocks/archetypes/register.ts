import 'server-only'
import { USE_MOCK_DATA } from '@/lib/config/data-source'
import { getActiveArchetype } from './active'
import { setMockSourceResolver } from '@/lib/data/dashboard-data'

// Call at the top of every dashboard page / server component that fetches via
// `lib/data/dashboard-data`. This guarantees the active archetype is wired
// into the data layer BEFORE the first fetch — avoids a streaming race where
// the page starts rendering in parallel with the layout and the layout's
// resolver hasn't been installed yet when the page awaits its data.
export async function ensureArchetypeResolver(): Promise<void> {
  if (!USE_MOCK_DATA) return
  const archetype = await getActiveArchetype()
  setMockSourceResolver(async () => archetype)
}
