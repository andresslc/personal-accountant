import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { BudgetPlanning } from "@/components/dashboard/budget-planning"

export default function BudgetPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1">
        <Header />
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Budget Planning</h1>
            <p className="text-foreground/70 mt-2">Set and track your spending limits</p>
          </div>
          <BudgetPlanning />
        </div>
      </main>
    </div>
  )
}
