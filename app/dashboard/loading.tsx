import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const SUMMARY_CARD_COUNT = 4
const RECENT_TRANSACTION_ROW_COUNT = 5

export default function DashboardLoading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: SUMMARY_CARD_COUNT }).map((_, index) => (
          <Card key={index} className="p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="h-8 w-32" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <Card className="p-6 border border-border">
            <Skeleton className="mb-6 h-5 w-40" />
            <Skeleton className="h-[300px] w-full" />
          </Card>
        </div>
        <Card className="p-6 border border-border">
          <Skeleton className="mb-6 h-5 w-40" />
          <Skeleton className="h-[300px] w-full" />
        </Card>
      </div>

      <div className="mt-8">
        <Card className="border border-border">
          <div className="p-4 md:p-6 border-b border-border">
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left">
                    <Skeleton className="h-4 w-12" />
                  </th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left">
                    <Skeleton className="h-4 w-24" />
                  </th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-right">
                    <Skeleton className="ml-auto h-4 w-16" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: RECENT_TRANSACTION_ROW_COUNT }).map((_, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="px-3 py-3 md:px-6 md:py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="hidden sm:flex w-8 h-8 rounded-lg" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4">
                      <Skeleton className="ml-auto h-4 w-20" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}
