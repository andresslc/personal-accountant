import { redirect } from 'next/navigation'
import { DemoArchetypePicker } from '@/components/auth/demo-archetype-picker'
import { USE_MOCK_DATA } from '@/lib/config/data-source'
import { listDemoArchetypes } from '@/app/login/demo-actions'

export const metadata = {
  title: 'FinFlow — Demo archetypes',
}

interface DemoLoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function DemoLoginPage({ searchParams }: DemoLoginPageProps) {
  if (!USE_MOCK_DATA) {
    redirect('/login?error=Demo+mode+is+disabled+%28USE_MOCK_DATA%3Dfalse%29')
  }

  const { error } = await searchParams
  const archetypes = await listDemoArchetypes()

  return (
    <DemoArchetypePicker archetypes={archetypes} errorMessage={error} />
  )
}
