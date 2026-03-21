export type SupportedCurrency = "COP" | "USD"

const currencyConfig: Record<SupportedCurrency, { locale: string; minimumFractionDigits: number; maximumFractionDigits: number }> = {
  COP: { locale: "es-CO", minimumFractionDigits: 0, maximumFractionDigits: 0 },
  USD: { locale: "en-US", minimumFractionDigits: 2, maximumFractionDigits: 2 },
}

export function formatCurrency(amount: number, currency: SupportedCurrency = "COP"): string {
  const config = currencyConfig[currency]
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency,
    minimumFractionDigits: config.minimumFractionDigits,
    maximumFractionDigits: config.maximumFractionDigits,
  }).format(amount)
}

export function formatCompact(amount: number, currency: SupportedCurrency = "COP"): string {
  const config = currencyConfig[currency]
  const symbol = currency === "COP" ? "$\u00A0" : "$"
  const value = Math.abs(amount)

  if (value >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${symbol}${new Intl.NumberFormat(config.locale, { maximumFractionDigits: 0 }).format(value / 1_000)}k`
  }
  return formatCurrency(amount, currency)
}
