# Phase 4 Document Vectorization Spec

## Goal
Allow logged-in users to vectorize their saved text or Markdown documents by chunking document content, generating embeddings through a server-side embedding provider, and storing private chunks in Supabase `pgvector` for future RAG chat.

Phase 4 prepares private searchable document chunks. It does not add RAG chat, file upload, PDF/DOCX parsing, streaming, payments, teams, or workspaces.

## OpenRouter Model Configuration
DevToolBox AI will use OpenRouter for both embeddings and later RAG LLM calls.

Selected configuration:

- Embedding provider: `OpenRouter`
- Embedding model env: `RAG_EMBEDDING_MODEL`
- Default embedding model: `nvidia/llama-nemotron-embed-vl-1b-v2:free`
- Later RAG LLM model env: `RAG_LLM_MODEL`
- Default later RAG LLM model: `nvidia/nemotron-3-super-120b-a12b:free`
- Embedding dimension env: `RAG_EMBEDDING_DIMENSION`
- OpenRouter key env: `OPENROUTER_API_KEY`
- Distance metric: `TBD`, likely cosine distance

Required environment variables:

- `OPENROUTER_API_KEY=`
- `RAG_EMBEDDING_MODEL=nvidia/llama-nemotron-embed-vl-1b-v2:free`
- `RAG_LLM_MODEL=nvidia/nemotron-3-super-120b-a12b:free`
- `RAG_EMBEDDING_DIMENSION=`

Model names should come from environment variables first. Later, non-secret model configuration can move to `app_config`, but secrets must never be stored in `app_config`.

Do not hardcode model names directly inside API logic. API logic should read config from a small server-only config helper.

## Remaining Blocking Embedding Decision
The embedding model has been selected, but the vector dimension is not confirmed yet. Do not guess the dimension.

Before creating the final `document_chunks.embedding` vector column, implementation must:

1. Make a server-side preflight embedding request through OpenRouter.
2. Inspect `embedding.length`.
3. Set `RAG_EMBEDDING_DIMENSION` to that exact value.
4. Replace the SQL placeholder with that exact value.
5. Re-review vector index and RPC placeholders.

Why this blocks implementation:

- `document_chunks.embedding vector(...)` must match the embedding output dimension.
- Vector indexes depend on the vector column dimension and distance metric.
- Supabase RPC function signatures depend on the selected vector dimension.
- Test fixtures and provider response validation depend on the model shape.
- Changing embedding models later may require re-vectorizing existing documents.

Store `embedding_model` on every chunk so stale vectors can be identified if the model changes later.

Changing embedding models later may require re-vectorizing documents.

## Free Provider Privacy Warning
The selected embedding model uses an OpenRouter free endpoint for testing and demo purposes.

Privacy requirements:

- OpenRouter free endpoints may log prompts and outputs for provider improvement.
- Users should not vectorize personal, confidential, private, or business-critical documents with the free model.
- The dashboard UI should show a clear privacy warning before vectorization while a free provider/model is configured.
- The warning should explain that vectorization sends document chunks to the configured embedding provider through a server-side API route.
- Production use should revisit provider privacy terms and consider a paid/private embedding provider before handling sensitive documents.

## User Outcomes
- A logged-in user can vectorize one of their saved text or Markdown documents.
- A logged-in user can see document vector status move through `vectorizing`, `vectorized`, or `failed`.
- A logged-in user cannot vectorize another user's document.
- Private chunks are stored with `user_id` and protected by RLS.
- Future RAG chat can search only chunks owned by the current user.
- Public tools remain accessible without login.

## Scope
In scope:

- Add `pgvector` SQL documentation.
- Add `document_chunks` SQL documentation.
- Add vectorization API planning for `POST /api/documents/[id]/vectorize`.
- Add chunking logic planning for text/Markdown documents.
- Enforce existing `plan_limits`:
  - `monthly_vectorize_jobs`
  - `max_document_characters`
  - `max_chunks_per_document`
  - `max_chunks_total`
- Record `usage_events` for `vectorize_job`.
- Update `documents.vector_status`, `documents.vectorized_at`, and `documents.last_vectorize_error`.

Out of scope:

- RAG chat.
- Question embedding and retrieval.
- `match_document_chunks` implementation beyond SQL placeholder.
- File upload.
- PDF/DOCX parsing.
- Streaming.
- Payments.
- Teams/workspaces.
- Browser-side provider calls.

## Data Model
Add a `document_chunks` table.

Fields:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `document_id uuid references public.documents(id) on delete cascade`
- `chunk_index integer`
- `content text`
- `character_count integer`
- `token_estimate integer`
- `embedding vector(...)`
- `embedding_model text`
- `source_title text`
- `source_anchor text nullable`
- `created_at timestamptz`

`user_id` is duplicated intentionally so RLS and vector search can filter by owner without joining through `documents`.

## Vectorization API
Route:

- `POST /api/documents/[id]/vectorize`

Request:

- Authenticated request only.
- No `user_id` in the request body.
- Document ID comes from the route param.

Success response:

```json
{
  "success": true,
  "documentId": "uuid",
  "status": "vectorized",
  "chunkCount": 12,
  "usage": {
    "vectorizeJobsUsed": 1,
    "vectorizeJobsLimit": 3,
    "chunksCreated": 12,
    "chunksTotalLimit": 100,
    "embeddingModel": "selected-model"
  }
}
```

Failure response:

```json
{
  "success": false,
  "documentId": "uuid",
  "status": "failed",
  "error": "Clear user-safe error message."
}
```

## Vectorization Flow
1. Authenticate the request with Supabase.
2. Load the current user from the Supabase auth session.
3. Load the document by `id` and require `documents.user_id = current user id`.
4. Load current profile and active `plan_limits`.
5. Count current-month `vectorize_job` events by `period_start`.
6. Reject if `monthly_vectorize_jobs` is exhausted.
7. Reject if `document.character_count > max_document_characters`.
8. Update document status to `vectorizing`.
9. Chunk document content with deterministic pure logic.
10. Reject if chunk count exceeds `max_chunks_per_document`.
11. Count current chunks for the user.
12. Delete old chunks for this document before re-vectorizing.
13. Reject if new total chunks would exceed `max_chunks_total`.
14. Generate embeddings server-side using the selected provider/model.
15. Insert chunks with embeddings, source metadata, and `embedding_model`.
16. Record a `usage_events` row for `vectorize_job`.
17. Update document status to `vectorized` and set `vectorized_at`.
18. Return success with chunk count and usage details.

If any provider or database write fails after status becomes `vectorizing`, update the document to `failed` and set `last_vectorize_error` to a concise user-safe message.

## Chunking Requirements
Create a pure text chunking function.

Suggested v1 defaults:

- Chunk size: `1000` characters.
- Overlap: `150` characters.
- Token estimate: simple approximation such as `Math.ceil(characterCount / 4)` until tokenizer support is chosen.

Rules:

- Preserve chunk order.
- Avoid empty chunks.
- Preserve source title.
- Add stable `source_anchor` values such as `chunk-0`, `chunk-1`.
- Normalize line endings if needed.
- Do not execute or parse user content as code.
- Reject empty text.
- Return clear errors when max chunk count would be exceeded.

Tests should cover:

- Short text.
- Long text.
- Overlap behavior.
- Empty text.
- Max chunk behavior.
- Chunk indexes and anchors.

## Status Behavior
Document vector status values:

- Before job starts: `not_vectorized`
- During job: `vectorizing`
- Success: `vectorized`, `vectorized_at` set, `last_vectorize_error` cleared
- Failure: `failed`, `last_vectorize_error` set

Editing document content should reset status to `not_vectorized`, clear `vectorized_at`, and clear `last_vectorize_error`. This was already planned and implemented in earlier phases.

## Security
- `OPENROUTER_API_KEY` stays server-side only.
- Do not create or use `NEXT_PUBLIC_OPENROUTER_API_KEY`.
- Do not expose the OpenRouter key to the browser.
- Do not use a separate NVIDIA API key for this plan.
- Browser clients must call DevToolBox AI API routes, not embedding providers directly.
- All embedding and LLM calls must go through server-side Next.js API routes.
- API route must derive `user_id` from Supabase auth session.
- Never trust `user_id` from request bodies, route params, hidden inputs, or client state.
- RLS must be enabled on `document_chunks`.
- Users can select only chunks where `user_id = auth.uid()`.
- Normal users should not insert, update, or delete chunks directly from browser clients.
- Server API handles chunk writes.
- Do not log full document content, raw chunks, embeddings, API keys, provider payloads, or private prompts in production.
- Log IDs, counts, status codes, timings, and safe error codes when needed.

## Usage Event Policy
Record one `vectorize_job` usage event when a vectorization attempt passes validation and starts provider work.

Do not record usage for:

- Missing auth.
- Missing document.
- Cross-user access.
- Invalid or oversized document.
- Exhausted quota.
- Chunk limit failures before provider work.

If the provider fails after the job starts, the event may remain recorded because provider work was attempted. The response and document status should make the failure clear.

## Acceptance Criteria
- `OPENROUTER_API_KEY` is server-side only.
- Embedding and LLM model names are loaded from env/config, not hardcoded directly in API logic.
- `RAG_EMBEDDING_DIMENSION` is confirmed by a preflight embedding request before SQL is applied.
- `document_chunks` table exists with RLS enabled.
- Logged-out users cannot vectorize documents.
- Users can vectorize their own documents.
- Users cannot vectorize another user's documents.
- Monthly vectorize quota is enforced from `plan_limits` and `usage_events`.
- Max document characters, chunks per document, and total chunks per user are enforced.
- Old chunks are replaced on re-vectorization.
- Document vector status updates correctly.
- Failed provider calls set document status to `failed`.
- Free model privacy warning appears before vectorization while the free OpenRouter model is configured.
- Chunks are private by `user_id`.
- No RAG chat, file upload, PDF/DOCX parsing, payments, teams, or service role key are added.
