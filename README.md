# FinFlow — Personal Finance Dashboard

A comprehensive personal finance management application that helps users take full control of their money through intelligent transaction tracking, budget planning, debt payoff strategies, and visual financial analytics.

## The Problem

Managing personal finances is overwhelming. People juggle bank accounts, credit cards, loans, and subscriptions across multiple platforms — losing visibility into where their money goes, how fast they're paying down debt, and whether they're actually saving. Spreadsheets are tedious, and most budgeting apps are either too simple or too complex.

## The Solution

FinFlow consolidates all personal financial data into a single, intuitive dashboard. It answers the questions that matter:

- **Where is my money going?** — Categorized transaction tracking with visual breakdowns
- **Am I staying within budget?** — Real-time budget monitoring with over-spending alerts
- **When will I be debt-free?** — Smart payoff projections with optimized strategies
- **Is my net worth growing?** — Long-term wealth tracking and trend analysis

## Core Features

### 1. Smart Transaction Management

Record every financial movement with three flexible input methods:

- **AI-Powered Entry** — Type natural language like *"Spent $45 at Whole Foods yesterday"* and the system auto-categorizes and structures the transaction
- **Manual Form** — Traditional entry with category selection, payment method, and optional debt linkage
- **CSV Import** — Bulk upload transactions from bank exports

Transactions are classified into three types:

| Type | Description | Example |
|------|-------------|---------|
| **Income** | Money received | Salary, freelance payments, bonuses |
| **Expense** | Money spent | Groceries, utilities, entertainment |
| **Debt Payment** | Payments toward liabilities | Credit card payment, loan installment |

All amounts are stored as positive values — the transaction type determines the financial direction.

### 2. Budget Planning

Set monthly spending limits per category and track progress in real time.

- Create **recurring budgets** that automatically renew each month, or **one-time budgets** for specific months
- Visual progress bars show how much of each budget has been consumed
- Color-coded warnings highlight categories approaching or exceeding their limit
- Dashboard cards display **Total Budget**, **Total Spent**, and **Remaining** (with days left in the month for context)

### 3. Debt Payoff Tracker

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

### 4. Analytics & Reports

Comprehensive financial intelligence through interactive charts and exportable reports.

**Financial Statements & Metrics:**

- **Cash Flow Analysis** — Monthly income vs. expenses trend (line chart), revealing whether you're consistently saving or overspending
- **Expense Breakdown** — Pie chart showing spending distribution across categories (housing, food, transport, etc.)
- **Top Spending Categories** — Ranked list of where the most money goes, helping identify areas to cut back
- **Net Worth Growth** — Area chart tracking total wealth accumulation over time (assets minus liabilities)
- **Recurring Subscriptions** — Inventory of all active subscriptions with amounts and billing frequency
- **Savings Rate** — The gap between income and expenses, showing how effectively you're building wealth

**Report Controls:**
- Filter by date range: Last 7 days, 30 days, Year-to-Date, or custom range
- Export reports as PDF for record-keeping or sharing with a financial advisor

### 5. Dashboard Overview

The main dashboard provides an at-a-glance financial snapshot with four KPI cards:

| Card | What It Shows |
|------|---------------|
| **Total Balance** | Current account balance across all sources |
| **Monthly Income** | Total income received this month |
| **Monthly Expenses** | Total spending this month |
| **Savings** | Net difference (income - expenses) |

Each card includes a percentage trend indicator compared to the previous period. Below the cards, interactive charts show **Income vs. Expenses** (bar chart) and **Expenses by Category** (pie chart), plus a **Recent Transactions** widget.

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
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix UI) |
| Charts | Recharts |
| Forms | React Hook Form + Zod validation |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Icons | Lucide React |
| Deployment | Vercel |

## Project Structure

```
app/
  page.tsx                          # Landing page
  dashboard/
    page.tsx                        # Dashboard overview
    layout.tsx                      # Sidebar + header layout
    transactions/page.tsx           # Transaction management
    budget/page.tsx                 # Budget planning
    debts/page.tsx                  # Debt payoff tracker
    reports/page.tsx                # Analytics & reports

components/
  ui/                               # shadcn/ui base components
  dashboard/
    summary-cards.tsx               # KPI overview cards
    income-vs-expenses-chart.tsx    # Bar chart comparison
    expenses-by-category-chart.tsx  # Pie chart breakdown
    transactions-table.tsx          # Recent transactions widget
    smart-transaction-hub.tsx       # AI / Manual / CSV entry tabs
    transactions-manager.tsx        # Full transaction list with filters
    budget-planning.tsx             # Budget cards and creation
    debts-tracker.tsx               # Liability management
    analytics-reports.tsx           # Charts and report generation
    header.tsx                      # Top navigation bar
    sidebar.tsx                     # Side navigation

lib/
  mocks/                            # Development mock data
  supabase/
    client.ts                       # Supabase browser client
    types.ts                        # TypeScript database interfaces
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/personal-accountant.git
cd personal-accountant

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL and anon key

# Set up the database
# Follow the SQL instructions in SUPABASE_SETUP.md

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `true` uses local mocks, `false` reads from Supabase |

## How It Helps Users

**For people living paycheck to paycheck** — Understand exactly where money goes each month and identify categories to reduce spending.

**For debt holders** — Visualize a clear path to becoming debt-free with optimized payoff strategies that minimize interest or maximize psychological motivation.

**For budget-conscious individuals** — Set guardrails on spending categories and get real-time feedback before overspending.

**For long-term planners** — Track net worth growth over time and ensure savings rate stays positive month after month.

**For anyone overwhelmed by finances** — Replace the anxiety of not knowing with a clear, visual, data-driven picture of financial health.
