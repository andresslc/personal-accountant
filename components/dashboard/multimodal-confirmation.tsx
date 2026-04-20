"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  Check,
  RotateCcw,
  SkipForward,
  Calendar,
  CreditCard,
  DollarSign,
  Percent,
  Repeat,
  Landmark,
  Tag,
} from "lucide-react"
import { TransactionConfirmationCard } from "./transaction-confirmation-card"
import type { MultimodalParseResult, ParsedBudget, ParsedDebt } from "@/lib/ai/multimodal-types"
import { getCategoryById } from "@/lib/data/dashboard-data"
import { useCurrency } from "@/components/currency-provider"

interface ConfirmationProps {
  onConfirm: () => void
  onTryAgain: () => void
}

function BudgetConfirmationCard({
  budget,
  onConfirm,
  onTryAgain,
}: ConfirmationProps & { budget: ParsedBudget }) {
  const { format } = useCurrency()
  const category = getCategoryById(budget.category_id)
  const lowConfidence = budget.confidence < 0.7

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Confirm Budget</CardTitle>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
            Budget
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
        {category && (
          <div className="flex items-center gap-3">
            <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{category.name}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Monthly Limit</p>
            <p className="font-semibold text-lg">{format(budget.budget_limit)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Month</p>
            <p className="font-medium">{budget.month_year}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Repeat className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Recurring</p>
            <p className="font-medium">{budget.recurring ? "Yes — every month" : "No — one time"}</p>
          </div>
        </div>
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

function DebtConfirmationCard({
  debt,
  onConfirm,
  onTryAgain,
}: ConfirmationProps & { debt: ParsedDebt }) {
  const { format } = useCurrency()
  const lowConfidence = debt.confidence < 0.7

  const debtTypeLabels: Record<string, string> = {
    "credit-card": "Credit Card",
    car: "Car Loan",
    student: "Student Loan",
    personal: "Personal Loan",
    mortgage: "Mortgage",
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Confirm Debt</CardTitle>
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            {debtTypeLabels[debt.type] ?? debt.type}
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
          <Landmark className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-semibold">{debt.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="font-semibold text-lg">{format(debt.current_balance)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Min. Payment</p>
            <p className="font-medium">{format(debt.min_payment)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Percent className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">APR</p>
            <p className="font-medium">{debt.apr}%</p>
          </div>
        </div>

        {debt.due_day && (
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Due Day</p>
              <p className="font-medium">Day {debt.due_day} of each month</p>
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

interface MultimodalConfirmationProps {
  result: MultimodalParseResult
  onConfirm: () => void
  onTryAgain: () => void
  onSkip?: () => void
  currentIndex?: number
  totalItems?: number
}

export function MultimodalConfirmation({
  result,
  onConfirm,
  onTryAgain,
  onSkip,
  currentIndex,
  totalItems,
}: MultimodalConfirmationProps) {
  const showProgress = totalItems !== undefined && totalItems > 1 && currentIndex !== undefined

  const progressHeader = showProgress ? (
    <div className="flex items-center justify-between mb-3">
      <Badge variant="secondary" className="text-xs">
        Item {currentIndex + 1} of {totalItems}
      </Badge>
      {onSkip && (
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={onSkip}>
          <SkipForward className="w-3.5 h-3.5" />
          Skip
        </Button>
      )}
    </div>
  ) : null

  switch (result.intent) {
    case "transaction":
      return (
        <div>
          {progressHeader}
          <TransactionConfirmationCard
            transaction={result.data}
            onConfirm={onConfirm}
            onTryAgain={onTryAgain}
          />
        </div>
      )
    case "budget":
      return (
        <div>
          {progressHeader}
          <BudgetConfirmationCard
            budget={result.data}
            onConfirm={onConfirm}
            onTryAgain={onTryAgain}
          />
        </div>
      )
    case "debt":
      return (
        <div>
          {progressHeader}
          <DebtConfirmationCard
            debt={result.data}
            onConfirm={onConfirm}
            onTryAgain={onTryAgain}
          />
        </div>
      )
  }
}
