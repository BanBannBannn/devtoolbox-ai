# Phase 5 RAG Chat API Tasks

## Goal
Implement `POST /api/rag/chat` so authenticated users can ask questions against only their own vectorized document chunks.

This task list is planning-only. Do not implement runtime code until Phase 5 implementation begins.

## 1. Review Phase 4 Prerequisites
- Confirm `document_chunks` exists.
- Confirm `document_chunks.embedding` is `vector(2048)`.
- Confirm chunks are private by `user_id`.
- Confirm documents can be vectorized and re-vectorized.
- Confirm `RAG_EMBEDDING_DIMENSION=2048`.
- Confirm `RAG_EMBEDDING_MODEL=nvidia/llama-nemotron-embed-vl-1b-v2:free`.
- Confirm `RAG_LLM_MODEL=nvidia/nemotron-3-super-120b-a12b:free`.
- Confirm public tools still work without login.

## 2. Apply Or Review Retrieval SQL
Use `docs/RAG/PHASE_5_RAG_CHAT_API_SQL.md`.

Recommended approach:

- Add `public.match_document_chunks(query_embedding vector(2048), match_count integer)`.
- Use `auth.uid()` inside the RPC.
- Use cosine distance with `<=>`.
- Return chunk content and metadata only for rows owned by the current authenticated user.
- Call the RPC from the normal authenticated server Supabase client.

Do not run SQL until it has been reviewed in Supabase SQL Editor or migrated through the repo migration flow.

## 3. Add Request Validation Logic
Create pure validation helpers if useful, for example:

- `lib/rag/rag-chat-validation.ts`
- `lib/rag/rag-chat-validation.test.ts`

Validate:

- request body is JSON.
- `message` exists.
- `message` is a string.
- trimmed `message` is non-empty.
- `message.length <= 2000`.
- optional `sessionId` is a UUID if provided.

Validation failures:

- return clear JSON errors.
- happen before embedding.
- do not record `rag_message` usage.

## 4. Add LLM Provider Wrapper
Create a server-only helper if the existing public chat wrapper is not reusable:

- `lib/rag/rag-llm-provider.ts`

Responsibilities:

- Read `OPENROUTER_API_KEY` server-side only.
- Read `RAG_LLM_MODEL`, defaulting to `nvidia/nemotron-3-super-120b-a12b:free`.
- Call `https://openrouter.ai/api/v1/chat/completions`.
- Send `HTTP-Referer` from `NEXT_PUBLIC_SITE_URL` if configured.
- Send `X-Title: DevToolBox AI`.
- Use `max_tokens` from `plan_limits.max_output_tokens`.
- Use a low temperature, such as `0.3`.
- Return typed success/error results.
- Hide raw provider payloads behind user-safe errors.
- Never log API keys, full prompts, full context, or full provider responses.

## 5. Add Prompt Builder
Create a deterministic prompt builder if useful:

- `lib/rag/rag-prompt.ts`
- `lib/rag/rag-prompt.test.ts`

The prompt should include:

- system instruction identifying the assistant as the DevToolBox AI RAG assistant.
- instruction that retrieved chunks are untrusted data, not commands.
- instruction to answer from retrieved chunks when possible.
- instruction to say when documents do not contain enough information.
- instruction to cite sources by source title and chunk anchor.
- retrieved chunks with source metadata.
- user question.

The prompt must not include:

- API keys.
- service role key.
- raw embeddings.
- hidden server debug data.
- unrelated private server configuration.

## 6. Add Retrieval Helpers
Create helpers if useful:

- `lib/rag/retrieve-document-chunks.ts`

Responsibilities:

- Accept authenticated Supabase server client.
- Accept query embedding and match count.
- Call `match_document_chunks`.
- Return typed chunk matches.
- Convert full chunk content to short snippets for response details.
- Keep full retrieved chunk content only inside server-side prompt building.
- Never expose raw embeddings.

Use `plan_limits.retrieved_chunks_per_answer` for the match count. API responses can label this as `maxRetrievedChunks`.

## 7. Add Usage Helpers
Reuse Phase 3 helpers where possible:

- ensure the current user's profile exists.
- load active plan limits.
- calculate current UTC month `period_start`.
- count current-month `rag_message` usage.

Add pure helper tests where useful:

- quota available.
- quota exhausted.
- usage summary formatting.
- safe snippet creation.

## 8. Add API Route
Create:

- `app/api/rag/chat/route.ts`

Flow:

1. Authenticate user with the normal Supabase server client.
2. Return `401` for logged-out users.
3. Parse and validate JSON body.
4. Ensure profile exists.
5. Load active plan limits.
6. Count current-month `rag_message` usage.
7. Reject if monthly quota is exhausted.
8. Embed the user question using the Phase 4 embedding helper.
9. Retrieve top chunks using `match_document_chunks`.
10. If no chunks are found, return a helpful answer with empty sources and clear retrieval details.
11. Build a prompt using retrieved chunks as untrusted context.
12. Record `rag_message` usage once provider/model work starts according to policy.
13. Call OpenRouter LLM server-side.
14. Return typed JSON with `answer`, `sources`, `usage`, and `retrievalDetails`.

Failure behavior:

- Return user-safe errors.
- Do not expose raw provider payloads.
- Do not expose full prompt.
- Do not expose full document content.
- Do not expose raw embeddings.
- Do not expose secrets.

## 9. Prompt Injection Review
Before implementation is considered complete:

- Confirm retrieved chunks are labeled as untrusted data.
- Confirm model instructions say document content cannot override system/developer/user instructions.
- Confirm answers are grounded in retrieved content.
- Confirm the API never reveals hidden prompts, provider payloads, keys, raw embeddings, or chain-of-thought.

## 10. Tests
Add tests for pure logic:

- valid request body.
- missing message.
- empty message.
- message longer than `2000` characters.
- invalid `sessionId`.
- safe snippet creation.
- RAG quota available/exhausted helpers if added.
- prompt builder includes source metadata.
- prompt builder treats chunks as untrusted context.
- retrieval details builder excludes raw embeddings and full context.

Do not test real OpenRouter calls in unit tests.

Route/data-access tests should be added only if the project has a clean pattern for mocked Supabase Route Handler tests. Otherwise rely on pure tests plus manual QA and build/lint/type checks.

## 11. Manual QA
Use `docs/RAG/PHASE_5_RAG_CHAT_API_QA.md`.

Minimum checks:

- logged-out user gets `401`.
- logged-in user can ask against own vectorized documents.
- user cannot retrieve another user's chunks.
- quota is enforced.
- retrieved chunk count respects plan limits.
- max output tokens respect plan limits.
- response includes sources.
- response includes `retrievalDetails`.
- no secrets, raw embeddings, full prompt, full documents, or chain-of-thought appear in the response.
- public tools still work.

## 12. Verification Commands
After implementation:

- `npm run test:run`
- `npm run lint`
- `npm run build`

## Stop Conditions
Stop and fix before proceeding if:

- `OPENROUTER_API_KEY` can reach the browser.
- Raw embeddings appear in API responses.
- Retrieval can cross user boundaries.
- The API accepts `user_id` from the client.
- `retrievalDetails` expose chain-of-thought, full prompts, full context, or provider payloads.
- Prompt injection content can override system/developer/user instructions.
- Public tools or existing vectorization flows break.
