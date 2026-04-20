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

**After EVERY task — whether Claude did it directly or a subagent did it — follow this sequence:**

1. **Verify it works.** Run `npm run build` (and `npm run lint` when the change is risky) and confirm zero errors. If the task touched UI/behavior that the build can't catch, describe the manual check needed. Do NOT proceed to commit if the build fails — fix the underlying issue first.
2. **Commit and push via the GitHub MCP.** Use `mcp__github__push_files` against `andresslc/personal-accountant` on branch `main` with the full, final contents of every file the task changed. Do NOT use `git push` — the local HTTPS credentials for this repo are wrong (they resolve to a different user) and will 403. The MCP protocol is the only working push path from this environment.
3. **Sync the local checkout afterward.** After the MCP push, run `git fetch origin main && git reset origin/main` so the local branch matches the new remote commit. This drops any local placeholder commit you may have made with `git commit` and preserves unrelated working-tree changes (e.g. `.claude/settings.local.json`).
4. **Report the commit SHA and URL** back to the user so they can inspect the change on GitHub.

Additional rules:
- Default branch: `main`.
- Use conventional commit messages: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`. Keep the subject under 72 chars; put reasoning in the body.
- Never commit `.env*`, credentials, or `.claude/settings.local.json`. When pushing via the MCP, send ONLY the files the task actually changed — do not include unrelated working-tree modifications.
- When a subagent completes a coding task, the main Claude is responsible for the verify → push → sync → report sequence. Do not instruct subagents to commit/push themselves.
- When creating PRs (rare — direct pushes to `main` are the default), target `main` as the base branch.

## Environment Variables
| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_USE_MOCK_DATA` | `true` = mock data, `false` = Supabase (default: `true`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (only needed when mock is `false`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (only needed when mock is `false`) |
| `AI_PROVIDER` | `openai` or `gemini` (default: `openai`) |
| `OPENAI_API_KEY` | OpenAI key (if using openai provider) |
| `GEMINI_API_KEY` | Gemini key (if using gemini provider) |
| `LANGSMITH_TRACING` | `true` to enable LangSmith run tracing. Unset = no tracing. |
| `LANGSMITH_API_KEY` | LangSmith API key ([smith.langchain.com → Settings → API Keys](https://smith.langchain.com)). Required when tracing is on. |
| `LANGSMITH_PROJECT` | Project name to send runs to (default: `finflow`). |
| `LANGSMITH_ENDPOINT` | LangSmith API endpoint (default: `https://api.smith.langchain.com`). |

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

## Agent Delegation (MANDATORY)

**Before implementing any task, ALWAYS review the list of available subagents
and delegate the work if any of them match the task description.** Do not start
writing code directly when a purpose-built agent exists for the job.

Workflow for every non-trivial task:

1. Read the task intent (feature, bug fix, refactor, UI change, data change, AI change, DB change, security review).
2. Scan the available subagents (see the `Agent` tool description) and pick the best match by comparing the task to each agent's `description` / examples.
3. If a suitable agent exists, launch it via the `Agent` tool with a clear prompt — do not duplicate its work yourself.
4. Only fall back to implementing directly when no agent fits, or when the task is trivially small (1–2 line tweak, rename, typo fix, reading a file to answer a question).

Current relevant agents for FinFlow work:

| Task type | Agent to use |
|-----------|--------------|
| Business logic, API routes, server actions, data fetching, routing | `nextjs-logic-engineer` or `nextjs-developer` |
| UI components, styling, layout, responsive design, visual changes | `ui-ux-engineer` |
| AI parser, prompts, AI providers, data analysis, ML/statistics | `ai-workflow-engineer` |
| Database schema, SQL migrations, Supabase tables/views, RLS policies | `database-manager` |
| Project-wide FinFlow changes that must follow FinFlow conventions | `finflow-dev` |
| Codebase exploration / answering "how does X work" questions | `Explore` |
| Multi-step implementation planning | `Plan` |

When in doubt, prefer the more specialized agent. It is NOT acceptable to
implement a UI change without `ui-ux-engineer`, a DB migration without
`database-manager`, or an AI/prompt change without `ai-workflow-engineer`
unless the change is a true one-liner.

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
