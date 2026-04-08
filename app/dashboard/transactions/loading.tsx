import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const SKELETON_ROW_COUNT = 8

export default function TransactionsLoading() {
  return (
    <>
      <div className="mb-4 md:mb-8">
        <Skeleton className="h-8 w-48 md:h-9 md:w-56" />
        <Skeleton className="mt-3 h-4 w-72" />
      </div>
      <div className="space-y-6">
        <Card className="p-4 border border-border">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-full lg:w-40" />
              <Skeleton className="h-10 w-full lg:w-40" />
              <Skeleton className="h-10 w-full lg:w-40" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-36" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left">
                    <Skeleton className="h-4 w-12" />
                  </th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left">
                    <Skeleton className="h-4 w-24" />
                  </th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left hidden sm:table-cell">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-right">
                    <Skeleton className="ml-auto h-4 w-16" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="px-3 py-3 md:px-6 md:py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4 hidden sm:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4">
                      <Skeleton className="ml-auto h-4 w-20" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-muted/50">
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
