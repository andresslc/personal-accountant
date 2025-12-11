import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TransactionsManager } from "@/components/dashboard/transactions-manager"

export default function TransactionsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1">
        <Header />
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-foreground/70 mt-2">Manage and analyze all your transactions</p>
          </div>
          <TransactionsManager />
        </div>
      </main>
    </div>
  )
}
