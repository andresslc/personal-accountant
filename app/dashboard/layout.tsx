import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthProvider } from '@/components/auth-provider'
import { Sidebar } from '@/components/dashboard/sidebar'
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
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1">
          <Header />
          <div className="p-8">{children}</div>
        </main>
      </div>
    </AuthProvider>
  )
}
