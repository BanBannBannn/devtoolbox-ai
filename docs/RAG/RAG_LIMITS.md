# RAG Limits

## Free Plan Limits
Recommended starting limits:

| Limit | Value |
| --- | ---: |
| RAG chat messages per month | 30 |
| Vectorize jobs per month | 3 |
| Saved documents total | 10 |
| Characters per document | 20,000 |
| Chunks per document | 50 |
| Chunks total per user | 100 |
| Retrieved chunks per answer | 3 |
| Max output tokens per answer | 800 |

## Why Each Limit Exists
RAG chat messages per month:

- Controls LLM spend.
- Reduces abuse risk.
- Encourages concise use during the free phase.
- Applies to authenticated personal RAG chat, not anonymous public chat.

Vectorize jobs per month:

- Controls embedding spend.
- Prevents repeated re-vectorization of large documents.
- Keeps background work manageable.

Saved documents total:

- Keeps the free database footprint predictable.
- Helps users focus v1 usage on a small knowledge base.

Characters per document:

- Prevents oversized requests.
- Keeps chunking and embedding jobs fast.
- Avoids accidental paste of huge logs or private dumps.

Chunks per document:

- Caps vector storage from one document.
- Prevents one document from consuming the whole account quota.

Chunks total per user:

- Controls vector index size.
- Keeps search predictable and affordable.

Retrieved chunks per answer:

- Keeps prompts concise.
- Reduces irrelevant context.
- Controls output cost and latency.

Max output tokens per answer:

- Controls LLM cost.
- Encourages concise, practical answers.
- Reduces the chance of rambling responses.

## Dynamic `plan_limits` Design
Do not hardcode quota values in API route logic.

Each authenticated request should:

1. Load the user's `profiles.plan_key`.
2. Load the active `plan_limits` row for that plan.
3. Apply the loaded limits to validation and quota checks.
4. Return limit values in usage responses so the UI can display current remaining usage.

Benefits:

- Limits can change without redeploying.
- A future paid plan can be added without rewriting core logic.
- Tests can seed plan limits explicitly.
- Admins can temporarily lower risky limits during abuse events.

Anonymous public chat should use separate rate-limit and quota controls from authenticated RAG chat. Public chat can be disabled by default or kept behind a stricter limit if abuse or cost risk is high.

## `usage_events` Design
Use append-only usage events for quota accounting.

Example events:

- `rag_message`: one user RAG answer request.
- `vectorize_job`: one document vectorization attempt that passes validation.
- `public_chat_message`: optional anonymous or session-scoped public assistant usage event if public chat needs accounting.
- `embedding_tokens`: optional provider usage metadata.
- `llm_output_tokens`: optional provider usage metadata.
- `chunk_created`: optional vector storage accounting.

Monthly quota checks should group events by:

- `user_id`
- `event_type`
- `period_start`

`period_start` should be the first day of the usage month in UTC.

## Quota Checking Flow
Document creation:

1. Authenticate user.
2. Load plan limits.
3. Count existing documents for the user.
4. Reject if count is at or above `max_saved_documents`.
5. Validate title and content.
6. Reject if content is longer than `max_document_characters`.
7. Save document.

Vectorization:

1. Authenticate user.
2. Load document by ID and require ownership.
3. Load plan limits.
4. Count monthly `vectorize_job` usage.
5. Reject if monthly vectorize quota is exhausted.
6. Validate document length.
7. Chunk the document.
8. Reject or trim if chunks exceed `max_chunks_per_document`.
9. Count existing chunks for the user.
10. Reject if total chunks would exceed `max_chunks_total`.
11. Embed and store chunks.
12. Write a `vectorize_job` usage event.

RAG chat:

1. Authenticate user.
2. Load plan limits.
3. Count monthly `rag_message` usage.
4. Reject if monthly message quota is exhausted.
5. Validate question length and conversation size.
6. Embed the question.
7. Retrieve up to `retrieved_chunks_per_answer` owned chunks.
8. Call the LLM with `max_output_tokens`.
9. Write a `rag_message` usage event.
10. Return answer, sources, usage, and retrieval details.

Public chat:

1. Check whether public chat is enabled.
2. Apply anonymous/session/IP-oriented rate limits separate from `plan_limits`.
3. Validate message length and conversation size.
4. Call the public assistant only if cost and abuse controls pass.
5. Return a concise answer without document retrieval.

## Failure Behavior
- Return clear JSON errors.
- Do not partially charge usage for validation failures.
- For vectorization provider failures, decide whether to record an attempted `vectorize_job`; document that decision before implementation.
- Show users remaining quota and reset period when a limit blocks an action.
