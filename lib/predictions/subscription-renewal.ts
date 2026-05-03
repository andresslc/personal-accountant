import type { Subscription } from "@/lib/mocks/analytics"
import {
  advanceFrequency,
  monthlyEquivalent,
  todayISO,
  type SubscriptionFrequency,
} from "@/lib/utils/subscription-status"

export interface UpcomingRenewal {
  id: number
  name: string
  amount: number
  date: string
  daysUntil: number
  category: string | null
  frequency: SubscriptionFrequency
}

export function getUpcomingRenewals(
  subs: Subscription[],
  windowDays = 30,
  today: string = todayISO(),
): UpcomingRenewal[] {
  const todayMs = new Date(`${today}T00:00:00Z`).getTime()
  const cutoffMs = todayMs + windowDays * 86_400_000

  const renewals: UpcomingRenewal[] = []
  for (const s of subs) {
    if (!s.active || !s.next_due_date) continue
    const dueMs = new Date(`${s.next_due_date}T00:00:00Z`).getTime()
    if (dueMs > cutoffMs) continue
    renewals.push({
      id: s.id,
      name: s.name,
      amount: s.amount,
      date: s.next_due_date,
      daysUntil: Math.ceil((dueMs - todayMs) / 86_400_000),
      category: s.category,
      frequency: s.frequency as SubscriptionFrequency,
    })
  }

  renewals.sort((a, b) => a.date.localeCompare(b.date))
  return renewals
}

export function getMonthlyRecurringCost(subs: Subscription[]): number {
  return subs
    .filter((s) => s.active)
    .reduce((sum, s) => sum + monthlyEquivalent(s), 0)
}

export function getRecurringCostAsPercentOfIncome(
  subs: Subscription[],
  monthlyIncome: number,
): number {
  if (monthlyIncome <= 0) return 0
  return (getMonthlyRecurringCost(subs) / monthlyIncome) * 100
}

export interface ProjectedMonth {
  month: string
  amount: number
}

export function projectSubscriptionPayments(
  subs: Subscription[],
  months: number,
  today: string = todayISO(),
): ProjectedMonth[] {
  const totals = new Map<string, number>()
  const startDate = new Date(`${today}T00:00:00Z`)
  const horizonDate = new Date(startDate)
  horizonDate.setUTCMonth(horizonDate.getUTCMonth() + months)
  const horizonMs = horizonDate.getTime()

  for (let i = 0; i < months; i++) {
    const d = new Date(startDate)
    d.setUTCMonth(d.getUTCMonth() + i)
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
    totals.set(key, 0)
  }

  for (const s of subs) {
    if (!s.active || !s.next_due_date) continue
    let cursor = s.next_due_date
    while (true) {
      const cursorMs = new Date(`${cursor}T00:00:00Z`).getTime()
      if (cursorMs >= horizonMs) break
      const key = cursor.slice(0, 7)
      if (totals.has(key)) {
        totals.set(key, (totals.get(key) ?? 0) + s.amount)
      }
      cursor = advanceFrequency(cursor, s.frequency as SubscriptionFrequency)
    }
  }

  return Array.from(totals.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, amount]) => ({ month, amount }))
}

export function findUnusedSubscriptions(
  _subs: Subscription[],
  _txns: unknown[],
): Array<{ id: number; reason: string }> {
  return []
}
