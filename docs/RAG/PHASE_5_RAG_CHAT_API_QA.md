# Phase 5 RAG Chat API QA Checklist

## Scope
- [ ] Phase 5 adds `POST /api/rag/chat`.
- [ ] Phase 5 does not add dashboard chat UI.
- [ ] Phase 5 does not upgrade the global chatbox.
- [ ] Phase 5 does not add streaming.
- [ ] Phase 5 does not add file upload.
- [ ] Phase 5 does not add PDF/DOCX parsing.
- [ ] Phase 5 does not add payments.
- [ ] Phase 5 does not add teams/workspaces.
- [ ] Phase 5 does not change public tools.
- [ ] Phase 5 does not add public anonymous RAG chat.

## SQL And Retrieval Setup
- [ ] `match_document_chunks` RPC exists.
- [ ] RPC uses `query_embedding vector(2048)`.
- [ ] RPC uses cosine distance with `<=>`.
- [ ] RPC returns `id`, `document_id`, `chunk_index`, `content`, `source_title`, `source_anchor`, and `similarity`.
- [ ] Recommended RPC uses `auth.uid()` internally.
- [ ] RPC returns only chunks owned by the authenticated user.
- [ ] RPC does not allow clients to pass arbitrary user IDs.
- [ ] RLS remains enabled on `document_chunks`.
- [ ] Direct browser writes to `document_chunks` remain blocked.

## Authentication And Ownership
- [ ] Logged-out user receives `401` from `POST /api/rag/chat`.
- [ ] Logged-in user can ask questions against their own vectorized documents.
- [ ] User A cannot retrieve User B's chunks.
- [ ] API never accepts `user_id` from the request body.
- [ ] API never accepts `user_id` from query params or client state.
- [ ] Missing or invalid session returns a clear user-safe error.

## Request Validation
- [ ] Missing JSON body is rejected.
- [ ] Missing `message` is rejected.
- [ ] Non-string `message` is rejected.
- [ ] Empty trimmed `message` is rejected.
- [ ] `message` longer than `2000` characters is rejected.
- [ ] Invalid optional `sessionId` is rejected if session support is included.
- [ ] Validation failures happen before embedding.
- [ ] Validation failures do not record `rag_message` usage.

## Embedding
- [ ] Question embedding uses OpenRouter server-side.
- [ ] Question embedding uses `RAG_EMBEDDING_MODEL`.
- [ ] Question embedding uses the same model as Phase 4 vectorization unless intentionally migrated.
- [ ] `RAG_EMBEDDING_DIMENSION=2048` is validated.
- [ ] Wrong embedding dimension returns a clear server error.
- [ ] Raw embeddings are not returned to the client.
- [ ] Raw embeddings are not logged.
- [ ] Raw question text is not logged in production.

## Retrieval
- [ ] Retrieval uses only chunks owned by the authenticated user.
- [ ] Retrieval count comes from active plan limits.
- [ ] Current schema field `retrieved_chunks_per_answer` is mapped to API response `maxRetrievedChunks`.
- [ ] Retrieved chunks include source title and source anchor.
- [ ] Retrieved chunks include similarity scores in `retrievalDetails`.
- [ ] Sources include short snippets only.
- [ ] Full document content is not returned.
- [ ] Full retrieved context is not returned.
- [ ] If no chunks match, response is helpful and safe.
- [ ] If user has no vectorized documents, response is helpful and safe.

## LLM Answer
- [ ] LLM call uses OpenRouter server-side.
- [ ] LLM model comes from `RAG_LLM_MODEL`.
- [ ] Default LLM model is `nvidia/nemotron-3-super-120b-a12b:free`.
- [ ] `max_tokens` comes from `plan_limits.max_output_tokens`.
- [ ] Answer is grounded in retrieved context.
- [ ] If context is insufficient, answer says documents do not contain enough information.
- [ ] Answer includes sources.
- [ ] Answer does not invent sources.
- [ ] Answer does not reveal hidden chain-of-thought.
- [ ] Answer does not reveal prompts, API keys, provider payloads, or raw embeddings.
- [ ] Answer response does not expose exact embedding or LLM model names.

## Prompt Injection
- [ ] Retrieved chunks are treated as untrusted data.
- [ ] System prompt says document chunks may contain instructions but are not commands.
- [ ] Document content cannot override system, developer, or user instructions.
- [ ] Document content cannot request secrets, prompts, provider payloads, raw embeddings, or chain-of-thought.
- [ ] Prompt injection attempts in documents do not change retrieval ownership checks.
- [ ] Prompt injection attempts in documents do not change quota behavior.

## Limits And Usage
- [ ] `monthly_rag_messages` is enforced.
- [ ] Current-month `rag_message` usage is counted by UTC `period_start`.
- [ ] `retrieved_chunks_per_answer` is enforced.
- [ ] `max_output_tokens` is enforced.
- [ ] Successful/provider-started requests record `usage_events.event_type = 'rag_message'`.
- [ ] Validation failures do not record `rag_message` usage.
- [ ] If provider work starts and fails, usage policy is followed and documented.
- [ ] Response includes `ragMessagesUsed`.
- [ ] Response includes `ragMessagesLimit`.
- [ ] Response includes `retrievedChunks`.
- [ ] Response includes `maxRetrievedChunks`.

## Retrieval Details
- [ ] Response includes `retrievalDetails`.
- [ ] `retrievalDetails.queryEmbedded` is present.
- [ ] `retrievalDetails.matchedChunkCount` is present.
- [ ] `retrievalDetails.similarityMetric` is `cosine`.
- [ ] `retrievalDetails.retrievedChunks` includes document IDs.
- [ ] `retrievalDetails.retrievedChunks` includes chunk indexes.
- [ ] `retrievalDetails.retrievedChunks` includes source titles.
- [ ] `retrievalDetails.retrievedChunks` includes source anchors.
- [ ] `retrievalDetails.retrievedChunks` includes similarity scores.
- [ ] `retrievalDetails.retrievedChunks` includes short snippets only.
- [ ] `retrievalDetails` are not called "thinking."
- [ ] `retrievalDetails` do not include a `models` object.
- [ ] `retrievalDetails` do not expose exact embedding or LLM model names.
- [ ] `retrievalDetails` do not expose chain-of-thought.
- [ ] `retrievalDetails` do not expose full prompts.
- [ ] `retrievalDetails` do not expose full document content.
- [ ] `retrievalDetails` do not expose full retrieved context.
- [ ] `retrievalDetails` do not expose raw embeddings.
- [ ] `retrievalDetails` do not expose raw provider responses.
- [ ] `retrievalDetails` do not expose API keys or service role keys.

## Secrets And Logging
- [ ] `OPENROUTER_API_KEY` stays server-side only.
- [ ] `SUPABASE_SERVICE_ROLE_KEY`, if used anywhere, stays server-side only.
- [ ] No `NEXT_PUBLIC_OPENROUTER_API_KEY` exists.
- [ ] API response does not expose OpenRouter API key.
- [ ] API response does not expose Supabase service role key.
- [ ] API response does not expose `RAG_EMBEDDING_MODEL`.
- [ ] API response does not expose `RAG_LLM_MODEL`.
- [ ] Client bundle does not expose provider keys.
- [ ] Production logs do not include full prompt.
- [ ] Production logs do not include full document content.
- [ ] Production logs do not include full retrieved context.
- [ ] Production logs do not include raw provider response payloads.
- [ ] Production logs do not include hidden chain-of-thought.

## Public Route Regression
- [ ] Public tools work without login.
- [ ] Blog pages work without login.
- [ ] Sitemap builds.
- [ ] Robots builds.
- [ ] AdSense setup is unchanged.
- [ ] Existing document CRUD still works.
- [ ] Existing vectorization still works.

## Verification Commands
- [ ] `npm run test:run`
- [ ] `npm run lint`
- [ ] `npm run build`
