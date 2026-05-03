import { SubscriptionsManager } from "@/components/dashboard/subscriptions-manager"
import { getSubscriptionsPageData } from "@/lib/data/dashboard-data"
import { createClient } from "@/lib/supabase/server"
import { USE_MOCK_DATA } from "@/lib/config/data-source"
import { ensureArchetypeResolver } from "@/lib/mocks/archetypes/register"

export default async function SubscriptionsPage() {
  await ensureArchetypeResolver()
  const supabase = USE_MOCK_DATA ? undefined : await createClient()
  const data = await getSubscriptionsPageData(supabase)
  return <SubscriptionsManager initial={data} />
}
