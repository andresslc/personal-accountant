export type SupportedCurrency = "COP" | "USD"

// Static FX rate used to convert stored COP amounts into USD for display.
// All persisted amounts (mock data, Supabase rows, AI parser output) are in COP,
// so when the user picks USD as the display currency we divide by this rate
// before formatting. Tune as needed; a future enhancement would fetch a live
// rate (e.g. from an FX API) and cache it.
export const COP_PER_USD = 4000

const currencyConfig: Record<SupportedCurrency, { locale: string; minimumFractionDigits: number; maximumFractionDigits: number }> = {
  COP: { locale: "es-CO", minimumFractionDigits: 0, maximumFractionDigits: 0 },
  USD: { locale: "en-US", minimumFractionDigits: 2, maximumFractionDigits: 2 },
}

export function convertFromCOP(amount: number, target: SupportedCurrency): number {
  if (target === "USD") return amount / COP_PER_USD
  return amount
}

export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = "COP",
  convert: boolean = true,
): string {
  const config = currencyConfig[currency]
  const value = convert ? convertFromCOP(amount, currency) : amount
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency,
    minimumFractionDigits: config.minimumFractionDigits,
    maximumFractionDigits: config.maximumFractionDigits,
  }).format(value)
}

export function formatCompact(
  amount: number,
  currency: SupportedCurrency = "COP",
  convert: boolean = true,
): string {
  const config = currencyConfig[currency]
  const symbol = currency === "COP" ? "$ " : "$"
  const converted = convert ? convertFromCOP(amount, currency) : amount
  const value = Math.abs(converted)

  if (value >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${symbol}${new Intl.NumberFormat(config.locale, { maximumFractionDigits: 0 }).format(value / 1_000)}k`
  }
  // Already-converted value — pass convert=false so we don't divide twice.
  return formatCurrency(converted, currency, false)
}
