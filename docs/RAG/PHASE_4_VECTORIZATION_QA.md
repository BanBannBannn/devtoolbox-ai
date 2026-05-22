# Phase 4 Document Vectorization QA Checklist

## Blocking Decisions
- [ ] Embedding provider is OpenRouter.
- [ ] Embedding model is read from `RAG_EMBEDDING_MODEL`.
- [ ] Default embedding model is `nvidia/llama-nemotron-embed-vl-1b-v2:free`.
- [ ] Later RAG LLM model is read from `RAG_LLM_MODEL`.
- [ ] Default later RAG LLM model is `nvidia/nemotron-3-super-120b-a12b:free`.
- [ ] Vector dimension is confirmed as `2048`.
- [ ] `RAG_EMBEDDING_DIMENSION=2048` is set.
- [ ] Vector distance metric is cosine distance for v1.
- [ ] SQL uses `embedding vector(2048)`.
- [ ] Future RPC placeholder uses `query_embedding vector(2048)`.
- [ ] Team understands that changing embedding models may require re-vectorizing documents.

## Database Setup
- [ ] `vector` extension is enabled in Supabase.
- [ ] `document_chunks` table exists.
- [ ] `document_chunks.embedding` dimension matches the selected embedding model.
- [ ] RLS is enabled on `document_chunks`.
- [ ] Users can select only chunks where `user_id = auth.uid()`.
- [ ] Normal authenticated users cannot insert chunks directly from the browser.
- [ ] Normal authenticated users cannot update chunks directly from the browser.
- [ ] Normal authenticated users cannot delete chunks directly from the browser.
- [ ] Index on `user_id` exists.
- [ ] Index on `document_id` exists.
- [ ] Unique index on `(document_id, chunk_index)` exists.
- [ ] Vector index uses cosine operator class when enabled.

## API Auth And Ownership
- [ ] Logged-out user cannot call `POST /api/documents/[id]/vectorize`.
- [ ] Logged-in user can vectorize their own document.
- [ ] Logged-in user cannot vectorize another user's document.
- [ ] API never accepts or trusts `user_id` from the request body.
- [ ] Missing document returns a safe not-found style error.
- [ ] Provider API key is never exposed to the browser.
- [ ] Missing `OPENROUTER_API_KEY` returns a clear server error.
- [ ] Missing `RAG_EMBEDDING_MODEL` returns a clear server error.
- [ ] Missing `RAG_EMBEDDING_DIMENSION` disables vectorization with a clear error.
- [ ] API key is not exposed in the client bundle.
- [ ] Model names are not hardcoded directly in API logic.
- [ ] No `NEXT_PUBLIC_OPENROUTER_API_KEY` exists.
- [ ] No separate NVIDIA API key is required.

## Limit Enforcement
- [ ] `monthly_vectorize_jobs` is enforced.
- [ ] `max_document_characters` is enforced.
- [ ] `max_chunks_per_document` is enforced.
- [ ] `max_chunks_total` is enforced.
- [ ] Limit errors are clear and user-safe.
- [ ] Validation failures do not record `vectorize_job` usage.
- [ ] A provider attempt records `vectorize_job` usage according to the Phase 4 policy.

## Chunking
- [ ] Short text creates one chunk.
- [ ] Long text creates multiple ordered chunks.
- [ ] Overlap works as expected.
- [ ] Empty text is rejected.
- [ ] Empty chunks are not inserted.
- [ ] Chunk indexes start at `0` and remain stable.
- [ ] Source anchors are stable, such as `chunk-0`.
- [ ] `source_title` is saved from the document title.
- [ ] `token_estimate` is populated.

## Status Behavior
- [ ] New or edited document starts as `not_vectorized`.
- [ ] Vectorization sets status to `vectorizing`.
- [ ] Successful vectorization sets status to `vectorized`.
- [ ] Successful vectorization sets `vectorized_at`.
- [ ] Successful vectorization clears `last_vectorize_error`.
- [ ] Failed provider call sets status to `failed`.
- [ ] Failed provider call sets a concise `last_vectorize_error`.
- [ ] Re-vectorizing deletes old chunks before inserting new chunks.

## Privacy And Security
- [ ] Free model privacy warning appears before vectorization.
- [ ] Privacy warning says free OpenRouter endpoints may log prompts/outputs for provider improvement.
- [ ] Privacy warning says users should not vectorize personal, confidential, private, or business-critical documents with the free model.
- [ ] User A cannot read User B's chunks.
- [ ] User A cannot vectorize User B's document.
- [ ] Chunk inserts always use the authenticated user's ID.
- [ ] Logs do not include full document content.
- [ ] Logs do not include raw embeddings.
- [ ] Logs do not include provider API keys.
- [ ] Logs do not include raw provider payloads.

## Scope Boundaries
- [ ] No RAG chat API was added.
- [ ] No dashboard chat UI was added.
- [ ] No file upload was added.
- [ ] No PDF/DOCX parsing was added.
- [ ] No streaming was added.
- [ ] No payment behavior was added.
- [ ] No teams/workspaces behavior was added.
- [ ] No service role key was added unless explicitly justified in implementation notes.
- [ ] Public tools still work without login.
- [ ] Blog pages still work without login.
- [ ] Sitemap and robots still build.
- [ ] AdSense setup is unchanged.

## Verification Commands
- [ ] `npm run test:run`
- [ ] `npm run lint`
- [ ] `npm run build`
