import { BudgetPlanning } from "@/components/dashboard/budget-planning"
import { getBudgetPageData } from "@/lib/data/dashboard-data"
import { createClient } from "@/lib/supabase/server"
import { USE_MOCK_DATA } from "@/lib/config/data-source"
import { ensureArchetypeResolver } from "@/lib/mocks/archetypes/register"

export default async function BudgetPage() {
  await ensureArchetypeResolver()
  const supabase = USE_MOCK_DATA ? undefined : await createClient()
  const { budgets } = await getBudgetPageData(supabase)

  return (
    <>
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Budget Planning</h1>
        <p className="text-foreground/70 mt-2">Set and track your spending limits</p>
      </div>
      <BudgetPlanning initialBudgets={budgets} />
    </>
  )
}
