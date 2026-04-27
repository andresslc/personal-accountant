"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"
import { useCurrency } from "@/components/currency-provider"
import { markSubscriptionPaid, type Subscription } from "@/lib/data/dashboard-data"
import {
  advanceFrequency,
  rewindFrequency,
  todayISO,
  type SubscriptionFrequency,
} from "@/lib/utils/subscription-status"
import { toast } from "sonner"

// TODO: swap Input[type=date] for shadcn Calendar via Popover once
// `components/ui/calendar.tsx` exists (run `npx shadcn@latest add calendar`).

interface SubscriptionMarkPaidDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: Subscription | null
  onPaid?: (result: {
    transactionId: number | null
    nextDueDate: string
    paidDate: string
  }) => void
}

const shiftDate = (iso: string, days: number): string => {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

const formatHumanDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00Z`)
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function SubscriptionMarkPaidDialog({
  open,
  onOpenChange,
  subscription,
  onPaid,
}: SubscriptionMarkPaidDialogProps) {
  const { user } = useAuth()
  const { format } = useCurrency()

  const today = useMemo(() => todayISO(), [])
  const [chosenDate, setChosenDate] = useState<string>(today)
  const [submitting, setSubmitting] = useState(false)

  // Reset the picker each time the dialog re-opens for a new subscription.
  useEffect(() => {
    if (open) setChosenDate(today)
  }, [open, subscription?.id, today])

  const frequency = (subscription?.frequency ?? "Monthly") as SubscriptionFrequency

  const earliestAcceptable = useMemo(() => {
    if (!subscription?.next_due_date) return null
    return rewindFrequency(subscription.next_due_date, frequency)
  }, [subscription?.next_due_date, frequency])

  const isFuture = chosenDate > today
  const isTooOld = earliestAcceptable !== null && chosenDate < earliestAcceptable
  const dateInvalid = !chosenDate || isFuture || isTooOld

  const previewNext =
    chosenDate && !dateInvalid ? advanceFrequency(chosenDate, frequency) : null

  const presets: { label: string; value: string }[] = [
    { label: "Today", value: today },
    { label: "Yesterday", value: shiftDate(today, -1) },
    { label: "2 days ago", value: shiftDate(today, -2) },
    { label: "3 days ago", value: shiftDate(today, -3) },
  ]

  const handleConfirm = async () => {
    if (!subscription || !user || dateInvalid) return
    setSubmitting(true)
    try {
      const result = await markSubscriptionPaid(
        subscription.id,
        user.id,
        chosenDate,
      )
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      if (result.alreadyPaid) {
        toast(`Already marked paid on ${formatHumanDate(chosenDate)}.`)
        onOpenChange(false)
        return
      }
      onPaid?.({
        transactionId: result.transactionId,
        nextDueDate: result.nextDueDate,
        paidDate: chosenDate,
      })
      toast.success(
        `Marked paid · created transaction · next renewal ${formatHumanDate(result.nextDueDate)}`,
      )
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (!subscription) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{`Mark "${subscription.name}" as paid`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Amount: <span className="font-medium text-foreground">{format(subscription.amount)}</span>
            {" · "}
            Frequency: <span className="font-medium text-foreground">{subscription.frequency}</span>
          </p>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Quick presets
            </p>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => {
                const disabled =
                  earliestAcceptable !== null && preset.value < earliestAcceptable
                const isActive = preset.value === chosenDate
                return (
                  <Button
                    key={preset.label}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    disabled={disabled}
                    onClick={() => setChosenDate(preset.value)}
                  >
                    {preset.label}
                  </Button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Paid on
            </label>
            <Input
              type="date"
              value={chosenDate}
              max={today}
              min={earliestAcceptable ?? undefined}
              onChange={(e) => setChosenDate(e.target.value)}
            />
          </div>

          {dateInvalid ? (
            <p className="text-sm text-destructive" role="alert">
              {isFuture
                ? "Future dates are not allowed."
                : isTooOld
                  ? `Date is older than one ${frequency.toLowerCase()} period before the next due date.`
                  : "Please choose a valid date."}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Next renewal will be:{" "}
              <span className="font-medium text-foreground">
                {previewNext ? formatHumanDate(previewNext) : "—"}
              </span>
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={dateInvalid || submitting || !user}
          >
            {submitting ? "Saving…" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
