"use client"

import {
  Check,
  CreditCard,
  Wallet,
  TrendingDown,
  Trash2,
  Pencil,
  Repeat,
  Pause,
  Play,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/components/currency-provider"

type ActionKind =
  | "transaction_created"
  | "budget_created"
  | "debt_created"
  | "transaction_deleted"
  | "transaction_updated"
  | "debt_deleted"
  | "debt_updated"
  | "subscription_created"
  | "subscription_updated"
  | "subscription_deleted"
  | "subscription_paid"
  | "subscription_active_changed"

interface ActionCardProps {
  kind: ActionKind
  data: Record<string, unknown>
}

export function ActionCard({ kind, data }: ActionCardProps) {
  const { format } = useCurrency()

  switch (kind) {
    case "transaction_created": {
      const txType = data.type as string
      const Icon = txType === "income" ? TrendingDown : CreditCard
      const typeColor =
        txType === "income"
          ? "bg-green-500/10 text-green-600"
          : txType === "debt-payment"
          ? "bg-blue-500/10 text-blue-600"
          : "bg-red-500/10 text-red-600"

      return (
        <div className="border rounded-lg p-3 bg-card mt-2 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-md ${typeColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Transaction Created</span>
            <Check className="w-4 h-4 text-green-500 ml-auto" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{data.description as string}</span>
              <span className="font-medium">{format(data.amount as number)}</span>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {data.category_id as string}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {txType}
              </Badge>
            </div>
          </div>
        </div>
      )
    }

    case "budget_created":
      return (
        <div className="border rounded-lg p-3 bg-card mt-2 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-600">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Budget Created</span>
            <Check className="w-4 h-4 text-green-500 ml-auto" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{data.category_id as string}</span>
              <span className="font-medium">{format(data.budget_limit as number)}/mo</span>
            </div>
            {Boolean(data.recurring) && (
              <Badge variant="outline" className="text-xs">Recurring</Badge>
            )}
          </div>
        </div>
      )

    case "debt_created":
      return (
        <div className="border rounded-lg p-3 bg-card mt-2 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-600">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Debt Added</span>
            <Check className="w-4 h-4 text-green-500 ml-auto" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{data.name as string}</span>
              <span className="font-medium">{format(data.current_balance as number)}</span>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">{data.type as string}</Badge>
              <Badge variant="outline" className="text-xs">{data.apr as number}% APR</Badge>
            </div>
          </div>
        </div>
      )

    case "transaction_deleted":
      return (
        <div className="border rounded-lg p-3 bg-card mt-2 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-red-500/10 text-red-600">
              <Trash2 className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Transaction #{data.id as number} Deleted</span>
            <Check className="w-4 h-4 text-green-500 ml-auto" />
          </div>
        </div>
      )

    case "transaction_updated":
      return (
        <div className="border rounded-lg p-3 bg-card mt-2 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600">
              <Pencil className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Transaction #{data.id as number} Updated</span>
            <Check className="w-4 h-4 text-green-500 ml-auto" />
          </div>
        </div>
      )

    case "debt_deleted":
      return (
        <div className="border rounded-lg p-3 bg-card mt-2 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-red-500/10 text-red-600">
              <Trash2 className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Debt #{data.id as number} Deleted</span>
            <Check className="w-4 h-4 text-green-500 ml-auto" />
          </div>
        </div>
      )

    case "debt_updated":
      return (
        <div className="border rounded-lg p-3 bg-card mt-2 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600">
              <Pencil className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Debt #{data.id as number} Updated</span>
            <Check className="w-4 h-4 text-green-500 ml-auto" />
          </div>
        </div>
      )

    case "subscription_created":
      return (
        <div className="border rounded-lg p-3 bg-card mt-2 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-600">
              <Repeat className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Subscription Created</span>
            <Check className="w-4 h-4 text-green-500 ml-auto" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{data.name as string}</span>
              <span className="font-medium">
                {format(data.amount as number)}/{data.frequency as string}
              </span>
            </div>
            {Boolean(data.next_due_date) && (
              <Badge variant="outline" className="text-xs">
                Next: {data.next_due_date as string}
              </Badge>
            )}
          </div>
        </div>
      )

    case "subscription_updated":
      return (
        <div className="border rounded-lg p-3 bg-card mt-2 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600">
              <Pencil className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Subscription #{data.id as number} Updated</span>
            <Check className="w-4 h-4 text-green-500 ml-auto" />
          </div>
        </div>
      )

    case "subscription_deleted":
      return (
        <div className="border rounded-lg p-3 bg-card mt-2 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-red-500/10 text-red-600">
              <Trash2 className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Subscription #{data.id as number} Deleted</span>
            <Check className="w-4 h-4 text-green-500 ml-auto" />
          </div>
        </div>
      )

    case "subscription_paid": {
      const alreadyPaid = Boolean(data.already_paid)
      return (
        <div className="border rounded-lg p-3 bg-card mt-2 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-green-500/10 text-green-600">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">
              {alreadyPaid ? "Already Paid" : "Marked Paid"}
            </span>
            <Check className="w-4 h-4 text-green-500 ml-auto" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subscription #{data.id as number}</span>
              <span className="font-medium">{data.paid_date as string}</span>
            </div>
            {Boolean(data.next_due_date) && (
              <Badge variant="outline" className="text-xs">
                Next: {data.next_due_date as string}
              </Badge>
            )}
          </div>
        </div>
      )
    }

    case "subscription_active_changed": {
      const isActive = Boolean(data.active)
      const Icon = isActive ? Play : Pause
      const tone = isActive
        ? "bg-green-500/10 text-green-600"
        : "bg-amber-500/10 text-amber-600"
      return (
        <div className="border rounded-lg p-3 bg-card mt-2 max-w-sm">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${tone}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">
              {isActive ? "Resumed" : "Paused"} {(data.name as string) ?? `Subscription #${data.id as number}`}
            </span>
            <Check className="w-4 h-4 text-green-500 ml-auto" />
          </div>
        </div>
      )
    }

    default:
      return null
  }
}
