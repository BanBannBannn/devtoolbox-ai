# Phase 2 Documents CRUD SQL

This SQL is intended to be easy to copy into the Supabase SQL Editor. It creates the Phase 2 `documents` table only.

Do not create `document_chunks`, vector indexes, embedding columns, RAG chat tables, or usage limit tables in Phase 2.

## SQL

```sql
-- Phase 2: Documents CRUD
-- Creates private user-owned text/Markdown documents.

create extension if not exists pgcrypto;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  content_type text not null default 'markdown',
  character_count integer not null default 0,
  vector_status text not null default 'not_vectorized',
  vectorized_at timestamptz null,
  last_vectorize_error text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint documents_title_not_empty check (length(trim(title)) > 0),
  constraint documents_content_not_empty check (length(trim(content)) > 0),
  constraint documents_content_type_allowed check (content_type in ('markdown', 'text')),
  constraint documents_character_count_nonnegative check (character_count >= 0),
  constraint documents_character_count_matches_content check (character_count = char_length(content)),
  constraint documents_vector_status_allowed check (
    vector_status in ('not_vectorized', 'vectorizing', 'vectorized', 'failed')
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists documents_set_updated_at on public.documents;

create trigger documents_set_updated_at
before update on public.documents
for each row
execute function public.set_updated_at();

alter table public.documents enable row level security;

drop policy if exists "Users can select their own documents" on public.documents;
create policy "Users can select their own documents"
on public.documents
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert their own documents" on public.documents;
create policy "Users can insert their own documents"
on public.documents
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update their own documents" on public.documents;
create policy "Users can update their own documents"
on public.documents
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete their own documents" on public.documents;
create policy "Users can delete their own documents"
on public.documents
for delete
to authenticated
using (user_id = auth.uid());

create index if not exists documents_user_id_idx
on public.documents (user_id);

create index if not exists documents_user_updated_idx
on public.documents (user_id, updated_at desc);

create index if not exists documents_user_vector_status_idx
on public.documents (user_id, vector_status);
```

## Notes
- `user_id` is required and references `auth.users(id)`.
- RLS ensures users can only access rows where `user_id = auth.uid()`.
- Server actions or API routes must still set `user_id` from the authenticated session.
- `character_count` is constrained to match `char_length(content)`.
- `content_type` is limited to `markdown` and `text`.
- `vector_status` is present for later phases, but Phase 2 should keep documents at `not_vectorized`.
- `updated_at` is maintained by a trigger.
- This SQL intentionally does not create `document_chunks`.
