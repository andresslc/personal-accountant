---
name: Data layer architecture
description: dashboard-data.ts has request-scoped cache, optional client param threading for SSR, and page-level fetchers; icons are split out to lib/ui/category-icons.ts
type: project
---

The data layer in `lib/data/dashboard-data.ts` has a module-level request-scoped cache (5s TTL) that deduplicates `getTransactions`, `getIncomeVsExpenses`, and `getExpensesByCategory` calls. This prevents redundant Supabase queries when analytics functions (`getCashFlowData`, `getNetWorth`, `getExpenseBreakdown`, `getTopSpendingCategories`) are called concurrently in the same request.

**Why:** The analytics-reports page and finance-service both call multiple analytics functions in a single `Promise.all`, each of which internally calls `getTransactions()` -- resulting in 4+ redundant full-table fetches per page load.

**How to apply:** When adding new derived data functions that depend on `getTransactions`, `getIncomeVsExpenses`, or `getExpensesByCategory`, the caching will automatically deduplicate within a 5s window. For new base queries, consider adding cache entries if they will be called from multiple consumers.

---

All read helpers (`getTransactions`, `getRecentTransactions`, `getBudgets`, `getDebts`, `getIncomeVsExpenses`, `getExpensesByCategory`, `getCashFlowData`, `getExpenseBreakdown`, `getTopSpendingCategories`, `getSubscriptions`, `getNetWorth`, `getCategoryMap`) accept an **optional `client?: AnySupabaseClient` parameter**. This lets server components pass in the SSR-aware client from `@/lib/supabase/server` so the data layer works in both server and browser contexts. If the param is omitted, they fall back to the browser client via `getSupabaseClient()`.

**Why:** In a Server Component, `getSupabaseClient()` (browser client) would silently return empty results because cookies/auth don't resolve the same way. Threading the SSR client through is required for server-side data fetching.

**How to apply:** When calling any data helper from a Server Component, always get the client via `USE_MOCK_DATA ? undefined : await createClient()` (from `@/lib/supabase/server`) and pass it through. The page-level fetchers `getDashboardPageData`, `getBudgetPageData`, `getDebtsPageData`, `getReportsPageData`, `getTransactionsPageData` already do this — prefer them over wiring up multiple base queries manually in a page.

---

Lucide icons cannot cross the server/client boundary because they're React component functions. Icon derivation is centralized in `lib/ui/category-icons.ts` which exports `getCategoryIcon`, `getLiabilityIcon`, and `getSummaryIcon`. The data helpers (`getBudgets`, `getDebts`, etc.) still return the icon attached to the row for backward compatibility with mock data, but **page-level fetchers strip icons** before returning (e.g. `BudgetPageData.budgets` is `Omit<BudgetItemUI, "icon">[]`). Client components then look up the icon at render time via the helper.

**Why:** Passing a Lucide component across the server/client boundary throws "Functions cannot be passed directly to Client Components" at runtime.

**How to apply:** When adding a new client component that consumes server-fetched data with an icon, accept `Omit<Type, "icon">` as the prop type and call `getCategoryIcon(item.category)` or `getLiabilityIcon(item.type)` at render time. Do not re-attach icons in page.tsx. For summary cards, use the `iconKey` discriminant (`"balance" | "income" | "expenses" | "savings"`) on `SerializableSummaryCard` and look up via `getSummaryIcon`.

The helper functions in `lib/mocks/budget.ts` (`getTotalBudget`, `getTotalSpent`, `getRemainingBudget`) and `lib/mocks/debts.ts` (`getTotalDebt`, `getWeightedAverageApr`) accept `Pick<...>` shapes so client components can pass icon-less arrays directly.
