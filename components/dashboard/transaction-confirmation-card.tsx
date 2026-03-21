"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Check, RotateCcw, Calendar, CreditCard, Tag, DollarSign } from "lucide-react"
import type { ParsedTransaction } from "@/lib/ai/types"
import { getCategoryById, liabilitiesData } from "@/lib/data/dashboard-data"
import { useCurrency } from "@/components/currency-provider"

interface TransactionConfirmationCardProps {
  transaction: ParsedTransaction
  onConfirm: () => void
  onTryAgain: () => void
}

const typeBadgeStyles: Record<string, string> = {
  expense: "bg-red-100 text-red-700 border-red-200",
  income: "bg-green-100 text-green-700 border-green-200",
  "debt-payment": "bg-amber-100 text-amber-700 border-amber-200",
}

const typeLabels: Record<string, string> = {
  expense: "Expense",
  income: "Income",
  "debt-payment": "Debt Payment",
}

export function TransactionConfirmationCard({
  transaction,
  onConfirm,
  onTryAgain,
}: TransactionConfirmationCardProps) {
  const { format } = useCurrency()
  const category = getCategoryById(transaction.category_id)
  const liability = transaction.liability_id
    ? liabilitiesData.find((l) => l.id === transaction.liability_id)
    : null
  const lowConfidence = transaction.confidence < 0.7

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Confirm Transaction</CardTitle>
          <Badge variant="outline" className={typeBadgeStyles[transaction.type]}>
            {typeLabels[transaction.type]}
          </Badge>
        </div>
        {lowConfidence && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-md px-3 py-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Low confidence — please review the details carefully.</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="font-semibold text-lg">{format(transaction.amount)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="font-medium">{transaction.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{transaction.date}</p>
          </div>
        </div>

        {category && (
          <div className="flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{category.name}</p>
            </div>
          </div>
        )}

        {liability && (
          <div className="flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Liability</p>
              <p className="font-medium">{liability.name}</p>
            </div>
          </div>
        )}

        {transaction.method !== "other" && (
          <div className="flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Method</p>
              <p className="font-medium capitalize">{transaction.method}</p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-3 pt-3">
        <Button variant="outline" className="flex-1" onClick={onTryAgain}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button className="flex-1" onClick={onConfirm}>
          <Check className="w-4 h-4 mr-2" />
          Confirm
        </Button>
      </CardFooter>
    </Card>
  )
}
