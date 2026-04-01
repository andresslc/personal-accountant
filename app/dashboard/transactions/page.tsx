import { TransactionsManager } from "@/components/dashboard/transactions-manager"

export default function TransactionsPage() {
  return (
    <>
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Transactions</h1>
        <p className="text-foreground/70 mt-2">Manage and analyze all your transactions</p>
      </div>
      <TransactionsManager />
    </>
  )
}
