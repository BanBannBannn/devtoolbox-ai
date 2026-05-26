# Phase 5D RAG Chat Sessions SQL

This SQL is planning-only. Do not run it from this task. Review it in Supabase SQL Editor or convert it into a repo-managed migration before execution.

## SQL

```sql
-- Phase 5D: RAG Chat Sessions And Message History

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) > 0 and char_length(title) <= 120),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_chat_sessions_updated_at on public.chat_sessions;
create trigger set_chat_sessions_updated_at
before update on public.chat_sessions
for each row
execute function public.set_updated_at();

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) > 0),
  sources jsonb,
  retrieval_details jsonb,
  usage jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "Users can read own chat sessions" on public.chat_sessions;
create policy "Users can read own chat sessions"
on public.chat_sessions
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own chat sessions" on public.chat_sessions;
create policy "Users can insert own chat sessions"
on public.chat_sessions
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own chat sessions" on public.chat_sessions;
create policy "Users can update own chat sessions"
on public.chat_sessions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete own chat sessions" on public.chat_sessions;
create policy "Users can delete own chat sessions"
on public.chat_sessions
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read own chat messages" on public.chat_messages;
create policy "Users can read own chat messages"
on public.chat_messages
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own chat messages" on public.chat_messages;
create policy "Users can insert own chat messages"
on public.chat_messages
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.chat_sessions
    where chat_sessions.id = chat_messages.session_id
      and chat_sessions.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete own chat messages" on public.chat_messages;
create policy "Users can delete own chat messages"
on public.chat_messages
for delete
to authenticated
using (user_id = auth.uid());

create index if not exists chat_sessions_user_updated_at_idx
on public.chat_sessions (user_id, updated_at desc);

create index if not exists chat_messages_session_created_at_idx
on public.chat_messages (session_id, created_at asc);

create index if not exists chat_messages_user_created_at_idx
on public.chat_messages (user_id, created_at desc);
```

## Security Notes
- RLS is enabled on both tables.
- Policies are user-owned and use `auth.uid()`.
- Browser clients must never provide trusted `user_id`.
- Server routes should still derive the user from the Supabase auth session.
- Assistant message JSON fields must not store API keys, service role keys, raw embeddings, full prompts, hidden instructions, model names, or chain-of-thought.
- `retrieval_details` should store only safe diagnostics already allowed in the API response.

## Implementation Notes
- `chat_sessions.updated_at` should update when a session title changes.
- Implementation should also bump `chat_sessions.updated_at` when new messages are appended, either through server code or a future trigger.
- If using service role for any server write path later, document why and verify ownership before writes.
