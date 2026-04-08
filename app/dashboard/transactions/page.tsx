import { TransactionsManager } from "@/components/dashboard/transactions-manager"
import { getTransactionsPageData } from "@/lib/data/dashboard-data"
import { createClient } from "@/lib/supabase/server"
import { USE_MOCK_DATA } from "@/lib/config/data-source"

export default async function TransactionsPage() {
  const supabase = USE_MOCK_DATA ? undefined : await createClient()
  const { transactions, categoryOptions } = await getTransactionsPageData(supabase)

  return (
    <>
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Transactions</h1>
        <p className="text-foreground/70 mt-2">Manage and analyze all your transactions</p>
      </div>
      <TransactionsManager
        initialTransactions={transactions}
        initialCategoryOptions={categoryOptions}
      />
    </>
  )
}
