# Phase 4 Document Vectorization SQL

This SQL is planning-only. The embedding dimension is confirmed as `2048`, and v1 uses cosine distance.

Do not run this SQL until you are ready to create the `document_chunks` table in Supabase.

## Confirmed Values
- Embedding provider: `OpenRouter`
- Embedding model: `nvidia/llama-nemotron-embed-vl-1b-v2:free`
- Later RAG LLM model: `nvidia/nemotron-3-super-120b-a12b:free`
- Vector dimension: `2048`
- Distance metric: cosine distance for v1

Changing the embedding model later may require re-vectorizing existing documents and rebuilding vector indexes.

## SQL Template

```sql
-- Phase 4: Document Vectorization
-- Planning SQL only.
-- Uses confirmed OpenRouter embedding dimension 2048.

create extension if not exists vector;
create extension if not exists pgcrypto;

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_index integer not null check (chunk_index >= 0),
  content text not null check (char_length(content) > 0),
  character_count integer not null check (character_count = char_length(content)),
  token_estimate integer not null check (token_estimate >= 0),
  embedding vector(2048) not null,
  embedding_model text not null,
  source_title text not null,
  source_anchor text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (document_id, chunk_index)
);

alter table public.document_chunks enable row level security;

drop policy if exists "Users can read own document chunks" on public.document_chunks;
create policy "Users can read own document chunks"
on public.document_chunks
for select
to authenticated
using (user_id = auth.uid());

-- No insert/update/delete policies are created for authenticated users.
-- Chunk writes should be handled by trusted server API routes only.
-- If implementation cannot write chunks with the anon-authenticated server client
-- because RLS blocks inserts, document and justify the safest server-side write path
-- before adding any service role usage.

create index if not exists document_chunks_user_id_idx
on public.document_chunks (user_id);

create index if not exists document_chunks_document_id_idx
on public.document_chunks (document_id);

create index if not exists document_chunks_user_document_idx
on public.document_chunks (user_id, document_id);

-- Vector index placeholder.
-- Use the cosine operator class for v1.
-- Example with ivfflat:
--
-- create index if not exists document_chunks_embedding_cosine_idx
-- on public.document_chunks
-- using ivfflat (embedding vector_cosine_ops)
-- with (lists = 100);
--
-- For small datasets, exact search without a vector index may be acceptable during
-- early testing. Revisit index choice before production traffic.
```

## Future Phase 5 RPC Placeholder

The match RPC is expected in Phase 5 for RAG retrieval. Keep it as a placeholder until question embedding and retrieval are implemented.

```sql
-- Placeholder only. Review before Phase 5.
--
-- create or replace function public.match_document_chunks(
--   query_embedding vector(2048),
--   match_user_id uuid,
--   match_count integer
-- )
-- returns table (
--   id uuid,
--   document_id uuid,
--   chunk_index integer,
--   content text,
--   source_title text,
--   source_anchor text,
--   similarity double precision
-- )
-- language sql
-- stable
-- as $$
--   select
--     document_chunks.id,
--     document_chunks.document_id,
--     document_chunks.chunk_index,
--     document_chunks.content,
--     document_chunks.source_title,
--     document_chunks.source_anchor,
--     1 - (document_chunks.embedding <=> query_embedding) as similarity
--   from public.document_chunks
--   where document_chunks.user_id = match_user_id
--   order by document_chunks.embedding <=> query_embedding
--   limit match_count;
-- $$;
```

Important RPC security note:

- Browser clients must not pass arbitrary `match_user_id`.
- Server routes must pass the authenticated user's ID.
- If exposing RPC directly to authenticated clients later, replace `match_user_id` with `auth.uid()` inside the function and review RLS behavior carefully.

## Notes
- `user_id` is duplicated on chunks to simplify RLS and query filtering.
- `character_count` is constrained to match `char_length(content)`.
- Old chunks for a document should be deleted by the server API before re-vectorizing.
- Normal browser clients should not have direct chunk write policies.
- If a service role key is considered for server-side chunk writes, document why it is needed, keep it server-only, and ensure all ownership checks happen before writes.
