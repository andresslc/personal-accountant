import { DashboardView } from "@/components/dashboard/dashboard-view"
import { getDashboardPageData } from "@/lib/data/dashboard-data"
import { createClient } from "@/lib/supabase/server"
import { USE_MOCK_DATA } from "@/lib/config/data-source"

export default async function Dashboard() {
  const supabase = USE_MOCK_DATA ? undefined : await createClient()
  const initialData = await getDashboardPageData(supabase)

  return <DashboardView initialData={initialData} />
}
