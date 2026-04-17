'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { USE_MOCK_DATA } from '@/lib/config/data-source'
import {
  archetypes,
  DEFAULT_ARCHETYPE_ID,
  DEMO_ARCHETYPE_COOKIE,
  DEMO_ARCHETYPE_COOKIE_MAX_AGE,
  getArchetypeByCredentials,
  getArchetypeById,
} from '@/lib/mocks/archetypes'

async function setArchetypeCookie(id: string): Promise<void> {
  const store = await cookies()
  store.set(DEMO_ARCHETYPE_COOKIE, id, {
    path: '/',
    maxAge: DEMO_ARCHETYPE_COOKIE_MAX_AGE,
    httpOnly: false,
    sameSite: 'lax',
  })
}

export async function selectArchetype(formData: FormData): Promise<void> {
  if (!USE_MOCK_DATA) {
    redirect('/login?error=Demo+mode+is+disabled+%28USE_MOCK_DATA%3Dfalse%29')
  }

  const idRaw = formData.get('archetypeId')
  const id = typeof idRaw === 'string' ? idRaw : DEFAULT_ARCHETYPE_ID
  const archetype = getArchetypeById(id)
  if (!archetype) {
    redirect('/login/demo?error=Unknown+archetype')
  }

  await setArchetypeCookie(archetype.id)
  redirect('/dashboard')
}

export async function demoCredentialsLogin(formData: FormData): Promise<void> {
  if (!USE_MOCK_DATA) {
    redirect('/login?error=Demo+mode+is+disabled+%28USE_MOCK_DATA%3Dfalse%29')
  }

  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const password = (formData.get('password') as string | null) ?? ''

  if (!email || !password) {
    redirect('/login/demo?error=Missing+credentials')
  }

  const matched = getArchetypeByCredentials(email, password)
  if (!matched) {
    redirect('/login/demo?error=Invalid+demo+credentials')
  }

  await setArchetypeCookie(matched.id)
  redirect('/dashboard')
}

export async function listDemoArchetypes() {
  return archetypes.map((a) => ({
    id: a.id,
    displayName: a.displayName,
    displayNameEs: a.displayNameEs,
    description: a.description,
    descriptionEs: a.descriptionEs,
    demoUsername: a.demoUsername,
    demoPassword: a.demoPassword,
    estrato: a.profile.estrato,
    city: a.profile.city,
    grossMonthlyIncomeCOP: a.profile.grossMonthlyIncomeCOP,
    netMonthlyIncomeCOP: a.profile.netMonthlyIncomeCOP,
    tags: a.tags,
  }))
}
