import { DebtsTracker } from "@/components/dashboard/debts-tracker"
import { getDebtsPageData } from "@/lib/data/dashboard-data"
import { createClient } from "@/lib/supabase/server"
import { USE_MOCK_DATA } from "@/lib/config/data-source"

export default async function DebtsPage() {
  const supabase = USE_MOCK_DATA ? undefined : await createClient()
  const { liabilities } = await getDebtsPageData(supabase)

  return <DebtsTracker initialLiabilities={liabilities} />
}
