"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import {
  createSubscription,
  updateSubscription,
  type Subscription,
  type SubscriptionInsert,
} from "@/lib/data/dashboard-data"
import type { SubscriptionFrequency, PaymentMethod } from "@/lib/supabase/types"
import { advanceFrequency, todayISO } from "@/lib/utils/subscription-status"

const FREQUENCY_OPTIONS: { value: SubscriptionFrequency; label: string }[] = [
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Yearly", label: "Yearly" },
]

const CATEGORY_OPTIONS: string[] = [
  "Entertainment",
  "Software",
  "Music",
  "Health",
  "Insurance",
  "Education",
  "Food",
  "Vivienda",
  "Tech Tools",
  "Other",
]

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod | ""; label: string }[] = [
  { value: "", label: "—" },
  { value: "Credit Card", label: "Credit Card" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Cash", label: "Cash" },
  { value: "Debit Card", label: "Debit Card" },
]

interface SubscriptionQuickCreateDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactNode
  initial?: Subscription
  onCreated?: (sub: Subscription) => void
  onUpdated?: (sub: Subscription) => void
}

const defaultNextDueDate = () => {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

export function SubscriptionQuickCreateDialog({
  open,
  onOpenChange,
  trigger,
  initial,
  onCreated,
  onUpdated,
}: SubscriptionQuickCreateDialogProps) {
  const { user } = useAuth()
  const isEdit = Boolean(initial)

  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = typeof open === "boolean"
  const dialogOpen = isControlled ? open : internalOpen
  const setDialogOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  const [name, setName] = useState(initial?.name ?? "")
  const [amount, setAmount] = useState(
    initial?.amount != null ? String(initial.amount) : "",
  )
  const [frequency, setFrequency] = useState<SubscriptionFrequency>(
    initial?.frequency ?? "Monthly",
  )
  const [nextDueDate, setNextDueDate] = useState(
    initial?.next_due_date ?? defaultNextDueDate(),
  )
  const [category, setCategory] = useState<string>(initial?.category ?? "Other")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(
    initial?.payment_method ?? "",
  )
  const [autoPay, setAutoPay] = useState<boolean>(initial?.auto_pay ?? false)
  const [active, setActive] = useState<boolean>(initial?.active ?? true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Re-sync local form state when the `initial` prop changes (e.g. switching
  // from one row's edit dialog to another within the same manager render).
  useEffect(() => {
    if (!initial) return
    setName(initial.name)
    setAmount(String(initial.amount))
    setFrequency(initial.frequency)
    setNextDueDate(initial.next_due_date ?? defaultNextDueDate())
    setCategory(initial.category ?? "Other")
    setPaymentMethod(initial.payment_method ?? "")
    setAutoPay(initial.auto_pay)
    setActive(initial.active)
    setError(null)
  }, [initial])

  const resetForm = () => {
    setName("")
    setAmount("")
    setFrequency("Monthly")
    setNextDueDate(defaultNextDueDate())
    setCategory("Other")
    setPaymentMethod("")
    setAutoPay(false)
    setActive(true)
    setError(null)
  }

  const validate = (): SubscriptionInsert | null => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Name is required.")
      return null
    }
    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Amount must be greater than zero.")
      return null
    }
    if (!frequency) {
      setError("Frequency is required.")
      return null
    }
    if (!nextDueDate || !/^\d{4}-\d{2}-\d{2}$/.test(nextDueDate)) {
      setError("Next due date must be a valid date.")
      return null
    }
    setError(null)
    return {
      name: trimmedName,
      amount: amt,
      frequency,
      next_due_date: nextDueDate,
      active,
      category: category || null,
      auto_pay: autoPay,
      payment_method: (paymentMethod || null) as PaymentMethod | null,
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      setError("You must be signed in.")
      return
    }
    const payload = validate()
    if (!payload) return

    setSaving(true)
    try {
      if (isEdit && initial) {
        const updated = await updateSubscription(initial.id, user.id, payload)
        if (!updated) {
          setError("Failed to update subscription.")
          return
        }
        onUpdated?.(updated)
      } else {
        const created = await createSubscription(payload, user.id)
        if (!created) {
          setError("Failed to create subscription.")
          return
        }
        onCreated?.(created)
        resetForm()
      }
      setDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  // Live preview line for next renewal (helpful confirmation in edit mode).
  const previewNext =
    nextDueDate && /^\d{4}-\d{2}-\d{2}$/.test(nextDueDate)
      ? advanceFrequency(nextDueDate, frequency)
      : null

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Subscription" : "Add Subscription"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Netflix"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Amount (COP)
              </label>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="35000"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Frequency
              </label>
              <Select
                value={frequency}
                onValueChange={(v) => setFrequency(v as SubscriptionFrequency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Next due date
              </label>
              <Input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Payment method
            </label>
            <Select
              value={paymentMethod || "__none__"}
              onValueChange={(v) =>
                setPaymentMethod(v === "__none__" ? "" : (v as PaymentMethod))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.label}
                    value={option.value === "" ? "__none__" : option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={autoPay}
                onChange={(e) => setAutoPay(e.target.checked)}
                className="h-4 w-4 rounded border-border cursor-pointer"
              />
              Auto-pay
            </label>

            {isEdit ? (
              <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded border-border cursor-pointer"
                />
                Active
              </label>
            ) : null}
          </div>

          {previewNext ? (
            <p className="text-xs text-muted-foreground">
              After next due date, renewal advances to {previewNext}.
            </p>
          ) : null}

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSubmit}
            disabled={saving || !user}
          >
            {saving
              ? isEdit
                ? "Saving…"
                : "Creating…"
              : isEdit
                ? "Save Changes"
                : "Create Subscription"}
          </Button>

          {!isEdit ? (
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/dashboard/subscriptions">View full subscriptions page</Link>
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper export so the manager can build a nominal "today + 30d" default
// without re-implementing it. Not strictly required but cheap to expose.
export { defaultNextDueDate, todayISO }
