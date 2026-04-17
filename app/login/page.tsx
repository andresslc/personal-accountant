import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { USE_MOCK_DATA } from '@/lib/config/data-source'
import { LoginForm } from './login-form'

export default async function LoginPage() {
  if (USE_MOCK_DATA) {
    redirect('/login/demo')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return <LoginForm />
}
