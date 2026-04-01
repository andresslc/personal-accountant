---
name: Data layer architecture
description: dashboard-data.ts uses request-scoped TTL cache to deduplicate concurrent Supabase queries; getRecentTransactions and getTransactionCategories have their own direct queries
type: project
---

The data layer in `lib/data/dashboard-data.ts` has a module-level request-scoped cache (5s TTL) that deduplicates `getTransactions`, `getIncomeVsExpenses`, and `getExpensesByCategory` calls. This prevents redundant Supabase queries when analytics functions (getCashFlowData, getNetWorth, getExpenseBreakdown, getTopSpendingCategories) are called concurrently in the same request.

**Why:** The analytics-reports page and finance-service both call multiple analytics functions in a single `Promise.all`, each of which internally called `getTransactions()` -- resulting in 4+ redundant full-table fetches per page load.

**How to apply:** When adding new derived data functions that depend on `getTransactions`, `getIncomeVsExpenses`, or `getExpensesByCategory`, the caching will automatically deduplicate within a 5s window. For new base queries, consider adding cache entries if they will be called from multiple consumers.
