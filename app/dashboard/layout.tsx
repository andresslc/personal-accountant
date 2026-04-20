import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { AuthProvider } from '@/components/auth-provider'
import { CurrencyProvider } from '@/components/currency-provider'
import { Sidebar, MobileSidebar, SidebarProvider } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { USE_MOCK_DATA } from '@/lib/config/data-source'
import { getActiveArchetype } from '@/lib/mocks/archetypes/active'
import { setMockSourceResolver } from '@/lib/data/dashboard-data'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user: User | null = null

  if (USE_MOCK_DATA) {
    // In mock mode the archetype cookie stands in for a real auth session so
    // the demo can be navigated without Supabase. We register the resolver
    // here as a baseline; each dashboard page re-registers it right before
    // fetching data to guard against RSC streaming races that let the page
    // start fetching before the layout has finished awaiting.
    const archetype = await getActiveArchetype()
    setMockSourceResolver(async () => archetype)
    user = {
      id: `demo-${archetype.id}`,
      email: archetype.demoUsername,
      app_metadata: {},
      user_metadata: { demoArchetypeId: archetype.id, displayName: archetype.displayName },
      aud: 'demo',
      created_at: new Date().toISOString(),
    } as User
  } else {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  if (!user) {
    redirect('/login')
  }

  return (
    <AuthProvider initialUser={user}>
      <CurrencyProvider>
        <SidebarProvider>
          <div className="flex h-dvh bg-background overflow-hidden">
            <MobileSidebar />
            <Sidebar />
            <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
              <Header />
              <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
            </main>
          </div>
        </SidebarProvider>
      </CurrencyProvider>
    </AuthProvider>
  )
}
