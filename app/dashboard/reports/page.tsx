import { AnalyticsReports } from "@/components/dashboard/analytics-reports"

export default function ReportsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-foreground/70 mt-2">Deep insights into your financial trends</p>
      </div>
      <AnalyticsReports />
    </>
  )
}
