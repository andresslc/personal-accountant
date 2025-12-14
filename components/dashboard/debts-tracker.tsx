import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CreditCard, Percent, Calendar, Eye } from "lucide-react";
import {
  liabilitiesData,
  payoffTimelineData,
  getTotalDebt,
  getWeightedAverageApr,
  getProgressPercent,
  estimatedDebtFreeDate,
} from "@/lib/mocks";
import { useState } from "react";

export function DebtsTracker() {
  const [payoffStrategy, setPayoffStrategy] = useState("avalanche");

  const totalDebt = getTotalDebt();
  const avgApr = getWeightedAverageApr();
  return (
    <div className="flex-1 p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Debt Payoff Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your liabilities and visualize your road to freedom.
          </p>
        </div>
        <div className="w-48">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Payoff Strategy
          </label>
          <Select value={payoffStrategy} onValueChange={setPayoffStrategy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="avalanche">
                Avalanche (High Interest First)
              </SelectItem>
              <SelectItem value="snowball">
                Snowball (Lowest Balance First)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Outstanding Debt
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${totalDebt.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across {liabilitiesData.length} liabilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Interest Rate (APR)
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Percent className="w-5 h-5 text-amber-600" />
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
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
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
          {liabilitiesData.map((liability) => {
            const Icon = liability.icon;
            const progressPercent = getProgressPercent(
              liability.currentBalance,
              liability.originalBalance
            );

            return (
              <Card key={liability.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {liability.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {liability.apr}% APR
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-foreground">
                        Current Balance
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        ${liability.currentBalance.toLocaleString()}
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
                        ${liability.minPayment}/mo
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
                  <Button variant="ghost" className="flex-1 text-xs h-9">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-xs h-9 border-amber-500 text-amber-600 hover:bg-amber-50 bg-transparent"
                  >
                    Record Payment
                  </Button>
                </CardFooter>
              </Card>
            );
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
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorBalance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
