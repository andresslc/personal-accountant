# FinFlow — AI-Powered Personal Finance Dashboard

A comprehensive personal finance management application that combines intelligent AI assistants with intuitive dashboards to help users track transactions, plan budgets, manage debts, and gain financial insights — all through natural language, voice, or image input.

## The Problem

Managing personal finances is overwhelming. People juggle bank accounts, credit cards, loans, and subscriptions across multiple platforms — losing visibility into where their money goes, how fast they're paying down debt, and whether they're actually saving. Spreadsheets are tedious, and most budgeting apps are either too simple or too complex.

## The Solution

FinFlow consolidates all personal financial data into a single, intuitive dashboard enhanced by AI. It answers the questions that matter:

- **Where is my money going?** — Categorized transaction tracking with visual breakdowns
- **Am I staying within budget?** — Real-time budget monitoring with over-spending alerts
- **When will I be debt-free?** — Smart payoff projections with optimized strategies
- **What should I do next?** — AI-powered insights, anomaly detection, and personalized advice through a conversational chat interface

## Core Features

### 1. AI Financial Chat Assistant

A full conversational AI interface at `/dashboard/chat` that acts as a personal financial advisor.

- **Multi-turn conversations** with streaming responses (server-sent events)
- **Multimodal input** — type text, record voice messages, or attach images (receipts, statements)
- **Tool-augmented LLM** — the AI can query your financial data, create transactions, analyze spending, and suggest strategies in real time
- **Specialized sub-agents** for focused analysis:
  - **Debt Agent** — payoff strategies and debt optimization
  - **Advisory Agent** — personalized financial recommendations
  - **Prediction Agent** — spending forecasts based on historical patterns
- **Financial memory** — the system builds a profile of your goals, obstacles, and focus areas across conversations for increasingly personalized advice

### 2. Smart Transaction Management

Record every financial movement with flexible input methods:

- **AI-Powered Entry** — Type natural language like *"Spent $45 at Whole Foods yesterday"* and the system auto-categorizes and structures the transaction (supports Spanish and English)
- **Voice Input** — Record audio and the AI transcribes and parses it into a structured transaction
- **Image Input** — Snap a photo of a receipt and the AI extracts the transaction details via vision
- **Manual Form** — Traditional entry with category selection, payment method, and optional debt linkage
- **CSV Import** — Bulk upload transactions from bank exports

All multimodal inputs route through a LangGraph state machine that classifies intent (transaction, budget, or debt) and extracts structured data with confidence scores. A confirmation card lets you review and edit before saving.

Transactions are classified into three types:

| Type | Description | Example |
|------|-------------|---------|
| **Income** | Money received | Salary, freelance payments, bonuses |
| **Expense** | Money spent | Groceries, utilities, entertainment |
| **Debt Payment** | Payments toward liabilities | Credit card payment, loan installment |

All amounts are stored as positive values — the transaction type determines the financial direction. Default currency: COP (Colombian Pesos).

### 3. AI Insights Engine

A dialog accessible from any dashboard page that provides deep AI-driven financial analysis.

| Analysis Type | What It Does |
|---------------|--------------|
| **Overview** | High-level financial health assessment |
| **Spending Diagnosis** | Identifies spending patterns and anomalies |
| **Budget Recommendations** | Suggests optimal budget allocations |
| **Debt Strategy** | Compares payoff approaches with projected timelines |
| **Report Summary** | Narrative summary of your financial reports |
| **Anomaly Detection** | Flags unusual transactions or spending spikes |

Each analysis streams results in real time and can be filtered by date range or custom context.

### 4. Budget Planning

Set monthly spending limits per category and track progress in real time.

- Create **recurring budgets** that automatically renew each month, or **one-time budgets** for specific months
- Visual progress bars show how much of each budget has been consumed
- Color-coded warnings highlight categories approaching or exceeding their limit
- Dashboard cards display **Total Budget**, **Total Spent**, and **Remaining** (with days left in the month for context)

### 5. Debt Payoff Tracker

Manage all liabilities in one place — credit cards, auto loans, student loans, personal loans, and mortgages.

Each liability tracks:
- Current balance vs. original balance (with progress percentage)
- Annual Percentage Rate (APR)
- Minimum monthly payment and due date

**Payoff Strategies:**

| Strategy | Logic | Best For |
|----------|-------|----------|
| **Avalanche** | Pay highest interest rate first | Minimizing total interest paid |
| **Snowball** | Pay lowest balance first | Building momentum with quick wins |

The system projects a **12-month payoff timeline** showing how balances decrease over time, calculates a **weighted average APR** across all debts, and estimates a **debt-free date**.

### 6. Analytics & Reports

Comprehensive financial intelligence through interactive charts and exportable reports.

**Financial Statements & Metrics:**

- **Cash Flow Analysis** — Monthly income vs. expenses trend (line chart)
- **Expense Breakdown** — Pie chart showing spending distribution across categories
- **Top Spending Categories** — Ranked list of where the most money goes
- **Net Worth Growth** — Area chart tracking total wealth accumulation over time
- **Recurring Subscriptions** — Inventory of all active subscriptions with amounts and billing frequency
- **Savings Rate** — The gap between income and expenses

**Report Controls:**
- Filter by date range: Last 7 days, 30 days, Year-to-Date, or custom range
- Export reports as PDF for record-keeping or sharing with a financial advisor

### 7. Dashboard Overview

The main dashboard provides an at-a-glance financial snapshot with four KPI cards:

| Card | What It Shows |
|------|---------------|
| **Total Balance** | Current account balance across all sources |
| **Monthly Income** | Total income received this month |
| **Monthly Expenses** | Total spending this month |
| **Savings** | Net difference (income - expenses) |

Each card includes a percentage trend indicator compared to the previous period. Below the cards, interactive charts show **Income vs. Expenses** (bar chart) and **Expenses by Category** (pie chart), plus a **Recent Transactions** widget.

### 8. Quick Add Menu

A global floating action button available on every dashboard page for rapid data entry:

- **Multimodal Transaction** — text, voice recording with real-time audio visualization, or camera capture (with image compression)
- **Budget Creation** — quick budget modal
- **Debt Creation** — quick debt modal

Parsed results display in a confirmation card with confidence scores before saving.

## Authentication

FinFlow uses Supabase Auth with the following flow:

- **Login** (`/login`) and **Sign Up** (`/signup`) pages with Supabase OAuth
- **Middleware** protects all `/dashboard/*` routes — unauthenticated users are redirected to `/login`
- **Auth callback** (`/auth/callback`) handles OAuth code exchange
- **Session refresh** on every request via Next.js middleware
- **Auth context** (`useAuth()` hook) provides user state to client components
- Row-Level Security on all database tables ensures users can only access their own data

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/parse-transaction` | POST | AI-powered natural language transaction parsing |
| `/api/parse-multimodal` | POST | Multimodal input processing (text, audio, image) via LangGraph |
| `/api/chat` | POST | Streaming chat with tool use, audio transcription, and image analysis |
| `/api/ai/finance-insights` | POST | Overall financial health analysis |
| `/api/ai/transactions-insights` | POST | Spending diagnosis |
| `/api/ai/budget-insights` | POST | Budget recommendations |
| `/api/ai/debts-insights` | POST | Debt payoff strategies |
| `/api/ai/reports-insights` | POST | Report summary analysis |
| `/api/ai/memory-update` | POST | Extract and merge user financial intent profile |
| `/auth/callback` | GET | Supabase OAuth callback |
| `/auth/signout` | POST | Clear auth session |

## Database Architecture

The application uses a PostgreSQL database (via Supabase) with Row-Level Security ensuring each user can only access their own financial data.

### Tables

| Table | Purpose |
|-------|---------|
| `categories` | Income/expense categories (system defaults + user-created) |
| `transactions` | All financial movements with amount, type, category, and method |
| `liabilities` | Debts and credit obligations with balances and interest rates |
| `budget_items` | Monthly spending limits per category |
| `subscriptions` | Recurring charges with frequency and next due date |

### Views

| View | Purpose |
|------|---------|
| `monthly_summary` | Aggregated income, expenses, and savings per month |
| `budget_with_spending` | Budget limits joined with actual spending for variance analysis |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix UI) |
| Charts | Recharts |
| Forms | React Hook Form + Zod validation |
| Database | Supabase (PostgreSQL with RLS) |
| Auth | Supabase Auth (OAuth + SSR session management) |
| AI Orchestration | LangChain + LangGraph |
| AI Providers | OpenAI (gpt-4o-mini) or Google Gemini (gemini-2.5-flash) |
| Audio Transcription | OpenAI Whisper / Gemini native |
| Icons | Lucide React |
| Deployment | Vercel |
| Analytics | Vercel Analytics |
| Package Manager | npm |

## Project Structure

```
app/
  page.tsx                              # Landing page
  layout.tsx                            # Root layout (Geist font, theme, analytics)
  middleware.ts                         # Auth session refresh + route protection
  login/                                # Login page + form
  signup/                               # Signup page + form
  auth/
    callback/route.ts                   # OAuth code exchange
    signout/route.ts                    # Session cleanup
  api/
    parse-transaction/route.ts          # AI transaction parser
    parse-multimodal/route.ts           # Multimodal input pipeline (LangGraph)
    chat/route.ts                       # Streaming chat with tool use
    ai/
      finance-insights/route.ts         # Financial health analysis
      transactions-insights/route.ts    # Spending diagnosis
      budget-insights/route.ts          # Budget recommendations
      debts-insights/route.ts           # Debt strategy analysis
      reports-insights/route.ts         # Report summaries
      memory-update/route.ts            # User financial memory extraction
  dashboard/
    layout.tsx                          # Sidebar + header layout (auth-gated)
    page.tsx                            # Dashboard overview
    transactions/page.tsx               # Transaction management
    budget/page.tsx                     # Budget planning
    debts/page.tsx                      # Debt payoff tracker
    reports/page.tsx                    # Analytics & reports
    chat/page.tsx                       # AI financial chat

components/
  ui/                                   # shadcn/ui base components
  auth-provider.tsx                     # Auth context with useAuth() hook
  theme-provider.tsx                    # Dark/light mode support
  dashboard/
    sidebar.tsx                         # Side navigation
    header.tsx                          # Top navigation bar
    summary-cards.tsx                   # KPI overview cards
    income-vs-expenses-chart.tsx        # Bar chart comparison
    expenses-by-category-chart.tsx      # Pie chart breakdown
    transactions-table.tsx              # Recent transactions widget
    transactions-manager.tsx            # Full transaction list with filters
    smart-transaction-hub.tsx           # AI / Manual / CSV entry tabs
    budget-planning.tsx                 # Budget cards and creation
    budget-quick-create-dialog.tsx      # Reusable budget creation modal
    debts-tracker.tsx                   # Liability management
    debt-quick-create-dialog.tsx        # Reusable debt creation modal
    analytics-reports.tsx               # Charts and report generation
    quick-add-menu.tsx                  # Global floating action menu
    ai-insights-dialog.tsx              # AI analysis modal
    multimodal-confirmation.tsx         # Parsed result confirmation cards
    transaction-confirmation-card.tsx   # AI parse result confirmation
    chat/
      chat-view.tsx                     # Chat container + state management
      chat-input.tsx                    # Text / audio / image input
      message-list.tsx                  # Message thread renderer
      message-bubble.tsx                # Individual message display
      action-card.tsx                   # Action suggestion cards
      chat-welcome.tsx                  # Onboarding with suggested prompts
      typing-indicator.tsx              # Streaming indicator

lib/
  config/data-source.ts                 # USE_MOCK_DATA flag
  data/dashboard-data.ts               # Centralized data layer (mocks OR Supabase)
  mocks/                                # Development mock data
    index.ts                            # Re-exports
    transactions.ts, budget.ts, debts.ts, analytics.ts, summary.ts, categories.ts
  supabase/
    client.ts                           # Browser client (lazy-loaded)
    server.ts                           # Server client (SSR with cookies)
    middleware.ts                       # Auth middleware logic
    types.ts                            # Database TypeScript interfaces
  ai/
    provider.ts                         # AI provider factory (OpenAI / Gemini)
    prompt.ts                           # System prompt for transaction parsing
    types.ts                            # ParsedTransaction Zod schema
    multimodal-graph.ts                 # LangGraph state machine for multimodal input
    finance-service.ts                  # High-level AI insights service
    finance-types.ts                    # Financial memory types
    chat/
      orchestrator.ts                   # Multi-turn chat with tool use
      tools.ts                          # Tool definitions for the LLM
      prompts.ts                        # Chat system prompts
      context-builder.ts               # Financial context assembly
      types.ts                          # Chat message types
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- An API key for [OpenAI](https://platform.openai.com) or [Google Gemini](https://ai.google.dev)

### Installation

```bash
# Clone the repository
git clone https://github.com/andresslc/personal-accountant.git
cd personal-accountant

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your keys (see table below)

# Set up the database
# Follow the SQL instructions in SUPABASE_SETUP.md

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous/public key |
| `NEXT_PUBLIC_USE_MOCK_DATA` | No | `true` uses local mocks (default), `false` reads from Supabase |
| `AI_PROVIDER` | No | `openai` or `gemini` (default: `openai`) |
| `OPENAI_API_KEY` | If using OpenAI | OpenAI API key |
| `GEMINI_API_KEY` | If using Gemini | Google Gemini API key |

## How It Helps Users

**For people living paycheck to paycheck** — Understand exactly where money goes each month and identify categories to reduce spending.

**For debt holders** — Visualize a clear path to becoming debt-free with optimized payoff strategies that minimize interest or maximize psychological motivation.

**For budget-conscious individuals** — Set guardrails on spending categories and get real-time feedback before overspending.

**For long-term planners** — Track net worth growth over time and ensure savings rate stays positive month after month.

**For anyone overwhelmed by finances** — Replace the anxiety of not knowing with a clear, visual, data-driven picture of financial health — and have an AI assistant to talk it through with.
