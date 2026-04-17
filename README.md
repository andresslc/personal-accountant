# FinFlow — AI-Powered Personal Finance Dashboard

> **Note for AI assistants reading this file:** This README is optimized as a context
> primer. Skim "Hints for AI Assistants" near the end for conventions, gotchas, and
> the fastest way to answer common questions without re-exploring the repo.

A personal finance application that merges dashboards, charts, and multi-agent AI
into a single tool. Users track transactions, plan budgets, manage debts, view
reports, and talk to a financial chat assistant that can call tools, run
forecasts, and read their data live.

- **Repo:** https://github.com/andresslc/personal-accountant
- **UI name:** FinFlow
- **Package name (historical):** `my-v0-project`
- **Default currency:** COP (Colombian Pesos)
- **Languages the AI understands:** English and Spanish

---

## The Problem

Managing personal finances is fragmented — bank accounts, credit cards, loans, and
subscriptions all live in different tools. Spreadsheets are tedious; most budgeting
apps are either too shallow or too complex. FinFlow consolidates everything into
one place and layers AI on top for interpretation and advice.

## What It Answers

- Where is my money going? — Categorized transactions with visual breakdowns.
- Am I staying within budget? — Real-time monitoring with over-spend warnings.
- When will I be debt-free? — Avalanche/snowball strategies with projections.
- What should I do next? — Chat agents, insights, and anomaly detection.

---

## Core Features

### 1. AI Financial Chat (`/dashboard/chat`)

- Multi-turn conversations with streaming (SSE) responses.
- Multimodal input: text, voice recording, image attachments.
- Tool-augmented LLM that queries the user's live financial data.
- Sub-agents in `lib/ai/chat/agents/`:
  - `debt-agent.ts` — payoff strategies.
  - `advisory-agent.ts` — personalized recommendations.
  - `prediction-agent.ts` — forecasts using `lib/predictions/*`.
- Financial memory — the system extracts and updates a user profile
  (`/api/ai/memory-update`) so advice improves over time.
- Guardrails: input and output rails in `lib/ai/guardrails/` (configurable).

### 2. Smart Transaction Management

Entry methods:

- **AI text** — natural language (Spanish/English). Endpoint: `/api/parse-transaction`.
- **Voice** — audio → transcription → structured parse.
- **Image** — receipt photo → vision extraction.
- **Manual form** — traditional entry with category, method, optional debt link.
- **CSV import** — bank-export bulk upload.

Multimodal input (voice/image/text) flows through a LangGraph state machine in
`lib/ai/multimodal-graph.ts` that classifies intent (transaction / budget / debt)
and emits validated output with confidence scores. A confirmation card
(`components/dashboard/multimodal-confirmation.tsx`) lets the user review before
saving.

Transaction types:

| Type | Direction | Example |
|---|---|---|
| `income` | + | Salary, freelance |
| `expense` | − | Groceries, utilities |
| `debt_payment` | − (applies to liability) | Credit card payment |

All amounts are stored as **positive numbers**; the `type` column determines the
financial direction.

### 3. AI Insights Engine

Dialog-based analyses available from any dashboard page. A single unified endpoint
routes by `type`:

- Endpoint: `POST /api/ai/insights/[type]` (dynamic route)
- Types served: `overview`, `spending`, `budget`, `debts`, `reports`, `anomaly`
- Streams results; supports date-range + custom-context filters.

### 4. Budget Planning (`/dashboard/budget`)

Monthly spending limits per category. Recurring or one-time. Visual progress bars
and color-coded over-spend warnings. Dashboard cards show Total Budget / Spent /
Remaining + days left in month.

### 5. Debt Payoff Tracker (`/dashboard/debts`)

Tracks balance, APR, minimum payment, due date. Strategies:

| Strategy | Logic | Best for |
|---|---|---|
| Avalanche | Highest APR first | Minimum total interest |
| Snowball | Lowest balance first | Psychological momentum |

12-month payoff projection, weighted-average APR, estimated debt-free date.
Calculations live in `lib/predictions/debt-payoff.ts`.

### 6. Analytics & Reports (`/dashboard/reports`)

- Cash-flow trend (line).
- Expense breakdown by category (pie).
- Top spending categories (ranked).
- Net worth growth (area).
- Recurring subscriptions inventory.
- Savings rate.

Filters: 7d / 30d / YTD / custom. PDF export supported.

### 7. Dashboard Overview (`/dashboard`)

KPI cards: Total Balance, Monthly Income, Monthly Expenses, Savings. Each with
period-over-period trend. Below: Income-vs-Expenses bar chart, Expenses-by-Category
pie, Recent Transactions widget.

### 8. Quick Add Menu

Global floating action button on every dashboard page:
`components/dashboard/quick-add-menu.tsx`. Opens multimodal transaction entry,
budget-create, or debt-create dialogs.

### 9. Settings (`/dashboard/settings`)

User preferences (currency, theme, profile basics).

### 10. Predictions Engine (`lib/predictions/`)

Pure-TypeScript forecasting and diagnostic modules consumed by chat agents and the
`/api/predictions` route:

- `anomaly-detection.ts` — flags unusual transactions.
- `budget-adherence.ts` — how closely the user stays on budget.
- `debt-payoff.ts` — amortization schedules, strategy comparison.
- `savings-projection.ts` — savings run-rate extrapolation.
- `spending-diagnosis.ts` — pattern identification.
- `spending-forecast.ts` — category-level forecasts.
- `data-pipeline.ts` — shared data shaping helpers.

---

## Authentication

- Supabase Auth with OAuth (Google) + email/password.
- `/login`, `/signup` pages.
- `/auth/callback` — OAuth code exchange.
- `/auth/signout` — session teardown.
- Next.js `middleware.ts` refreshes sessions and protects `/dashboard/*`.
- Row-Level Security on every table.
- Client-side: `components/auth-provider.tsx` exposes `useAuth()`.
- Server-side guard: `lib/auth-guard.ts`.

---

## API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/parse-transaction` | POST | Natural-language → structured transaction |
| `/api/parse-multimodal` | POST | Multimodal pipeline (text/audio/image) via LangGraph |
| `/api/chat` | POST | Streaming chat with tool use + multimodal input |
| `/api/ai/insights/[type]` | POST | Unified insights endpoint (overview/spending/budget/debts/reports/anomaly) |
| `/api/ai/memory-update` | POST | Extract & merge the user's financial-intent profile |
| `/api/predictions` | POST | Forecasts from `lib/predictions/*` |
| `/auth/callback` | GET | Supabase OAuth callback |
| `/auth/signout` | POST | Clear session |

Shared helpers for the AI routes live in `app/api/ai/_shared.ts`.

---

## Database (Supabase / PostgreSQL)

Every table has Row-Level Security so users can only access their own rows.

**Tables**

| Table | Purpose |
|---|---|
| `categories` | System + user income/expense categories |
| `transactions` | All financial movements |
| `liabilities` | Debts (credit cards, loans, mortgages) |
| `budget_items` | Monthly spending limits per category |
| `subscriptions` | Recurring charges with frequency/next-due |

**Views**

| View | Purpose |
|---|---|
| `monthly_summary` | Aggregated income/expenses/savings per month |
| `budget_with_spending` | Budget limits joined with actual spend |

Setup SQL is in `SUPABASE_SETUP.md`. Training-user seed: `npm run db:seed`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js **16.0.7** (App Router) |
| UI library | React **19.2** |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui (new-york) + Radix primitives |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (`@supabase/ssr`) |
| AI orchestration | LangChain + LangGraph (`@langchain/langgraph`) |
| AI providers | OpenAI (`gpt-4o-mini`) or Google Gemini (`gemini-2.5-flash`) |
| Audio transcription | OpenAI Whisper / Gemini native |
| Icons | Lucide React |
| Deployment | Vercel |
| Analytics | Vercel Analytics + Speed Insights |
| Evals | Vitest (unit) + Promptfoo (LLM) |
| Package manager | **npm** (ignore stale `pnpm-lock.yaml`) |

---

## Project Structure (verified)

```
app/
  page.tsx                          # Landing
  layout.tsx                        # Root layout (Geist, theme, analytics, speed insights)
  middleware.ts                     # Auth session refresh + route protection
  login/                            # Login page + form
  signup/                           # Signup page + form
  auth/
    callback/route.ts               # OAuth code exchange
    signout/route.ts                # Session cleanup
  api/
    parse-transaction/route.ts
    parse-multimodal/route.ts
    chat/route.ts
    predictions/route.ts
    ai/
      _shared.ts                    # Shared helpers for AI routes
      insights/[type]/route.ts      # Unified insights (dynamic type param)
      memory-update/route.ts
  dashboard/
    layout.tsx                      # Sidebar + header (auth-gated)
    loading.tsx
    page.tsx                        # Overview
    transactions/page.tsx
    budget/page.tsx
    debts/page.tsx
    reports/page.tsx
    chat/page.tsx
    settings/page.tsx

components/
  ui/                               # shadcn/ui primitives (DO NOT edit manually)
  auth-provider.tsx                 # Auth context + useAuth()
  theme-provider.tsx                # next-themes wrapper
  currency-provider.tsx             # Currency formatting context
  auth-card.tsx                     # Shared auth layout
  dashboard/
    sidebar.tsx
    header.tsx
    dashboard-view.tsx              # Dashboard overview composition
    summary-cards.tsx
    income-vs-expenses-chart.tsx
    expenses-by-category-chart.tsx
    transactions-table.tsx
    transactions-manager.tsx
    smart-transaction-hub.tsx       # Manual + CSV tabs
    budget-planning.tsx
    budget-quick-create-dialog.tsx
    debts-tracker.tsx
    debt-quick-create-dialog.tsx
    analytics-reports.tsx
    quick-add-menu.tsx              # Global FAB
    ai-insights-dialog.tsx
    multimodal-confirmation.tsx
    transaction-confirmation-card.tsx
    chat/
      chat-view.tsx                 # Container + state
      chat-input.tsx                # Text/audio/image input
      message-list.tsx
      message-bubble.tsx
      chat-markdown.tsx             # Markdown renderer for messages
      action-card.tsx               # Suggested-action cards
      chat-welcome.tsx              # Onboarding prompts
      typing-indicator.tsx

lib/
  auth-guard.ts                     # Server-side auth guard helpers
  date-utils.ts
  utils.ts
  utils/                            # Misc helpers
  ui/                               # UI helpers
  config/data-source.ts             # USE_MOCK_DATA flag
  data/
    dashboard-data.ts               # Centralized data layer (mocks OR Supabase)
    chat-history.ts                 # Chat persistence
  mocks/                            # Dev mock data
    index.ts
    transactions.ts  budget.ts  debts.ts  analytics.ts  summary.ts  categories.ts
  supabase/
    client.ts                       # Browser client (lazy)
    server.ts                       # Server client (cookies/SSR)
    middleware.ts                   # Auth middleware logic
    types.ts
  ai/
    provider.ts                     # Provider factory (OpenAI / Gemini)
    prompt.ts                       # Transaction parsing prompt
    types.ts                        # ParsedTransaction Zod schema
    multimodal-graph.ts             # LangGraph state machine (multimodal)
    multimodal-prompt.ts
    multimodal-types.ts
    finance-service.ts              # High-level insights service
    finance-types.ts                # Financial memory types
    guardrails/
      config.ts  index.ts  input-rails.ts  output-rails.ts  types.ts
    chat/
      orchestrator.ts               # Multi-turn chat + tool use
      tools.ts                      # Tool definitions exposed to the LLM
      prompts.ts                    # Chat system prompts
      context-builder.ts            # Financial context assembly
      types.ts
      agents/
        advisory-agent.ts
        debt-agent.ts
        prediction-agent.ts
  predictions/
    index.ts
    anomaly-detection.ts
    budget-adherence.ts
    data-pipeline.ts
    debt-payoff.ts
    savings-projection.ts
    spending-diagnosis.ts
    spending-forecast.ts
    types.ts

evals/
  vitest.config.ts
  setup.ts
  unit/                             # Vitest unit tests
  llm/                              # Promptfoo LLM evals (transactions/insights/chat)
  fixtures/

supabase/
  seed-training-user.sql            # npm run db:seed
```

---

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server at `http://localhost:3000` |
| `npm run build` | Production build (**run this before every push**) |
| `npm run lint` | ESLint |
| `npm run eval:unit` | Vitest unit evals |
| `npm run eval:llm:transactions` | Promptfoo: transaction parsing |
| `npm run eval:llm:insights` | Promptfoo: insights |
| `npm run eval:llm:chat` | Promptfoo: chat |
| `npm run eval:llm` | All LLM evals |
| `npm run eval` | Unit + LLM evals |
| `npm run db:seed` | Seed training user into Supabase |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_USE_MOCK_DATA` | No | `true` → local mocks (default), `false` → Supabase |
| `NEXT_PUBLIC_SUPABASE_URL` | If not mocked | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | If not mocked | Supabase anon key |
| `AI_PROVIDER` | No | `openai` (default) or `gemini` |
| `OPENAI_API_KEY` | If using OpenAI | OpenAI key |
| `GEMINI_API_KEY` | If using Gemini | Google Gemini key |

Never commit `.env*`, `.cursor/mcp.json`, or `.claude/settings.local.json`.

---

## Getting Started

```bash
git clone https://github.com/andresslc/personal-accountant.git
cd personal-accountant
npm install
cp .env.local.example .env.local   # then fill keys
npm run dev
```

With `NEXT_PUBLIC_USE_MOCK_DATA=true` (the default) the app works without a
Supabase project.

---

## Hints for AI Assistants

This section is written for another AI that will give the user coding hints. Use
it before spelunking through the repo.

### Architecture rules

1. **Data access is centralized.** Components MUST import from
   `lib/data/dashboard-data.ts`, never directly from `lib/mocks/` or
   `lib/supabase/*`. That module reads `USE_MOCK_DATA` and returns mocks or live
   Supabase rows.
2. **Supabase client is lazy-loaded.** Do NOT import `lib/supabase/client.ts` at
   the top of any module — it crashes when env vars are missing. Only the data
   layer may import it.
3. **Pages are thin.** `app/dashboard/**/page.tsx` files should mostly compose
   components from `components/dashboard/`.
4. **shadcn/ui is generated.** Never hand-edit files in `components/ui/`. Use
   `npx shadcn@latest add <component>`.
5. **AI insights go through one endpoint.** There is no
   `/api/ai/budget-insights` style route anymore — use
   `/api/ai/insights/[type]` with `type` in
   `{overview, spending, budget, debts, reports, anomaly}`.
6. **Predictions are framework-free.** `lib/predictions/*` is pure TS with no
   Next.js, Supabase, or AI dependencies — easy to unit-test and reuse.
7. **Currency defaults to COP** — don't hard-code USD.
8. **The multimodal pipeline is a LangGraph.** If the user wants to change how
   text/voice/image input is classified or parsed, edit
   `lib/ai/multimodal-graph.ts` + `lib/ai/multimodal-prompt.ts` +
   `lib/ai/multimodal-types.ts` together.
9. **Guardrails wrap AI calls.** Input/output rails live in
   `lib/ai/guardrails/`. Changes to prompts should consider both rails.
10. **Evals exist — use them.** When changing prompts or the multimodal schema,
    run `npm run eval:unit` and the relevant `npm run eval:llm:*` suite.

### Common task recipes

| Task | Where to look |
|---|---|
| Add a new dashboard widget | Create component in `components/dashboard/`, wire via `dashboard-data.ts`, mount in `app/dashboard/page.tsx` |
| Add a new data source | Add mock in `lib/mocks/`, add fetcher in `lib/data/dashboard-data.ts`, export a getter |
| Add a new AI tool the chat can call | `lib/ai/chat/tools.ts` (+ agent wiring in `lib/ai/chat/agents/*`) |
| Change the transaction-parsing prompt | `lib/ai/prompt.ts` + re-run `npm run eval:llm:transactions` |
| Change multimodal parsing | `lib/ai/multimodal-graph.ts` + `multimodal-prompt.ts` + `multimodal-types.ts` |
| Add a new insights type | `app/api/ai/insights/[type]/route.ts` dispatches by type — extend there + UI in `ai-insights-dialog.tsx` |
| Add a new DB table | Add SQL migration, update `lib/supabase/types.ts`, add queries in `dashboard-data.ts`, set up RLS |
| Add a new shadcn component | `npx shadcn@latest add <name>` — never edit `components/ui/` manually |

### Known gotchas

- **Do not use `git push` from the shell.** Local HTTPS creds resolve to a wrong
  user and 403. Push via GitHub MCP (`mcp__github__push_files`) against
  `andresslc/personal-accountant` on branch `main`.
- **Ignore `pnpm-lock.yaml`** — the project uses npm.
- **`.claude/settings.local.json` must stay out of commits.**
- **Lucide icons are not serializable.** Strip them before passing transactions
  from Server → Client components (see commit `597757b`).
- **Dashboard pages are server-rendered with skeletons.** See commit `5ee7171`
  and `app/dashboard/loading.tsx`. Don't accidentally convert a page back to a
  client component.
- **`AI_PROVIDER` is runtime-selectable.** Both providers must stay wired; don't
  drop `@google/generative-ai` or OpenAI SDK calls.
- **Transactions are always positive.** Sign comes from `type`, not the number.
- **Date input can be Spanish or English.** Keep the prompt multilingual.

### Demo archetypes

When `NEXT_PUBLIC_USE_MOCK_DATA=true`, FinFlow ships a catalog of six
"client archetype" demo personas designed to showcase the product across
Colombian financial segments — the disciplined saver, the chronic
late-payer, the over-leveraged aspirational, the gig freelancer, the
young professional, and the family provider. See
`lib/mocks/archetypes/`.

How it works:

- Each archetype is a single `.ts` file under
  `lib/mocks/archetypes/profiles/` exporting a `ClientArchetype` with a
  12-month synthetic footprint (transactions, budgets, liabilities,
  subscriptions, summary KPIs, charts). Amounts are Colombian pesos and
  draw on the benchmark at `lib/benchmarks/colombia-household-8m.ts`.
- `lib/mocks/archetypes/generators.ts` builds the deterministic
  transaction stream from a seed + spend plan, so the data is stable
  across SSR and reloads.
- `/login/demo` renders `components/auth/demo-archetype-picker.tsx`,
  which lets you pick an archetype or paste one of the plaintext demo
  credentials. Submitting sets the `finflow_demo_archetype` cookie via
  a server action in `app/login/demo-actions.ts`.
- `app/dashboard/layout.tsx` reads the cookie on every request and
  registers a resolver with the data layer. Every existing `getXYZ`
  call in `lib/data/dashboard-data.ts` now returns the active
  archetype's payload. Without a cookie the default archetype (the
  disciplined saver) is used.
- `/login` redirects to `/login/demo` when mock mode is on; when mock
  mode is off the real Supabase `/login` form is shown. Middleware is
  untouched.

To add a new archetype:

1. Create `lib/mocks/archetypes/profiles/<slug>.ts` using an existing
   profile as a template.
2. Export a `ClientArchetype` object with a unique `id`, credentials,
   profile metadata, and the generated datasets (use
   `generateTransactions` and the `compute*` helpers).
3. Append the export to `archetypes` in
   `lib/mocks/archetypes/index.ts`.
4. Run `npm run build` to verify types.

The demo credentials are plaintext by design and should never be
shipped into Supabase Auth — the cookie-based flow only runs while
`USE_MOCK_DATA === true`.

### When the user asks "how does X work?"

1. Check this README first.
2. If X is a feature surface → `components/dashboard/<area>*.tsx`.
3. If X is a data flow → `lib/data/dashboard-data.ts` + its mock or Supabase branch.
4. If X is AI-related → start at `lib/ai/` and follow imports; chat specifically
   lives under `lib/ai/chat/`.
5. If X is a forecast/projection → `lib/predictions/`.

---

## Who It Helps

- **Paycheck-to-paycheck users** — see where money goes each month.
- **Debt holders** — clear path to payoff with strategy comparison.
- **Budget-minded users** — real-time guardrails per category.
- **Long-term planners** — net-worth tracking, savings rate trends.
- **Anyone overwhelmed by finances** — a chat assistant that can actually read
  the numbers and explain them.
