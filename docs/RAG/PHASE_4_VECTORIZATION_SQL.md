# Phase 4 Document Vectorization SQL

This SQL is planning-only. Do not run it until the embedding dimension and distance metric are confirmed.

Replace every `<RAG_EMBEDDING_DIMENSION>` placeholder with the exact dimension returned by a server-side OpenRouter preflight embedding request.

## Blocking Values
- Embedding provider: `OpenRouter`
- Embedding model: `nvidia/llama-nemotron-embed-vl-1b-v2:free`
- Later RAG LLM model: `nvidia/nemotron-3-super-120b-a12b:free`
- Vector dimension: `<RAG_EMBEDDING_DIMENSION>`
- Distance metric: `TBD`, likely cosine distance

Changing the embedding model later may require re-vectorizing existing documents and rebuilding vector indexes.

Do not guess the vector dimension. Before applying this SQL, implementation must run a preflight embedding request, inspect `embedding.length`, set `RAG_EMBEDDING_DIMENSION`, and update this SQL.

## SQL Template

```sql
-- Phase 4: Document Vectorization
-- Planning SQL only.
-- Replace <RAG_EMBEDDING_DIMENSION> before running this SQL.

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
  embedding vector(<RAG_EMBEDDING_DIMENSION>) not null,
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
-- Choose the index type and operator class after confirming the distance metric.
-- Example for cosine distance with ivfflat:
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
-- Placeholder only. Replace <RAG_EMBEDDING_DIMENSION> and review before Phase 5.
--
-- create or replace function public.match_document_chunks(
--   query_embedding vector(<RAG_EMBEDDING_DIMENSION>),
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
