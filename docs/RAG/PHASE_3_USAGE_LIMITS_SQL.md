# Phase 3 Usage Limits SQL

Copy this SQL into the Supabase SQL Editor, or convert it into a checked-in migration before implementation.

This script is intended to be safe after the Phase 2 `public.documents` table already exists. It does not create `document_chunks`, vector storage, RAG chat tables, payments, teams, or workspaces.

## SQL

```sql
-- Phase 3: Usage Limits
-- Adds profiles, plan_limits, and usage_events for database-driven quotas.

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

create table if not exists public.plan_limits (
  id uuid primary key default gen_random_uuid(),
  plan_key text not null unique,
  monthly_rag_messages integer not null check (monthly_rag_messages >= 0),
  monthly_vectorize_jobs integer not null check (monthly_vectorize_jobs >= 0),
  max_saved_documents integer not null check (max_saved_documents >= 0),
  max_document_characters integer not null check (max_document_characters >= 0),
  max_chunks_per_document integer not null check (max_chunks_per_document >= 0),
  max_chunks_total integer not null check (max_chunks_total >= 0),
  retrieved_chunks_per_answer integer not null check (retrieved_chunks_per_answer >= 0),
  max_output_tokens integer not null check (max_output_tokens >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_plan_limits_updated_at on public.plan_limits;
create trigger set_plan_limits_updated_at
before update on public.plan_limits
for each row
execute function public.set_updated_at();

insert into public.plan_limits (
  plan_key,
  monthly_rag_messages,
  monthly_vectorize_jobs,
  max_saved_documents,
  max_document_characters,
  max_chunks_per_document,
  max_chunks_total,
  retrieved_chunks_per_answer,
  max_output_tokens,
  is_active
)
values (
  'free',
  30,
  3,
  10,
  20000,
  50,
  100,
  3,
  800,
  true
)
on conflict (plan_key) do update set
  monthly_rag_messages = excluded.monthly_rag_messages,
  monthly_vectorize_jobs = excluded.monthly_vectorize_jobs,
  max_saved_documents = excluded.max_saved_documents,
  max_document_characters = excluded.max_document_characters,
  max_chunks_per_document = excluded.max_chunks_per_document,
  max_chunks_total = excluded.max_chunks_total,
  retrieved_chunks_per_answer = excluded.retrieved_chunks_per_answer,
  max_output_tokens = excluded.max_output_tokens,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  plan_key text not null default 'free' references public.plan_limits(plan_key) on update cascade on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, plan_key)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    'free'
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row
execute function public.handle_new_user_profile();

-- Backfill users created before the trigger existed.
insert into public.profiles (id, email, display_name, plan_key)
select
  users.id,
  users.email,
  coalesce(users.raw_user_meta_data->>'full_name', users.raw_user_meta_data->>'name'),
  'free'
from auth.users
on conflict (id) do update set
  email = excluded.email,
  display_name = coalesce(excluded.display_name, public.profiles.display_name),
  updated_at = timezone('utc', now());

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'rag_message',
      'vectorize_job',
      'embedding_tokens',
      'llm_output_tokens',
      'document_created',
      'chunk_created'
    )
  ),
  quantity integer not null default 1 check (quantity > 0),
  period_start date not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.plan_limits enable row level security;
alter table public.usage_events enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users can insert own free profile" on public.profiles;
create policy "Users can insert own free profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid() and plan_key = 'free');

drop policy if exists "Authenticated users can read active plan limits" on public.plan_limits;
create policy "Authenticated users can read active plan limits"
on public.plan_limits
for select
to authenticated
using (is_active = true);

drop policy if exists "Users can read own usage events" on public.usage_events;
create policy "Users can read own usage events"
on public.usage_events
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own usage events" on public.usage_events;
create policy "Users can insert own usage events"
on public.usage_events
for insert
to authenticated
with check (user_id = auth.uid());

create index if not exists profiles_plan_key_idx
on public.profiles (plan_key);

create index if not exists plan_limits_active_idx
on public.plan_limits (is_active);

create index if not exists usage_events_user_period_type_idx
on public.usage_events (user_id, period_start, event_type);

create index if not exists usage_events_user_created_at_idx
on public.usage_events (user_id, created_at desc);
```

## Notes
- `profiles.plan_key` references `plan_limits.plan_key`, so the `free` plan seed is inserted before profiles are created.
- The auth trigger is the primary profile creation strategy for Phase 3.
- The backfill statement handles users who signed up before Phase 3 SQL was applied.
- `plan_limits` values are readable by authenticated users because they are non-secret quota values.
- No update policy is added for `profiles`, so browser-accessible clients cannot change `plan_key`.
- Future admin or billing changes should update `plan_key` through trusted server-side code only.
- `usage_events.period_start` should be the UTC month start date, such as `2026-05-01`.
- Monthly usage should be calculated by summing `quantity` grouped by `event_type` for the current `period_start`.
