# Phase 4 Document Vectorization Tasks

## Goal
Implement private document vectorization for saved text/Markdown documents after the embedding model and vector dimension are selected.

## 0. Resolve Blocking Decisions
- Use OpenRouter as the embedding provider.
- Use `RAG_EMBEDDING_MODEL`, defaulting to `nvidia/llama-nemotron-embed-vl-1b-v2:free`.
- Use `RAG_LLM_MODEL`, defaulting to `nvidia/nemotron-3-super-120b-a12b:free`, for later RAG chat.
- Confirm the embedding vector dimension.
- Choose the vector distance metric after confirming provider output shape.
- Use `OPENROUTER_API_KEY` server-side only.
- Do not use a separate NVIDIA API key.
- Do not use `NEXT_PUBLIC_OPENROUTER_API_KEY`.

Do not apply the vector SQL until `RAG_EMBEDDING_DIMENSION` is confirmed.

## 0.1. Preflight Embedding Dimension
Before creating the final vector column:

1. Add a temporary server-only preflight script or route handler helper during implementation.
2. Call OpenRouter with a tiny test string using `RAG_EMBEDDING_MODEL`.
3. Inspect `embedding.length`.
4. Set `RAG_EMBEDDING_DIMENSION` to that exact number.
5. Update `docs/RAG/PHASE_4_VECTORIZATION_SQL.md` by replacing `<RAG_EMBEDDING_DIMENSION>`.
6. Remove or lock down any temporary preflight endpoint before deploy.

Do not guess the dimension from memory or unrelated model docs.

## 1. Apply Database SQL
- Update `docs/RAG/PHASE_4_VECTORIZATION_SQL.md` by replacing all dimension placeholders.
- Apply the SQL through Supabase SQL Editor or convert it into the repo migration flow.
- Confirm `vector` extension is enabled.
- Confirm `document_chunks` exists.
- Confirm RLS is enabled.
- Confirm normal authenticated clients cannot insert, update, or delete chunks directly.
- Confirm indexes exist.

## 2. Add Environment Variables
Document or update environment variables:

- `OPENROUTER_API_KEY`
- `RAG_EMBEDDING_MODEL=nvidia/llama-nemotron-embed-vl-1b-v2:free`
- `RAG_LLM_MODEL=nvidia/nemotron-3-super-120b-a12b:free`
- `RAG_EMBEDDING_DIMENSION`

Rules:

- `OPENROUTER_API_KEY` is server-side only.
- Do not add any OpenRouter or provider key with `NEXT_PUBLIC_`.
- Do not expose the OpenRouter key to the browser.
- Model names should come from env first.
- Later, non-secret model config can move to `app_config`.
- Secrets must never be stored in `app_config`.
- Do not hardcode model names directly in API logic.

## 3. Add Chunking Logic
Create a pure chunking module, for example:

- `lib/rag/chunk-text.ts`
- `lib/rag/chunk-text.test.ts`

Suggested types:

- `ChunkTextInput`
- `TextChunk`
- `ChunkTextResult`

Suggested function:

- `chunkTextForEmbedding(input)`

Tests:

- Short text creates one chunk.
- Long text creates multiple chunks.
- Overlap is preserved.
- Empty text is rejected.
- Empty chunks are not returned.
- Max chunk count is enforced.
- Chunk indexes are stable.
- Source anchors are stable.

## 4. Add Embedding Provider Wrapper
Create a server-only embedding helper, for example:

- `lib/rag/embedding-provider.ts`

Responsibilities:

- Validate provider env vars.
- Return clear server errors when `OPENROUTER_API_KEY`, `RAG_EMBEDDING_MODEL`, or `RAG_EMBEDDING_DIMENSION` is missing.
- Call the selected embedding endpoint server-side.
- Validate returned vector dimensions.
- Return typed embedding results.
- Hide provider-specific errors behind user-safe messages.
- Never log API keys or full document content.

Call OpenRouter only from server code. Do not call NVIDIA directly. Do not expose raw provider payloads to the client.

## 5. Add Vectorization Data Access
Create helpers for:

- Loading an owned document.
- Updating document vector status.
- Counting monthly `vectorize_job` usage.
- Counting current total chunks for the user.
- Deleting old chunks for a document.
- Inserting new chunks.
- Recording a `vectorize_job` usage event.

All helpers must derive `user_id` from authenticated session context, not from client input.

## 6. Add Vectorization API Route
Create:

- `app/api/documents/[id]/vectorize/route.ts`

Flow:

1. Authenticate user.
2. Load owned document.
3. Load profile and active plan limits.
4. Check monthly vectorize quota.
5. Check document character count.
6. Chunk document content.
7. Check max chunks per document.
8. Count total current chunks.
9. Delete old chunks for this document before replacing them.
10. Check max total chunks after replacement.
11. Set document status to `vectorizing`.
12. Generate embeddings server-side.
13. Insert chunks.
14. Record `vectorize_job`.
15. Set status to `vectorized`.
16. Return typed JSON response.

On failure after work starts:

- Set status to `failed`.
- Set `last_vectorize_error`.
- Return user-safe JSON.

## 7. Update Dashboard Document UI
Add a small vectorization control on `/dashboard/documents/[id]`:

- Show current vector status.
- Add "Vectorize" or "Re-vectorize" button.
- Show a privacy warning before vectorization while using the free OpenRouter model.
- Show loading/pending state.
- Show success/failure message.
- Keep the edit/delete flows working.

Do not add RAG chat.

## 8. Add Tests
Add unit tests for pure logic:

- Chunking behavior.
- Limit checks where pure.
- Provider response validation if separated from fetch.

Add route/data-access tests only if the project has a clean pattern for them. Otherwise rely on manual QA plus build/lint/type checks for server route integration.

## 9. Manual QA
Use `docs/RAG/PHASE_4_VECTORIZATION_QA.md`.

Minimum checks:

- Logged-out user cannot vectorize.
- User can vectorize own document.
- User cannot vectorize another user's document.
- Quotas are enforced.
- Status transitions are correct.
- Chunks are private.
- Public tools still work.

## 10. Verification Commands
After implementation:

- `npm run test:run`
- `npm run lint`
- `npm run build`

## Stop Conditions
Stop and fix before proceeding if:

- Embedding dimension is unknown.
- Vector column dimension does not match provider output.
- Browser code can call the embedding provider directly.
- A client can insert or update `document_chunks` directly.
- Vectorization accepts a client-provided `user_id`.
- Vector search or chunk reads can cross user boundaries.
- RAG chat is accidentally added in Phase 4.
