import type { Subscription } from "@/lib/supabase/types"

export type SubscriptionStatus =
  | "paused"
  | "overdue"
  | "paid"
  | "upcoming"
  | "scheduled"

export type SubscriptionFrequency = "Weekly" | "Monthly" | "Yearly"

// The status helpers only read a small slice of a Subscription. Typing the
// parameter structurally keeps the helpers usable with both the Supabase row
// shape and the mock-data shape (which omits user_id/created_at/updated_at).
export type SubscriptionStatusInput = Pick<
  Subscription,
  "active" | "next_due_date" | "last_paid_date" | "frequency"
>

export const FREQUENCY_DAYS: Record<SubscriptionFrequency, number> = {
  Weekly: 7,
  Monthly: 30,
  Yearly: 365,
}

export const FREQUENCY_PER_MONTH: Record<SubscriptionFrequency, number> = {
  Weekly: 30 / 7,
  Monthly: 1,
  Yearly: 1 / 12,
}

export function todayISO(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export function advanceFrequency(
  fromISO: string,
  freq: SubscriptionFrequency,
): string {
  const d = new Date(`${fromISO}T00:00:00Z`)
  if (freq === "Weekly") d.setUTCDate(d.getUTCDate() + 7)
  else if (freq === "Monthly") d.setUTCMonth(d.getUTCMonth() + 1)
  else d.setUTCFullYear(d.getUTCFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

export function rewindFrequency(
  fromISO: string,
  freq: SubscriptionFrequency,
): string {
  const d = new Date(`${fromISO}T00:00:00Z`)
  if (freq === "Weekly") d.setUTCDate(d.getUTCDate() - 7)
  else if (freq === "Monthly") d.setUTCMonth(d.getUTCMonth() - 1)
  else d.setUTCFullYear(d.getUTCFullYear() - 1)
  return d.toISOString().slice(0, 10)
}

type MonthlyEquivalentInput = Pick<Subscription, "amount" | "frequency">

export function monthlyEquivalent(s: MonthlyEquivalentInput): number {
  return s.amount * FREQUENCY_PER_MONTH[s.frequency as SubscriptionFrequency]
}

export function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(`${fromISO}T00:00:00Z`).getTime()
  const b = new Date(`${toISO}T00:00:00Z`).getTime()
  return Math.round((b - a) / 86_400_000)
}

export function getSubscriptionStatus(
  s: SubscriptionStatusInput,
  today: string = todayISO(),
): SubscriptionStatus {
  if (!s.active) return "paused"
  if (!s.next_due_date) return "scheduled"
  if (s.next_due_date < today) return "overdue"

  if (s.last_paid_date) {
    const periodStart = advanceFrequency(
      s.last_paid_date,
      s.frequency as SubscriptionFrequency,
    )
    if (periodStart > today && s.next_due_date >= today) return "paid"
  }

  if (daysBetween(today, s.next_due_date) <= 7) return "upcoming"
  return "scheduled"
}

export const isOverdue = (s: SubscriptionStatusInput, today: string = todayISO()) =>
  getSubscriptionStatus(s, today) === "overdue"

export const isUpcoming = (s: SubscriptionStatusInput, today: string = todayISO()) =>
  getSubscriptionStatus(s, today) === "upcoming"

export const isPaid = (s: SubscriptionStatusInput, today: string = todayISO()) =>
  getSubscriptionStatus(s, today) === "paid"

export function getStatusLabel(status: SubscriptionStatus): string {
  switch (status) {
    case "paused":
      return "Paused"
    case "overdue":
      return "Overdue"
    case "paid":
      return "Paid"
    case "upcoming":
      return "Upcoming"
    case "scheduled":
      return "Scheduled"
  }
}

export function getStatusColorClass(status: SubscriptionStatus): string {
  switch (status) {
    case "paused":
      return "bg-muted text-muted-foreground"
    case "overdue":
      return "bg-red-500/10 text-red-600 dark:text-red-400"
    case "paid":
      return "bg-green-500/10 text-green-600 dark:text-green-400"
    case "upcoming":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400"
    case "scheduled":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
  }
}
