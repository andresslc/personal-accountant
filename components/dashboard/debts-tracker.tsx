"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DebtQuickCreateDialog } from "@/components/dashboard/debt-quick-create-dialog"
import { AIRecommendationsDialog } from "@/components/dashboard/ai-insights-dialog"
import { deleteDebt } from "@/lib/data/dashboard-data"
import { useAuth } from "@/components/auth-provider"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { CreditCard, Percent, Calendar, Eye, Plus, Trash2 } from "lucide-react"
import { useCurrency } from "@/components/currency-provider"
import {
  type LiabilityUI,
  payoffTimelineData,
  getTotalDebt,
  getWeightedAverageApr,
  getProgressPercent,
  estimatedDebtFreeDate,
} from "@/lib/data/dashboard-data"
import { getLiabilityIcon } from "@/lib/ui/category-icons"

type Liability = Omit<LiabilityUI, "icon">

type DebtsTrackerProps = {
  initialLiabilities: Liability[]
}

export function DebtsTracker({ initialLiabilities }: DebtsTrackerProps) {
  const searchParams = useSearchParams()
  const { format, compact } = useCurrency()
  const { user } = useAuth()
  const [payoffStrategy, setPayoffStrategy] = useState("avalanche")
  const [liabilities, setLiabilities] = useState<Liability[]>(initialLiabilities)
  const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDeleteDebt = async (liability: Liability) => {
    if (!user) return
    setDeletingId(liability.id)
    const success = await deleteDebt(liability.id, user.id)
    if (success) {
      setLiabilities((current) => current.filter((item) => item.id !== liability.id))
    } else {
      console.error("Failed to delete debt", liability.id)
    }
    setDeletingId(null)
  }

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setIsDebtDialogOpen(true)
    }
  }, [searchParams])

  const totalDebt = getTotalDebt(liabilities)
  const avgApr = getWeightedAverageApr(liabilities)
  return (
    <div className="flex-1 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Debt Payoff Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your liabilities and visualize your road to freedom.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-56">
            <label className="text-sm font-medium text-foreground mb-2 block">Payoff Strategy</label>
            <Select value={payoffStrategy} onValueChange={setPayoffStrategy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avalanche">Avalanche (High Interest First)</SelectItem>
                <SelectItem value="snowball">Snowball (Lowest Balance First)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AIRecommendationsDialog
            endpoint="/api/ai/insights/debts"
            title="Debt Payoff Strategy"
            description="Get a personalized debt payoff plan to save on interest and become debt-free faster."
            triggerLabel="Debt Advice"
            defaultAnalysisType="debt_strategy"
            lockAnalysisType
          />
          <DebtQuickCreateDialog
            open={isDebtDialogOpen}
            onOpenChange={setIsDebtDialogOpen}
            onDebtCreated={(newDebt) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { icon: _icon, ...rest } = newDebt
              setLiabilities((current) => [rest, ...current])
            }}
            trigger={
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4" />
                Add Debt
              </Button>
            }
          />
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Outstanding Debt
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {format(totalDebt)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across {liabilities.length} liabilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Interest Rate (APR)
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Percent className="w-5 h-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgApr}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              Weighted average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Debt-Free Date
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {estimatedDebtFreeDate}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Estimated payoff
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Liabilities Grid */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">
          Active Liabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liabilities.map((liability) => {
            const Icon = getLiabilityIcon(liability.type)
            const progressPercent = getProgressPercent(
              liability.currentBalance,
              liability.originalBalance
            )

            return (
              <Card key={liability.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="w-5 h-5 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">
                          {liability.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {liability.apr}% APR
                        </p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete debt"
                          disabled={!user || deletingId === liability.id}
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this debt?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove {liability.name} from your debts. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteDebt(liability)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-foreground">
                        Current Balance
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {format(liability.currentBalance)}
                      </p>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {progressPercent.toFixed(0)}% paid off
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Min. Payment
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {format(liability.minPayment)}/mo
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Due Day</p>
                      <p className="text-sm font-bold text-foreground">
                        {liability.dueDay}th
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="gap-2">
                  <Button variant="ghost" className="flex-1 text-xs h-10">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-xs h-10 border-amber-500 text-amber-500 hover:bg-amber-500/10 bg-transparent"
                  >
                    Record Payment
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Payoff Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Projected Payoff Timeline</CardTitle>
          <CardDescription>
            Estimated debt balance over the next 12 months using{" "}
            {payoffStrategy === "avalanche" ? "Avalanche" : "Snowball"} strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={payoffTimelineData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
              />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis
                stroke="var(--muted-foreground)"
                tickFormatter={(value) => compact(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                formatter={(value) => format(value as number)}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="var(--primary)"
                fillOpacity={1}
                fill="url(#colorBalance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
