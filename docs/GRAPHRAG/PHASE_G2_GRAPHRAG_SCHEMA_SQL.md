# Phase G2 GraphRAG Schema SQL

This SQL is ready for manual Supabase review and execution. Do not run it from the application or from this task.

## Preflight
Confirm these existing objects before execution:

- `public.documents`
- `public.document_chunks`
- `public.set_updated_at()`
- RLS on `documents` and `document_chunks`
- server-only `SUPABASE_SERVICE_ROLE_KEY`

Graph extraction writes will use the existing server-only service-role client only after the application authenticates the user and verifies ownership. Authenticated browser clients receive owner-only `select` access and no direct graph write policies.

## Final SQL To Review And Copy
```sql
-- Phase G2: GraphRAG schema foundation.
-- Manual Supabase execution only after review.

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

create table if not exists public.graph_entities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  normalized_name text not null check (
    char_length(normalized_name) between 1 and 200
  ),
  type text check (type is null or char_length(type) between 1 and 80),
  description text check (
    description is null or char_length(description) <= 1000
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists graph_entities_owner_name_type_unique_idx
on public.graph_entities (user_id, normalized_name, coalesce(type, ''));

create index if not exists graph_entities_user_id_idx
on public.graph_entities (user_id);

create index if not exists graph_entities_user_normalized_name_idx
on public.graph_entities (user_id, normalized_name);

drop trigger if exists set_graph_entities_updated_at on public.graph_entities;
create trigger set_graph_entities_updated_at
before update on public.graph_entities
for each row
execute function public.set_updated_at();

create table if not exists public.chunk_entities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_id uuid not null references public.document_chunks(id) on delete cascade,
  entity_id uuid not null references public.graph_entities(id) on delete cascade,
  mention_text text not null check (char_length(mention_text) between 1 and 240),
  start_offset integer check (start_offset is null or start_offset >= 0),
  end_offset integer check (
    end_offset is null
    or (
      end_offset >= 0
      and (start_offset is null or end_offset >= start_offset)
    )
  ),
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists chunk_entities_chunk_entity_mention_unique_idx
on public.chunk_entities (chunk_id, entity_id, mention_text);

create index if not exists chunk_entities_user_id_idx
on public.chunk_entities (user_id);

create index if not exists chunk_entities_document_id_idx
on public.chunk_entities (document_id);

create index if not exists chunk_entities_entity_id_idx
on public.chunk_entities (entity_id);

create table if not exists public.graph_relations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_entity_id uuid not null references public.graph_entities(id) on delete cascade,
  target_entity_id uuid not null references public.graph_entities(id) on delete cascade,
  relation_type text not null check (
    char_length(relation_type) between 1 and 120
  ),
  weight numeric not null default 1 check (weight >= 0 and weight <= 100),
  evidence_text text not null check (
    char_length(evidence_text) between 1 and 500
  ),
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_id uuid not null references public.document_chunks(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  check (source_entity_id <> target_entity_id)
);

create index if not exists graph_relations_user_id_idx
on public.graph_relations (user_id);

create index if not exists graph_relations_source_entity_idx
on public.graph_relations (source_entity_id);

create index if not exists graph_relations_target_entity_idx
on public.graph_relations (target_entity_id);

create index if not exists graph_relations_document_id_idx
on public.graph_relations (document_id);

create index if not exists graph_relations_chunk_id_idx
on public.graph_relations (chunk_id);

create table if not exists public.graph_extraction_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  status text not null check (
    status in ('queued', 'processing', 'completed', 'failed')
  ),
  safe_error text check (safe_error is null or char_length(safe_error) <= 1000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists graph_extraction_runs_user_document_created_idx
on public.graph_extraction_runs (user_id, document_id, created_at desc);

drop trigger if exists set_graph_extraction_runs_updated_at
on public.graph_extraction_runs;
create trigger set_graph_extraction_runs_updated_at
before update on public.graph_extraction_runs
for each row
execute function public.set_updated_at();

alter table public.graph_entities enable row level security;
alter table public.chunk_entities enable row level security;
alter table public.graph_relations enable row level security;
alter table public.graph_extraction_runs enable row level security;

drop policy if exists "Users can read own graph entities"
on public.graph_entities;
create policy "Users can read own graph entities"
on public.graph_entities
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read own chunk entities"
on public.chunk_entities;
create policy "Users can read own chunk entities"
on public.chunk_entities
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read own graph relations"
on public.graph_relations;
create policy "Users can read own graph relations"
on public.graph_relations
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read own graph extraction runs"
on public.graph_extraction_runs;
create policy "Users can read own graph extraction runs"
on public.graph_extraction_runs
for select
to authenticated
using (user_id = auth.uid());

-- Browser clients may select only their own graph rows.
-- Extraction writes remain server-only after authenticated ownership checks.
revoke insert, update, delete on table public.graph_entities
from anon, authenticated;
revoke insert, update, delete on table public.chunk_entities
from anon, authenticated;
revoke insert, update, delete on table public.graph_relations
from anon, authenticated;
revoke insert, update, delete on table public.graph_extraction_runs
from anon, authenticated;

grant select on table public.graph_entities to authenticated;
grant select on table public.chunk_entities to authenticated;
grant select on table public.graph_relations to authenticated;
grant select on table public.graph_extraction_runs to authenticated;
```

## Expression Index Decision
Keep the expression unique index:

```sql
(user_id, normalized_name, coalesce(type, ''))
```

This treats a nullable entity type consistently. Supabase upsert conflict targets are awkward for expression indexes, so G3 server code should:

1. select by authenticated `user_id`, `normalized_name`, and nullable `type`,
2. reuse the matching entity if present,
3. insert if missing,
4. handle a concurrent unique conflict by selecting again.

## Ownership Boundary
Foreign keys do not prove that duplicated `user_id` values match across linked rows. Before any service-role write, G3 server code must verify:

- authenticated user owns the document,
- chunk belongs to that document and user,
- linked entity belongs to that user,
- relation endpoints belong to that user,
- relation evidence document and chunk belong to that user.

Database ownership triggers remain deferred unless G2 review explicitly chooses them.

## Cascade Behavior
- Deleting a document removes chunk links, relations, and extraction runs.
- Deleting chunks during re-vectorization removes linked chunk entities and relations.
- Deleting an entity removes its chunk links and relations.
- A later cleanup job may remove orphaned entities.

## Manual Post-Execution Checks
```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'graph_entities',
    'chunk_entities',
    'graph_relations',
    'graph_extraction_runs'
  )
order by tablename;

select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'graph_entities',
    'chunk_entities',
    'graph_relations',
    'graph_extraction_runs'
  )
order by tablename, policyname;
```

## Deferred SQL
- Database ownership triggers.
- Entity aliases.
- Entity embeddings.
- Graph query trace persistence.
- Graph extraction quotas or plan-limit columns.
