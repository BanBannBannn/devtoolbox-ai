# Phase 5 RAG Chat API SQL

This SQL is planning-only until Phase 5 implementation begins. Review it before running in Supabase SQL Editor or converting it into the repo migration flow.

## Recommendation
Use Option A for this project:

- `match_document_chunks(query_embedding vector(2048), match_count integer)`
- The function uses `auth.uid()` internally.
- The server route calls it with the normal authenticated Supabase server client.
- The browser does not call the RPC directly in v1.

Why Option A is recommended:

- It avoids passing arbitrary user IDs into the RPC.
- It aligns with existing RLS rules where users can read only their own chunks.
- It reduces the need for service-role access during retrieval.
- It keeps ownership filtering close to the database query.

Option B, `match_document_chunks_for_user(query_embedding, match_user_id, match_count)`, is server-only/service-role oriented and should be avoided unless implementation proves that Option A cannot satisfy retrieval performance or Supabase auth context requirements. If Option B is used later, the server must authenticate the user first and pass only the authenticated user's ID.

## Assumptions
- `vector` extension is already enabled from Phase 4.
- `public.document_chunks` already exists.
- `document_chunks.embedding` is `vector(2048)`.
- `document_chunks.user_id` stores the chunk owner.
- `document_chunks` RLS is enabled.
- Authenticated users can select their own chunks.
- Normal authenticated browser clients cannot insert, update, or delete chunks.

## Option A: Recommended RPC

```sql
create or replace function public.match_document_chunks(
  query_embedding vector(2048),
  match_count integer
)
returns table (
  id uuid,
  document_id uuid,
  chunk_index integer,
  content text,
  source_title text,
  source_anchor text,
  similarity double precision
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.chunk_index,
    document_chunks.content,
    document_chunks.source_title,
    document_chunks.source_anchor,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from public.document_chunks
  where document_chunks.user_id = auth.uid()
  order by document_chunks.embedding <=> query_embedding
  limit greatest(0, least(match_count, 20));
$$;

grant execute on function public.match_document_chunks(vector(2048), integer)
to authenticated;
```

## Security Notes For Option A
- The function uses `auth.uid()` and does not accept `match_user_id`.
- `security invoker` keeps the function aligned with the caller's permissions and RLS behavior.
- The API route should still enforce plan limits before choosing `match_count`.
- The `least(match_count, 20)` guard is a database safety cap. The application should use the smaller `plan_limits.retrieved_chunks_per_answer` value.
- Do not expose raw embeddings to this RPC from browser code in v1.
- The API route should call this RPC from server code after authenticating the user.

## Optional Vector Index
If Phase 4 did not create a vector index, early testing can use exact search. Before production traffic, add an index after confirming query performance and dataset size.

Cosine ivfflat example:

```sql
create index if not exists document_chunks_embedding_cosine_idx
on public.document_chunks
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
```

For small datasets, exact search without a vector index may be acceptable during early testing. Revisit this before production traffic.

## Option B: Server-Only Alternative
Use this only if a server-side service role path is explicitly justified.

```sql
create or replace function public.match_document_chunks_for_user(
  query_embedding vector(2048),
  match_user_id uuid,
  match_count integer
)
returns table (
  id uuid,
  document_id uuid,
  chunk_index integer,
  content text,
  source_title text,
  source_anchor text,
  similarity double precision
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.chunk_index,
    document_chunks.content,
    document_chunks.source_title,
    document_chunks.source_anchor,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from public.document_chunks
  where document_chunks.user_id = match_user_id
  order by document_chunks.embedding <=> query_embedding
  limit greatest(0, least(match_count, 20));
$$;
```

Option B security requirements:

- Do not grant this function for direct browser use.
- Server route must authenticate the user with the normal Supabase server client first.
- Server route must pass only the authenticated user's ID as `match_user_id`.
- Never accept `match_user_id` or `user_id` from the request body.
- Never use a service role key to bypass ownership checks.

## API Snippet Policy
The RPC returns full chunk content because the server-side prompt builder needs it. The API response must convert chunk content into short snippets before returning data to the browser.

Do not return:

- full documents.
- full retrieved context.
- raw embeddings.
- raw provider payloads.
- full prompt.
- hidden chain-of-thought.
- API keys.
- service role key.

## Plan Limit Field Note
Current Phase 3 schema uses:

- `plan_limits.retrieved_chunks_per_answer`
- `plan_limits.max_output_tokens`

Phase 5 API responses can expose those as:

- `maxRetrievedChunks`
- `maxOutputTokens`

If the team wants a database column named `max_retrieved_chunks_per_answer`, create a separate migration before Phase 5 implementation. Do not silently reference a column that does not exist.
