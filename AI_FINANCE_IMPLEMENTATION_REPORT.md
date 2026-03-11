# AI Financial Assistant — Technical + Business Plan Report

## Executive Summary

This project now has a working **AI finance assistant foundation** with:
- Global AI insights
- Per-view AI assistants (Transactions, Budgets, Debts, Reports)
- Structured recommendation contracts
- Auth-protected orchestration routes
- Conversation memory extraction + merge
- User-level memory persistence in Supabase (after running one SQL migration)

The current implementation is strong for a **V1 guided-advice assistant**.  
The next phase should focus on production hardening, measurable business impact, and action execution workflows.

---

## 1) Business Plan View

### 1.1 Business Problem Solved

Users typically see raw financial data but lack:
- clear “what should I do next?”
- personalized guidance aligned to goals
- continuity across conversations

The AI layer addresses this by delivering:
- contextual recommendations per page
- goal-aware strategic advice
- persistent user financial intent profile

### 1.2 User Value Delivered (Current)

- **Transactions AI**: spending diagnosis and anomaly-level coaching
- **Budget AI**: reallocation and control suggestions
- **Debt AI**: repayment strategy support
- **Reports AI**: strategic summary and prioritization
- **Global AI**: holistic recommendations
- **Memory-aware guidance**: recommendations can align with persistent goals/motivations/obstacles

### 1.3 Monetizable Product Opportunities

- **Free tier**: limited recommendations/month, no long-history analysis
- **Pro tier**:
  - deeper historical analysis
  - advanced debt projections
  - automated budget scenarios
  - memory-driven proactive insights
- **Premium advisory mode**:
  - goal check-ins
  - monthly AI financial plan
  - coach-style progress tracking

### 1.4 KPI Framework (Suggested)

- Activation: `% of users clicking AI button in first week`
- Engagement: `AI requests per active user/week`
- Retention impact: `D30 retention with AI used vs not used`
- Behavior outcome:
  - decrease in discretionary spend
  - increase in budget adherence
  - increase in debt payoff velocity
- Trust/quality:
  - thumbs up/down on recommendations
  - follow-through rate on suggested actions

---

## 2) Technical Plan View — What Was Implemented

## 2.1 Core AI Contracts

Implemented in:
- `lib/ai/finance-types.ts`

Added:
- `analysis_type` schema (`overview`, `spending_diagnosis`, etc.)
- request/response Zod contracts
- standardized error contract
- memory schemas:
  - `financial_intent_profile`
  - `page_specific_patterns`
  - `memory_update`
- contextual request fields:
  - `current_page`
  - `page_data`
  - `user_message`
  - `existing_user_memory`

## 2.2 AI Provider Layer Enhancements

Implemented in:
- `lib/ai/provider.ts`

Added:
- structured generation support
- multimodal helpers already present (image/audio)
- provider/model metadata methods
- default provider changed to Gemini-first with fallback behavior

## 2.3 Orchestration Service

Implemented in:
- `lib/ai/finance-service.ts`

Added:
- authenticated analysis pipeline
- context assembly from financial data layer
- analysis-type-specific instruction blocks
- page-specific behavior instructions
- timeout guardrails and normalized errors
- metadata capture (provider/model/latency)

## 2.4 API Endpoints

Implemented:
- Global:
  - `app/api/ai/finance-insights/route.ts`
- Per-view thin routes:
  - `app/api/ai/transactions-insights/route.ts`
  - `app/api/ai/budget-insights/route.ts`
  - `app/api/ai/debts-insights/route.ts`
  - `app/api/ai/reports-insights/route.ts`
- Shared API error handling:
  - `app/api/ai/_shared.ts`
- Memory update endpoint:
  - `app/api/ai/memory-update/route.ts`

## 2.5 UI Integration

Implemented reusable dialog:
- `components/dashboard/ai-insights-dialog.tsx`

Integrated into:
- global header (`components/dashboard/header.tsx`)
- transactions (`components/dashboard/transactions-manager.tsx`)
- budgets (`components/dashboard/budget-planning.tsx`)
- debts (`components/dashboard/debts-tracker.tsx`)
- reports (`components/dashboard/analytics-reports.tsx`)

## 2.6 Memory Pipeline

Implemented logic:
- summarize conversation signals
- extract durable memory
- merge with existing memory (dedupe arrays, preserve stable values)
- persist by authenticated user

Persistence target:
- `public.user_financial_memory` (Supabase)

Type support added:
- `lib/supabase/types.ts`

Setup docs updated:
- `SUPABASE_SETUP.md`

---

## 3) Current System Logic (As-Is)

1. User opens AI dialog on a page.
2. UI sends insight request to page/global endpoint.
3. Route calls shared finance service.
4. Service:
   - validates request
   - verifies auth
   - loads page/data context
   - loads existing user memory
   - calls provider (Gemini/OpenAI)
   - validates model output
5. UI displays structured recommendations.
6. UI then triggers `/api/ai/memory-update`.
7. Memory service summarizes + extracts durable memory.
8. Merged memory is persisted to Supabase for that user.

---

## 4) What Is Missing (Technical + Logic)

These are the high-priority remaining pieces to move from V1 to production-quality.

## 4.1 Required DB Migration Execution (Blocking)

The code expects this table/policy to exist:
- `public.user_financial_memory`

If not created, memory persistence will fail.

## 4.2 Memory Read Path in UI (Recommended)

Current UI delegates memory read/write to backend flows per request.  
That works, but for better UX/visibility:
- add endpoint `GET /api/ai/memory`
- surface user memory state in a debug/admin panel (internal)

## 4.3 Recommendation Quality Guardrails

Need additional safeguards:
- confidence threshold behavior (e.g., when `< 0.55`, show caution mode)
- deterministic formatting of monetary values/currency
- stronger time-range filtering in data assembly

## 4.4 Rate Limits + Abuse Protection

Not fully implemented yet:
- per-user request throttling
- route-level protection against burst usage
- model cost controls by plan tier

## 4.5 Observability and Feedback Loop

Missing for iterative quality:
- recommendation feedback endpoint (helpful/not helpful)
- action adoption tracking
- per-analysis quality logs (without storing raw sensitive content)

## 4.6 Data Correctness Improvements

Potential logic improvements:
- ensure year-safe monthly grouping for long history
- avoid hidden truncation where transaction limits reduce analysis quality
- include normalized financial snapshots per analysis type

## 4.7 Business Action Layer (Phase 2)

Currently AI is advisory.  
Missing:
- “Apply this recommendation” flow with user confirmation:
  - create/update budget
  - debt payoff plan scheduling
  - category targets

---

## 5) Priority Roadmap (Suggested)

## Phase 1 — Stabilization (Immediate)
1. Run Supabase migration for `user_financial_memory`
2. Add per-user rate limiting on AI routes
3. Add telemetry for latency, failures, recommendation usage
4. Add confidence-based fallback UX

## Phase 2 — Actionability
1. Add “Apply recommendation” with confirmation
2. Persist accepted/rejected recommendations
3. Add monthly goal progress tracking

## Phase 3 — Product Intelligence
1. Add proactive nudges (weekly/biweekly summaries)
2. Introduce tiered AI features (free vs pro)
3. Add long-horizon financial plan generation

---

## 6) Supabase SQL Required (Run Once)

```sql
create table if not exists public.user_financial_memory (
  user_id uuid primary key references auth.users(id) on delete cascade,
  memory jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now() not null
);

alter table public.user_financial_memory enable row level security;

drop policy if exists "Users manage own financial memory" on public.user_financial_memory;
create policy "Users manage own financial memory"
  on public.user_financial_memory for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

---

## 7) Final Assessment

### What is good now
- Architecture is clean and extensible (hybrid global + per-view routes)
- Contracts are structured and validated
- Auth-aware and memory-capable
- UI is integrated across all main finance views

### What must be done next
- Execute DB migration
- Add production guardrails (rate limits, observability, quality controls)
- Add recommendation adoption workflow for measurable user outcomes

This positions the assistant to evolve from “insight generator” into a true **financial copilot with continuity and measurable behavior impact**.
