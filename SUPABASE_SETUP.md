# Supabase Setup

Run these SQL queries in the **Supabase SQL Editor** (`Dashboard → SQL Editor → New query`) in the order they appear.

---

## 1. Enable Extensions

```sql
create extension if not exists "uuid-ossp";
```

---

## 2. Create Tables

### categories

```sql
create table public.categories (
  id         text        primary key,           -- slug: 'groceries', 'rent', etc.
  user_id    uuid        references auth.users(id) on delete cascade,  -- null = system default
  name       text        not null,
  type       text        not null check (type in ('income', 'expense', 'both')),
  created_at timestamptz default now() not null
);
```

### liabilities

```sql
create table public.liabilities (
  id               bigserial     primary key,
  user_id          uuid          not null references auth.users(id) on delete cascade,
  name             text          not null,
  type             text          not null check (type in ('credit-card', 'car', 'student', 'personal', 'mortgage')),
  current_balance  numeric(12,2) not null,
  original_balance numeric(12,2) not null,
  min_payment      numeric(12,2) not null,
  apr              numeric(5,2)  not null,
  due_day          smallint      check (due_day between 1 and 31),
  created_at       timestamptz   default now() not null,
  updated_at       timestamptz   default now() not null
);
```

### transactions

> `amount` is always stored as a **positive** value. The `type` column determines whether it is income or an expense.

```sql
create table public.transactions (
  id           bigserial     primary key,
  user_id      uuid          not null references auth.users(id) on delete cascade,
  date         date          not null,
  description  text          not null,
  amount       numeric(12,2) not null check (amount > 0),
  type         text          not null check (type in ('income', 'expense', 'debt-payment')),
  category_id  text          references public.categories(id),
  method       text          check (method in ('Credit Card', 'Bank Transfer', 'Cash', 'Debit Card')),
  liability_id bigint        references public.liabilities(id) on delete set null,
  created_at   timestamptz   default now() not null,
  updated_at   timestamptz   default now() not null
);
```

### budget\_items

> `month_year` stores the first day of the target month (e.g. `2024-01-01`).

```sql
create table public.budget_items (
  id           bigserial     primary key,
  user_id      uuid          not null references auth.users(id) on delete cascade,
  category_id  text          not null references public.categories(id),
  budget_limit numeric(12,2) not null check (budget_limit > 0),
  recurring    boolean       default true not null,
  month_year   date          not null,
  created_at   timestamptz   default now() not null,
  updated_at   timestamptz   default now() not null,
  unique (user_id, category_id, month_year)
);
```

### subscriptions

```sql
create table public.subscriptions (
  id            bigserial     primary key,
  user_id       uuid          not null references auth.users(id) on delete cascade,
  name          text          not null,
  amount        numeric(12,2) not null check (amount > 0),
  frequency     text          not null check (frequency in ('Weekly', 'Monthly', 'Yearly')),
  next_due_date date,
  active        boolean       default true not null,
  created_at    timestamptz   default now() not null,
  updated_at    timestamptz   default now() not null
);
```

### user_financial_memory

Stores durable AI memory per user for personalized recommendations.

```sql
create table public.user_financial_memory (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  memory     jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now() not null
);
```

### chat_messages

Persists the AI assistant conversation history so it survives reloads and syncs across devices.

```sql
create table public.chat_messages (
  id            bigserial   primary key,
  user_id       uuid        not null references auth.users(id) on delete cascade,
  role          text        not null check (role in ('user', 'assistant')),
  content       text        not null,
  action        jsonb,
  transcription text,
  created_at    timestamptz not null default now()
);

create index chat_messages_user_id_created_at_idx
  on public.chat_messages (user_id, created_at);

alter table public.chat_messages enable row level security;

create policy "Users can read their own chat messages"
  on public.chat_messages for select using (auth.uid() = user_id);

create policy "Users can insert their own chat messages"
  on public.chat_messages for insert with check (auth.uid() = user_id);

create policy "Users can delete their own chat messages"
  on public.chat_messages for delete using (auth.uid() = user_id);
```

---

## 3. Automatic `updated_at` Trigger

```sql
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_liabilities_updated_at
  before update on public.liabilities
  for each row execute function public.handle_updated_at();

create trigger trg_transactions_updated_at
  before update on public.transactions
  for each row execute function public.handle_updated_at();

create trigger trg_budget_items_updated_at
  before update on public.budget_items
  for each row execute function public.handle_updated_at();

create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

create trigger trg_user_financial_memory_updated_at
  before update on public.user_financial_memory
  for each row execute function public.handle_updated_at();
```

---

## 4. Indexes

```sql
create index idx_transactions_user_id    on public.transactions(user_id);
create index idx_transactions_date       on public.transactions(date desc);
create index idx_transactions_type       on public.transactions(type);
create index idx_transactions_category   on public.transactions(category_id);
create index idx_budget_items_user_month on public.budget_items(user_id, month_year);
create index idx_liabilities_user_id     on public.liabilities(user_id);
create index idx_subscriptions_user_id   on public.subscriptions(user_id);
```

---

## 5. Row Level Security (RLS)

```sql
alter table public.categories    enable row level security;
alter table public.transactions  enable row level security;
alter table public.budget_items  enable row level security;
alter table public.liabilities   enable row level security;
alter table public.subscriptions enable row level security;
alter table public.user_financial_memory enable row level security;

-- categories: everyone reads system defaults; users manage their own custom ones
create policy "Read system and own categories"
  on public.categories for select
  using (user_id is null or user_id = auth.uid());

create policy "Create own categories"
  on public.categories for insert
  with check (user_id = auth.uid());

create policy "Delete own categories"
  on public.categories for delete
  using (user_id = auth.uid());

-- transactions
create policy "Users manage own transactions"
  on public.transactions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- budget_items
create policy "Users manage own budget items"
  on public.budget_items for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- liabilities
create policy "Users manage own liabilities"
  on public.liabilities for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- subscriptions
create policy "Users manage own subscriptions"
  on public.subscriptions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- user_financial_memory
create policy "Users manage own financial memory"
  on public.user_financial_memory for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

---

## 6. Views

### monthly\_summary

Aggregates income, expenses, and savings per user per month.

```sql
create or replace view public.monthly_summary as
select
  user_id,
  date_trunc('month', date)::date as month,
  sum(case when type = 'income'                       then amount else 0 end) as total_income,
  sum(case when type in ('expense', 'debt-payment')   then amount else 0 end) as total_expenses,
  sum(case when type = 'income'                       then amount else 0 end)
  - sum(case when type in ('expense', 'debt-payment') then amount else 0 end) as savings
from public.transactions
group by user_id, date_trunc('month', date);
```

### budget\_with\_spending

Joins budget items with actual transaction spending so the UI can show "spent vs. limit" without a separate query.

```sql
create or replace view public.budget_with_spending as
select
  b.id,
  b.user_id,
  b.category_id,
  c.name          as category_name,
  b.budget_limit,
  b.recurring,
  b.month_year,
  coalesce(sum(t.amount), 0)                    as spent,
  b.budget_limit - coalesce(sum(t.amount), 0)   as remaining
from public.budget_items b
join public.categories c on c.id = b.category_id
left join public.transactions t
  on  t.user_id     = b.user_id
  and t.category_id = b.category_id
  and t.type        = 'expense'
  and date_trunc('month', t.date) = b.month_year
group by b.id, b.user_id, b.category_id, c.name, b.budget_limit, b.recurring, b.month_year;
```

---

## 7. Seed Default Categories

```sql
insert into public.categories (id, user_id, name, type) values
  ('groceries',      null, 'Groceries',      'expense'),
  ('rent',           null, 'Rent',           'expense'),
  ('utilities',      null, 'Utilities',      'expense'),
  ('entertainment',  null, 'Entertainment',  'expense'),
  ('shopping',       null, 'Shopping',       'expense'),
  ('healthcare',     null, 'Healthcare',     'expense'),
  ('transportation', null, 'Transportation', 'expense'),
  ('salary',         null, 'Salary',         'income'),
  ('freelance',      null, 'Freelance',      'income'),
  ('other',          null, 'Other',          'both');
```

---

## Environment Variables

After creating your Supabase project, copy `.env.local.example` to `.env.local` and fill in the values from **Project Settings → API**:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Schema Overview

```
auth.users  (managed by Supabase Auth)
    │
    ├── categories      (id TEXT PK, user_id nullable for system defaults)
    │
    ├── liabilities     (debts: credit cards, loans, mortgages)
    │
    ├── transactions    (income / expense / debt-payment)
    │       ├── FK → categories.id
    │       └── FK → liabilities.id  (for debt-payment type)
    │
    ├── budget_items    (monthly budget limits per category)
    │       └── FK → categories.id
    │
    ├── subscriptions   (recurring charges: Netflix, Spotify, etc.)
    │
    └── user_financial_memory  (durable AI memory per user, jsonb)

Views:
    ├── monthly_summary         (income, expenses, savings per month)
    └── budget_with_spending    (budget limits + actual spending joined)
```
