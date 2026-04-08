import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReportsLoading() {
  return (
    <>
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-foreground/70 mt-2">Deep insights into your financial trends</p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-3">
            <Skeleton className="h-10 w-full sm:w-40" />
            <Skeleton className="h-10 w-28" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 border border-border">
            <Skeleton className="mb-6 h-5 w-40" />
            <Skeleton className="h-[300px] w-full" />
          </Card>
          <Card className="p-6 border border-border">
            <Skeleton className="mb-6 h-5 w-40" />
            <div className="flex flex-col sm:flex-row gap-6">
              <Skeleton className="h-[250px] w-full sm:w-1/2" />
              <div className="flex-1 space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 border border-border">
            <Skeleton className="mb-6 h-5 w-56" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6 border border-border">
            <Skeleton className="mb-6 h-5 w-56" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between pb-4 border-b border-border last:border-b-0"
                >
                  <div>
                    <Skeleton className="mb-2 h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6 border border-border">
          <Skeleton className="mb-6 h-5 w-40" />
          <Skeleton className="h-[300px] w-full" />
        </Card>
      </div>
    </>
  )
}
