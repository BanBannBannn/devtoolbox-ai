# Phase 5C-1 RAG Runtime Settings SQL

This SQL is ready for review, not execution by this task. Copy it into Supabase SQL Editor only after reviewing the security notes, or convert it into a repo-managed migration.

## SQL

```sql
-- Phase 5C-1: RAG Runtime Settings
-- Creates a private app_config table for server-side runtime configuration.

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

create table if not exists public.app_config (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_app_config_updated_at on public.app_config;
create trigger set_app_config_updated_at
before update on public.app_config
for each row
execute function public.set_updated_at();

alter table public.app_config enable row level security;

-- Conservative default: do not expose app_config directly to browser clients.
-- The RAG API and future admin settings page should read/update this table
-- through server-side code after auth and admin allowlist checks.

drop policy if exists "No direct app config select" on public.app_config;
drop policy if exists "No direct app config insert" on public.app_config;
drop policy if exists "No direct app config update" on public.app_config;
drop policy if exists "No direct app config delete" on public.app_config;

insert into public.app_config (key, value, description, updated_by)
values (
  'rag_runtime_settings',
  '{
    "retrievedChunks": 3,
    "similarityThreshold": 0,
    "maxOutputTokens": 800,
    "temperature": 0.2,
    "sourceSnippetLength": 240,
    "debugRetrieval": false
  }'::jsonb,
  'Server-side RAG retrieval and answer generation runtime settings. Values must be clamped in application code and must not contain secrets or model names.',
  null
)
on conflict (key) do nothing;
```

## Security Notes
- RLS is enabled.
- No select/insert/update/delete policies are created for browser-accessible roles.
- Normal authenticated users should not update `app_config` directly.
- Future admin writes should go through server-side checked actions/routes.
- Future admin writes must verify the logged-in user's email against server-only `RAG_ADMIN_EMAILS`.
- `RAG_ADMIN_EMAILS` must not use a `NEXT_PUBLIC_` prefix.
- The RAG API should read `rag_runtime_settings` server-side.
- Config values must not include secrets, API keys, service role keys, prompts, raw embeddings, provider payloads, or exact model names for client display.

## Seeded Config
The seed insert creates the default `rag_runtime_settings` row only when it does not already exist. Re-running this SQL must not reset admin-edited runtime settings, so the seed uses `on conflict (key) do nothing`.

To intentionally reset the runtime settings later, use a separate explicit admin action or migration after reviewing the current production values.

Key:

- `rag_runtime_settings`

Value:

```json
{
  "retrievedChunks": 3,
  "similarityThreshold": 0,
  "maxOutputTokens": 800,
  "temperature": 0.2,
  "sourceSnippetLength": 240,
  "debugRetrieval": false
}
```

## Runtime Clamp Rules
Application code must clamp values after loading:

| Setting | Safe range |
| --- | --- |
| `retrievedChunks` | `1` to `20`, and not above `plan_limits.retrieved_chunks_per_answer` |
| `similarityThreshold` | `0` to `1` |
| `maxOutputTokens` | `100` to `2000`, and not above `plan_limits.max_output_tokens` |
| `temperature` | `0` to `1` |
| `sourceSnippetLength` | `80` to `500` |
| `debugRetrieval` | boolean |

## Optional Future Read Policy
If a future admin UI needs direct browser reads, prefer not to add a broad RLS policy. Instead, use a server component, server action, or route handler that checks `RAG_ADMIN_EMAILS` server-side and returns only safe config fields.
