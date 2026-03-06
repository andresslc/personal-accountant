const normalizeBooleanEnv = (value: string | undefined, defaultValue: boolean): boolean => {
  if (!value) return defaultValue
  return value.toLowerCase() === "true"
}

// Toggle this env var to switch the app data source:
// true  -> mock data
// false -> Supabase data
export const USE_MOCK_DATA = normalizeBooleanEnv(process.env.NEXT_PUBLIC_USE_MOCK_DATA, true)
