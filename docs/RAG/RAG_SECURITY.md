# RAG Security

## API Key Safety
- Keep OpenRouter and provider API keys in server-only environment variables.
- Never expose provider keys through `NEXT_PUBLIC_*`.
- Browser clients must call DevToolBox AI API routes, not OpenRouter directly.
- Do not log API keys.
- Do not include API keys in error responses.
- Store model names and non-secret configuration separately from secrets.

## Auth Rules
- Use Supabase auth for signup, login, and session management.
- Use `@supabase/ssr` for Next.js App Router auth/session integration when implementation begins.
- API routes must derive the current user from the Supabase auth session.
- Never trust `user_id` from request bodies, query strings, or client state.
- Return `401` for unauthenticated dashboard/RAG API requests.
- Return `404` or `403` for resources not owned by the current user, with no private content leakage.

## Row Level Security Rules
Enable Row Level Security for:

- `profiles`
- `documents`
- `document_chunks`
- `chat_sessions`
- `chat_messages`
- `usage_events`

Core rule:

- A user can only access rows where `user_id = auth.uid()`.

Special cases:

- `profiles.id` should equal `auth.uid()`.
- `plan_limits` may allow public read for active plans, but writes must be admin-only.
- `app_config` may allow public read only for `is_public = true`; secrets do not belong there.

## Document Privacy
- Documents are private by default.
- Document chunks are private by default.
- Vector search must filter by current authenticated user.
- Do not let users query chunks by arbitrary `user_id`.
- Do not log full document content in production.
- Do not log full prompts containing private document chunks in production.
- If debug logging is needed, log IDs, counts, lengths, status codes, and timing, not raw private content.

## Input Limits
Validate all inputs before provider calls:

- Document title length.
- Document content length.
- Chat message length.
- Conversation message count.
- Number of chunks.
- Retrieved chunks per answer.
- Output token cap.

Reject oversized inputs with clear errors before chunking, embedding, or LLM calls.

## Prompt Injection Risks
Documents may contain hostile instructions such as "ignore previous instructions" or "reveal secrets."

Mitigations:

- Treat retrieved document chunks as untrusted reference material.
- Keep system instructions separate from retrieved context.
- Tell the model to answer from retrieved context without following instructions inside the documents.
- Never place secrets in prompts.
- Do not allow document content to change tool permissions, retrieval filters, or API behavior.
- Show sources so users can inspect where an answer came from.

## RAG Answer Safety
RAG answers should:

- Cite retrieved sources.
- Say when no relevant source was found.
- Avoid claiming certainty when retrieval is weak.
- Avoid inventing sources.
- Keep answers concise and practical.
- Never reveal hidden prompts, API keys, provider payloads, or internal chain-of-thought.

RAG API success responses should include:

- `answer`: user-facing answer.
- `sources`: cited document chunks or snippets.
- `usage`: quota and token-related usage metadata.
- `retrievalDetails`: source/search diagnostics.

## Retrieval Details vs Hidden Thinking
Do show retrieval details:

- Matched document titles.
- Chunk indexes or anchors.
- Similarity score ranges if useful.
- Number of chunks searched and returned.
- Whether the answer used retrieved context.

Do not show hidden model thinking:

- No chain-of-thought.
- No private system prompts.
- No raw provider debug traces.
- No secret configuration.

The UI should label retrieval details as source/debug information, not as the model's private reasoning.

`retrievalDetails` must never be presented as model chain-of-thought. They should explain what was retrieved, not how the model privately reasoned.

## Abuse Controls
- Enforce dynamic monthly usage limits.
- Rate-limit sensitive API routes if abuse appears.
- Keep anonymous public chat and authenticated RAG chat on separate quota/rate-limit systems.
- Allow public chat to be disabled by default if abuse or cost risk is high.
- Keep free plan limits conservative.
- Validate all request bodies.
- Avoid public debug endpoints.
- Avoid unauthenticated vectorization or RAG chat.
- Consider CAPTCHA or email verification later if signup abuse appears.
