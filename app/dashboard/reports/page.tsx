import { AnalyticsReports } from "@/components/dashboard/analytics-reports"
import { getReportsPageData } from "@/lib/data/dashboard-data"
import { createClient } from "@/lib/supabase/server"
import { USE_MOCK_DATA } from "@/lib/config/data-source"

export default async function ReportsPage() {
  const supabase = USE_MOCK_DATA ? undefined : await createClient()
  const {
    cashFlow,
    expenseBreakdown,
    topSpendingCategories,
    subscriptions,
    netWorth,
  } = await getReportsPageData(supabase)

  return (
    <>
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-foreground/70 mt-2">Deep insights into your financial trends</p>
      </div>
      <AnalyticsReports
        initialCashFlow={cashFlow}
        initialExpenseBreakdown={expenseBreakdown}
        initialTopSpendingCategories={topSpendingCategories}
        initialSubscriptions={subscriptions}
        initialNetWorth={netWorth}
      />
    </>
  )
}
