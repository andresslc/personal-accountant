"use client"

import { useState } from "react"
import { ArrowRight, Plus, ReceiptText, WalletCards, Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface QuickAddMenuProps {
  onAddTransaction?: () => void
  onCreateBudget?: () => void
  onAddDebt?: () => void
}

export function QuickAddMenu({ onAddTransaction, onCreateBudget, onAddDebt }: QuickAddMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = (action?: () => void) => {
    setIsOpen(false)
    action?.()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4" />
          Quick Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Something New</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 pt-2">
          <Button
            variant="outline"
            className="h-auto justify-between py-4"
            onClick={() => handleAction(onAddTransaction)}
          >
            <span className="flex items-center gap-3">
              <ReceiptText className="w-4 h-4 text-primary" />
              Add Transaction
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button
            variant="outline"
            className="h-auto justify-between py-4"
            onClick={() => handleAction(onCreateBudget)}
          >
            <span className="flex items-center gap-3">
              <WalletCards className="w-4 h-4 text-primary" />
              Create Budget
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button
            variant="outline"
            className="h-auto justify-between py-4"
            onClick={() => handleAction(onAddDebt)}
          >
            <span className="flex items-center gap-3">
              <Landmark className="w-4 h-4 text-primary" />
              Add Debt
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
