-- Chat messages persistence for the AI assistant.
-- Run this in the Supabase SQL Editor.

create table if not exists public.chat_messages (
  id            bigserial   primary key,
  user_id       uuid        not null references auth.users(id) on delete cascade,
  role          text        not null check (role in ('user', 'assistant')),
  content       text        not null,
  action        jsonb,
  transcription text,
  created_at    timestamptz not null default now()
);

create index if not exists chat_messages_user_id_created_at_idx
  on public.chat_messages (user_id, created_at);

alter table public.chat_messages enable row level security;

drop policy if exists "Users can read their own chat messages" on public.chat_messages;
create policy "Users can read their own chat messages"
  on public.chat_messages
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own chat messages" on public.chat_messages;
create policy "Users can insert their own chat messages"
  on public.chat_messages
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own chat messages" on public.chat_messages;
create policy "Users can delete their own chat messages"
  on public.chat_messages
  for delete
  using (auth.uid() = user_id);
