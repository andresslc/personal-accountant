"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { Car, CreditCard, DollarSign, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type LiabilityUI as Liability } from "@/lib/data/dashboard-data"

type LiabilityType = Liability["type"]

interface DebtQuickCreateDialogProps {
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onDebtCreated?: (debt: Liability) => void
}

const liabilityTypeOptions: { value: LiabilityType; label: string }[] = [
  { value: "credit-card", label: "Credit Card" },
  { value: "car", label: "Auto Loan" },
  { value: "student", label: "Student Loan" },
  { value: "personal", label: "Personal Loan" },
  { value: "mortgage", label: "Mortgage" },
]

const iconByType: Record<LiabilityType, Liability["icon"]> = {
  "credit-card": CreditCard,
  car: Car,
  student: CreditCard,
  personal: DollarSign,
  mortgage: Home,
}

export function DebtQuickCreateDialog({
  trigger,
  open,
  onOpenChange,
  onDebtCreated,
}: DebtQuickCreateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<LiabilityType>("credit-card")
  const [currentBalance, setCurrentBalance] = useState("")
  const [originalBalance, setOriginalBalance] = useState("")
  const [minPayment, setMinPayment] = useState("")
  const [apr, setApr] = useState("")
  const [dueDay, setDueDay] = useState("")

  const isControlled = typeof open === "boolean"
  const dialogOpen = isControlled ? open : internalOpen
  const setDialogOpen = (nextOpen: boolean) => {
    if (!isControlled) setInternalOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  const resetForm = () => {
    setName("")
    setType("credit-card")
    setCurrentBalance("")
    setOriginalBalance("")
    setMinPayment("")
    setApr("")
    setDueDay("")
  }

  const handleCreateDebt = () => {
    const parsedCurrentBalance = Number(currentBalance)
    const parsedOriginalBalance = Number(originalBalance || currentBalance)
    const parsedMinPayment = Number(minPayment)
    const parsedApr = Number(apr)
    const parsedDueDay = Number(dueDay)

    if (
      !name.trim() ||
      !Number.isFinite(parsedCurrentBalance) ||
      parsedCurrentBalance <= 0 ||
      !Number.isFinite(parsedOriginalBalance) ||
      parsedOriginalBalance <= 0 ||
      !Number.isFinite(parsedMinPayment) ||
      parsedMinPayment <= 0 ||
      !Number.isFinite(parsedApr) ||
      parsedApr < 0 ||
      !Number.isInteger(parsedDueDay) ||
      parsedDueDay < 1 ||
      parsedDueDay > 31
    ) {
      return
    }

    onDebtCreated?.({
      id: Date.now(),
      name: name.trim(),
      type,
      currentBalance: parsedCurrentBalance,
      originalBalance: parsedOriginalBalance,
      minPayment: parsedMinPayment,
      apr: parsedApr,
      dueDay: parsedDueDay,
      icon: iconByType[type],
    })

    resetForm()
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Debt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Debt Name</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Discover Card" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Debt Type</label>
            <Select value={type} onValueChange={(value: LiabilityType) => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {liabilityTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Current Balance</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={currentBalance}
                onChange={(event) => setCurrentBalance(event.target.value)}
                placeholder="8500.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Original Balance (optional)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={originalBalance}
                onChange={(event) => setOriginalBalance(event.target.value)}
                placeholder="10000.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Min Payment</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={minPayment}
                onChange={(event) => setMinPayment(event.target.value)}
                placeholder="250.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">APR %</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={apr}
                onChange={(event) => setApr(event.target.value)}
                placeholder="19.99"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Due Day</label>
              <Input
                type="number"
                min="1"
                max="31"
                step="1"
                value={dueDay}
                onChange={(event) => setDueDay(event.target.value)}
                placeholder="15"
              />
            </div>
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleCreateDebt}>
            Create Debt
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/dashboard/debts">View full debts page</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
