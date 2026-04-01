'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { SupportedCurrency } from '@/lib/utils/currency'
import { formatCurrency, formatCompact } from '@/lib/utils/currency'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth-provider'
import { USE_MOCK_DATA } from '@/lib/config/data-source'

type CurrencyContextType = {
  currency: SupportedCurrency
  setCurrency: (currency: SupportedCurrency) => Promise<void>
  format: (amount: number) => string
  compact: (amount: number) => string
  loading: boolean
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'COP',
  setCurrency: async () => {},
  format: (amount) => formatCurrency(amount, 'COP'),
  compact: (amount) => formatCompact(amount, 'COP'),
  loading: true,
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [currency, setCurrencyState] = useState<SupportedCurrency>('COP')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || USE_MOCK_DATA) {
      setLoading(false)
      return
    }

    const loadPreferences = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('user_preferences')
        .select('currency')
        .eq('user_id', user.id)
        .single<{ currency: string }>()
      if (data?.currency) {
        setCurrencyState(data.currency as SupportedCurrency)
      }
      setLoading(false)
    }
    void loadPreferences()
  }, [user])

  const setCurrency = useCallback(async (newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency)

    if (!user || USE_MOCK_DATA) return

    const supabase = createClient()
    await (supabase
      .from('user_preferences') as ReturnType<typeof supabase.from>)
      .upsert({ user_id: user.id, currency: newCurrency } as Record<string, unknown>, { onConflict: 'user_id' })
  }, [user])

  const format = useCallback((amount: number) => formatCurrency(amount, currency), [currency])
  const compact = useCallback((amount: number) => formatCompact(amount, currency), [currency])

  return (
    <CurrencyContext value={{ currency, setCurrency, format, compact, loading }}>
      {children}
    </CurrencyContext>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
