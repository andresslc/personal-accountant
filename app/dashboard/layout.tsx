import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthProvider } from '@/components/auth-provider'
import { CurrencyProvider } from '@/components/currency-provider'
import { Sidebar, MobileSidebar, SidebarProvider } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
