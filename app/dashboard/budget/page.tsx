import { BudgetPlanning } from "@/components/dashboard/budget-planning"

export default function BudgetPage() {
  return (
    <>
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Budget Planning</h1>
        <p className="text-foreground/70 mt-2">Set and track your spending limits</p>
      </div>
      <BudgetPlanning />
    </>
  )
}
