"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCurrency } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { COP_PER_USD, type SupportedCurrency } from "@/lib/utils/currency"

export default function SettingsPage() {
  const { user } = useAuth()
  const { currency, setCurrency } = useCurrency()

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "User"

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-sm">Name</Label>
            <p className="text-foreground font-medium">{displayName}</p>
          </div>
          <div>
            <Label className="text-muted-foreground text-sm">Email</Label>
            <p className="text-foreground font-medium">{user?.email ?? "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>
            Choose how monetary values are displayed throughout the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Label htmlFor="currency-select" className="shrink-0">Display Currency</Label>
            <Select
              value={currency}
              onValueChange={(value) => setCurrency(value as SupportedCurrency)}
            >
              <SelectTrigger id="currency-select" className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COP">COP — Colombian Peso ($1.234.567)</SelectItem>
                <SelectItem value="USD">USD — US Dollar ($1,234.56)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Amounts are stored in COP and converted at {COP_PER_USD.toLocaleString("en-US")} COP / 1 USD for display. New transactions, budgets, and debts you create are always interpreted as COP regardless of the selected display currency.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
