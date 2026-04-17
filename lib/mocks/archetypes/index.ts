/**
 * Client archetype library — demo personas used exclusively when
 * `USE_MOCK_DATA === true`. Each archetype ships a full 12-month financial
 * footprint (transactions, budgets, liabilities, subscriptions, summary KPIs,
 * charts) grounded in the Colombia household benchmark at
 * `lib/benchmarks/colombia-household-8m.ts`.
 *
 * Usage: the data layer resolves the active archetype via the
 * `finflow_demo_archetype` cookie (see `./active.ts`) and returns the matching
 * mock payload. Components never import from this file directly — they go
 * through `lib/data/dashboard-data.ts`.
 *
 * To add a new archetype:
 *   1. Create `./profiles/<slug>.ts` using the existing profiles as a template.
 *   2. Export a `ClientArchetype` object with a unique `id` and credentials.
 *   3. Append it to the `archetypes` array below.
 *
 * SECURITY: `demoPassword` fields are intentionally plaintext. This module only
 * runs when `USE_MOCK_DATA === true` and must never be shipped into Supabase
 * Auth flows.
 */

import { chronicLatePayer } from './profiles/chronic-late-payer'
import { disciplinedSaver } from './profiles/disciplined-saver'
import { familyProvider } from './profiles/family-provider'
import { gigEconomyFreelancer } from './profiles/gig-economy-freelancer'
import { overLeveragedAspirational } from './profiles/over-leveraged-aspirational'
import { youngProfessional } from './profiles/young-professional'
import type { ClientArchetype } from './types'

export const archetypes: ClientArchetype[] = [
  disciplinedSaver,
  chronicLatePayer,
  overLeveragedAspirational,
  gigEconomyFreelancer,
  youngProfessional,
  familyProvider,
]

export const DEFAULT_ARCHETYPE_ID = disciplinedSaver.id

export function getArchetypeById(id: string | undefined | null): ClientArchetype | undefined {
  if (!id) return undefined
  return archetypes.find((a) => a.id === id)
}

export function resolveArchetype(id: string | undefined | null): ClientArchetype {
  return getArchetypeById(id) ?? disciplinedSaver
}

export function getArchetypeByCredentials(
  username: string,
  password: string
): ClientArchetype | undefined {
  const normalized = username.trim().toLowerCase()
  return archetypes.find(
    (a) =>
      a.demoUsername.toLowerCase() === normalized && a.demoPassword === password
  )
}

// Cookie constants live here (not in ./active.ts) so server actions and
// read-side helpers can share them without dragging `next/headers` into any
// client bundle.
export const DEMO_ARCHETYPE_COOKIE = 'finflow_demo_archetype'
export const DEMO_ARCHETYPE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export type { ClientArchetype, ArchetypeTag, ArchetypeSummary, ArchetypeProfileMetadata } from './types'
