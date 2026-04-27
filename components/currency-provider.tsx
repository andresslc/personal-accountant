'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
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

const STORAGE_KEY = 'finflow:display-currency'
const CURRENCY_CHANGE_EVENT = 'finflow:currency-change'

const isSupportedCurrency = (value: unknown): value is SupportedCurrency =>
  value === 'COP' || value === 'USD'

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

  // Hydrate from localStorage so the choice survives navigation/reload in
  // every mode (mock + Supabase). This runs on mount on the client and also
  // listens for cross-tab + same-tab updates so consumers stay in sync if the
  // selection is changed elsewhere (different tab, browser back/forward, or
  // via a stale Provider instance still mounted somewhere in the tree).
  useEffect(() => {
    if (typeof window === 'undefined') return

    const readFromStorage = () => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        if (isSupportedCurrency(stored)) {
          setCurrencyState(stored)
        }
      } catch {
        // ignore storage failures (private mode, etc.)
      }
    }

    readFromStorage()

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      if (isSupportedCurrency(event.newValue)) {
        setCurrencyState(event.newValue)
      }
    }
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail
      if (isSupportedCurrency(detail)) {
        setCurrencyState(detail)
      }
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(CURRENCY_CHANGE_EVENT, onCustom)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(CURRENCY_CHANGE_EVENT, onCustom)
    }
  }, [])

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
      if (isSupportedCurrency(data?.currency)) {
        setCurrencyState(data.currency)
      }
      setLoading(false)
    }
    void loadPreferences()
  }, [user])

  const setCurrency = useCallback(
    async (newCurrency: SupportedCurrency) => {
      setCurrencyState(newCurrency)

      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(STORAGE_KEY, newCurrency)
        } catch {
          // ignore storage failures
        }
        // Broadcast to any other Provider instances mounted in this tab so
        // they pick up the new value without relying on shared React state.
        // (The browser does not fire `storage` events in the same tab.)
        try {
          window.dispatchEvent(
            new CustomEvent(CURRENCY_CHANGE_EVENT, { detail: newCurrency }),
          )
        } catch {
          // ignore event dispatch failures
        }
      }

      if (!user || USE_MOCK_DATA) return

      const supabase = createClient()
      await (supabase
        .from('user_preferences') as ReturnType<typeof supabase.from>)
        .upsert(
          { user_id: user.id, currency: newCurrency } as Record<string, unknown>,
          { onConflict: 'user_id' },
        )
    },
    [user],
  )

  const format = useCallback((amount: number) => formatCurrency(amount, currency), [currency])
  const compact = useCallback((amount: number) => formatCompact(amount, currency), [currency])

  // Memoize the context value so consumers only re-render when the
  // currency (or one of the derived callbacks) actually changes.
  const value = useMemo<CurrencyContextType>(
    () => ({ currency, setCurrency, format, compact, loading }),
    [currency, setCurrency, format, compact, loading],
  )

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
