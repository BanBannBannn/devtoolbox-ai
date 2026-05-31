# Phase G1 GraphRAG SQL

This is a review-only schema proposal for Phase G2. Do not run it during G1.

## Important Review Notes
- Standard RAG does not need this schema and must keep working without it.
- Graph extraction writes should use the server-only service-role client after authenticated ownership checks.
- Authenticated browser clients may select only their own graph rows. They must not insert, update, or delete graph rows directly.
- The duplicated `user_id` columns keep ownership filters direct, but foreign keys alone do not prove that every linked row has the same owner. Final G2 SQL must pair this schema with server-side ownership validation and decide whether database triggers are also warranted.
- `graph_extraction_runs` is recommended for G2 so graph extraction status and safe errors stay separate from `documents.vector_status`.
- Review existing grants and policies in Supabase before execution.

## Review-Only SQL
```sql
-- Phase G1 proposal only. Review and convert into the final G2 migration.

create extension if not exists pgcrypto;

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
  safe_error text,
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

-- Authenticated browser clients may select only their own graph rows.
-- Graph extraction writes use the server-only service-role client after
-- authenticated ownership checks. Do not add browser write policies.
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

## Ownership Validation
Before inserting or replacing graph rows, trusted server code must verify:

- authenticated user owns the document,
- chunk belongs to that document,
- chunk belongs to the authenticated user,
- linked entities belong to the authenticated user,
- relation endpoints belong to the authenticated user,
- relation evidence document and chunk belong to the authenticated user.

Do not accept `user_id` from client input. Graph extraction should use the existing server-only service-role helper only after deriving the current user from the authenticated session and completing these ownership checks. The service role must never be exposed to the browser.

## Cascade Behavior
- Deleting a document removes linked chunk entities and relations through `document_id`.
- Deleting chunks during re-vectorization removes linked chunk entities and relations through `chunk_id`.
- Deleting an entity removes its chunk links and relations.
- A later cleanup job may remove orphaned entities that no longer have mentions or relations.

## Recommended G2 Extraction Runs
Create `graph_extraction_runs` in G2 instead of adding graph extraction state to `documents.vector_status`.

- Graph extraction is a separate beta workflow.
- A graph extraction failure must not change successful vectorization status.
- Authenticated browser clients may select only their own extraction runs.
- Server-only service-role code creates and updates runs after authenticated ownership checks.

## Deferred SQL
- Entity aliases.
- Entity embeddings.
- Graph query trace persistence.
- Graph extraction quotas or plan-limit columns.
- Ownership validation triggers if G2 explicitly chooses database-enforced checks in addition to trusted server validation.
