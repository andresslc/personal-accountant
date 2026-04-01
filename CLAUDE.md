# Claude Instructions — Personal Accountant (FinFlow)

## Project Overview
Personal finance dashboard: track transactions, set budgets, manage debts, view reports.
App name in UI: **FinFlow**. Repo: https://github.com/andresslc/personal-accountant.git

## Tech Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Styling:** Tailwind CSS 4, shadcn/ui (new-york style), Lucide icons
- **Database:** Supabase (PostgreSQL with Row-Level Security)
- **AI:** OpenAI (gpt-4o-mini) or Gemini (1.5-flash), controlled by `AI_PROVIDER` env var
- **Charts:** Recharts
- **Validation:** Zod
- **Package manager:** npm (not pnpm — ignore the stale pnpm-lock.yaml)

## Commands
- `npm run dev` — start dev server (localhost:3000)
- `npm run build` — production build (run before pushing)
- `npm run lint` — ESLint check

## GitHub Workflow
- After completing any feature, fix, or meaningful change, always commit and push.
- Default branch: `main`
- Use conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`
- Always run `npm run build` before pushing to verify no errors.
- When creating PRs, target `main` as the base branch.

## Environment Variables
| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_USE_MOCK_DATA` | `true` = mock data, `false` = Supabase (default: `true`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (only needed when mock is `false`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (only needed when mock is `false`) |
| `AI_PROVIDER` | `openai` or `gemini` (default: `openai`) |
| `OPENAI_API_KEY` | OpenAI key (if using openai provider) |
| `GEMINI_API_KEY` | Gemini key (if using gemini provider) |

## Project Structure
```
app/
  page.tsx                              # Landing page
  layout.tsx                            # Root layout (Geist font, Vercel Analytics)
  api/parse-transaction/route.ts        # AI transaction parser endpoint
  dashboard/
    page.tsx                            # Main dashboard (summary, charts, recent transactions)
    transactions/page.tsx               # Full transactions list with filters
    budget/page.tsx                     # Budget planning view
    debts/page.tsx                      # Debt payoff tracker
    reports/page.tsx                    # Analytics and reports

components/
  dashboard/                            # All dashboard UI components (ACTIVE — use these)
    sidebar.tsx                         # Navigation sidebar
    header.tsx                          # Top header with greeting
    quick-add-menu.tsx                  # Global "Quick Add" dialog (transaction/budget/debt)
    smart-transaction-hub.tsx           # Transaction creation (Manual + CSV tabs)
    budget-planning.tsx                 # Budget cards with create dialog
    budget-quick-create-dialog.tsx      # Reusable budget creation modal
    debts-tracker.tsx                   # Debt cards, KPIs, payoff chart
    debt-quick-create-dialog.tsx        # Reusable debt creation modal
    summary-cards.tsx                   # KPI cards on dashboard
    income-vs-expenses-chart.tsx        # Bar chart
    expenses-by-category-chart.tsx      # Pie chart
    transactions-table.tsx              # Recent transactions widget
    transactions-manager.tsx            # Full transactions page with filters
    analytics-reports.tsx               # Reports page charts and tables
    transaction-confirmation-card.tsx   # AI parse result confirmation
  ui/                                   # shadcn/ui primitives (do NOT edit manually)
  auth-card.tsx                          # Shared auth layout (Google OAuth + branding)
  auth-provider.tsx                      # React context for auth state
  currency-provider.tsx                  # Currency formatting context
  theme-provider.tsx                     # next-themes wrapper

lib/
  config/data-source.ts                 # USE_MOCK_DATA flag
  data/dashboard-data.ts               # Centralized data layer (mocks OR Supabase)
  mocks/                                # Mock data for development
    index.ts                            # Re-exports everything
    transactions.ts, budget.ts, debts.ts, analytics.ts, summary.ts, categories.ts
  supabase/
    client.ts                           # Supabase browser client (lazy-loaded in data layer)
    types.ts                            # Database TypeScript interfaces
  ai/
    provider.ts                         # AI provider factory (OpenAI / Gemini)
    prompt.ts                           # System prompt for transaction parsing
    types.ts                            # ParsedTransaction Zod schema
```

## Architecture Rules

### Data Access
- Components MUST get data from `lib/data/dashboard-data.ts`, never import `lib/mocks/` directly.
- `dashboard-data.ts` checks `USE_MOCK_DATA` and returns mock data or queries Supabase.
- Supabase client is lazy-initialized — it only loads when `USE_MOCK_DATA=false` and env vars exist.
- When adding new data, add a mock version in `lib/mocks/`, a Supabase query path in `dashboard-data.ts`, and export a getter function.

### Components
- Dashboard components live in `components/dashboard/`. Page files in `app/dashboard/` should be thin wrappers.
- Reusable creation dialogs follow the pattern of `budget-quick-create-dialog.tsx`: controlled/uncontrolled open state, optional trigger prop, `onCreated` callback, form reset on submit, "View full page" link.
- Components use `"use client"` directive when they need hooks/interactivity.
- Use shadcn/ui components from `components/ui/`. To add new ones: `npx shadcn@latest add <component>`.

### Supabase Database Tables
- `categories` — expense/income categories
- `transactions` — all financial transactions
- `budget_items` — monthly spending limits per category
- `liabilities` — debts (credit cards, loans)
- `subscriptions` — recurring subscriptions
- Views: `monthly_summary`, `budget_with_spending`

### AI Transaction Parsing
- API route at `app/api/parse-transaction/route.ts`
- Uses `lib/ai/provider.ts` to select OpenAI or Gemini
- System prompt in `lib/ai/prompt.ts` — supports Spanish and English input
- Default currency: COP (Colombian Pesos)
- Returns structured `ParsedTransaction` validated by Zod

## Do NOT
- Commit `.env.local`, `.cursor/mcp.json`, or any file with secrets
- Import from `lib/mocks/` directly in components (use `lib/data/dashboard-data.ts`)
- Import `lib/supabase/client.ts` at the top level of any file (crashes when env vars are missing)
- Edit `components/ui/` files manually — use shadcn CLI instead
- Add inline comments that just narrate what code does
