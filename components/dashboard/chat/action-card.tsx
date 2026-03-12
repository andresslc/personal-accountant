"use client"

import { Check, CreditCard, Wallet, TrendingDown, Trash2, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type ActionKind =
  | "transaction_created"
  | "budget_created"
  | "debt_created"
  | "transaction_deleted"
  | "transaction_updated"

interface ActionCardProps {
  kind: ActionKind
  data: Record<string, unknown>
}

export function ActionCard({ kind, data }: ActionCardProps) {
  const formatCOP = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

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
              <span className="font-medium">{formatCOP(data.amount as number)}</span>
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
              <span className="font-medium">{formatCOP(data.budget_limit as number)}/mo</span>
            </div>
            {data.recurring && (
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
              <span className="font-medium">{formatCOP(data.current_balance as number)}</span>
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

    default:
      return null
  }
}
