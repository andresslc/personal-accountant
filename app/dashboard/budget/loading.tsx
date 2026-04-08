import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const OVERVIEW_CARD_COUNT = 3
const BUDGET_CARD_COUNT = 6

export default function BudgetLoading() {
  return (
    <>
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Budget Planning</h1>
        <p className="text-foreground/70 mt-2">Set and track your spending limits</p>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: OVERVIEW_CARD_COUNT }).map((_, index) => (
            <Card key={index} className="p-6 border border-border">
              <Skeleton className="mb-2 h-3 w-24" />
              <Skeleton className="h-9 w-40" />
              {index === 2 ? <Skeleton className="mt-4 h-3 w-32" /> : null}
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-36" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: BUDGET_CARD_COUNT }).map((_, index) => (
            <Card key={index} className="p-6 border border-border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="mb-2 h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-6" />
              </div>
              <Skeleton className="mb-4 h-3 w-full" />
              <Skeleton className="mb-2 h-4 w-36" />
              <Skeleton className="h-3 w-28" />
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
