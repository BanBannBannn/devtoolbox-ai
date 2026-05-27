# Phase 5D RAG Chat Sessions Tasks

## Goal
Implement persisted multi-session dashboard RAG chat after the SQL has been reviewed and applied.

Phase 5D-1 covers the backend implementation. Dashboard session list UI remains a later step.

## 1. Review Current RAG Chat
- Confirm `POST /api/rag/chat` accepts optional `sessionId`.
- Confirm current request validation still enforces `2000` characters.
- Confirm current RAG responses do not expose model names or secrets.
- Confirm dashboard RAG chat currently handles single-turn answers.
- Confirm public tools remain accessible without login.

## 2. Review And Apply SQL
Use:

- `docs/RAG/PHASE_5D_RAG_CHAT_SESSIONS_SQL.md`

SQL should:

- create `chat_sessions`.
- create `chat_messages`.
- enable RLS.
- add user-owned policies.
- add indexes.
- add an `updated_at` trigger for sessions.

Do not run SQL until reviewed in Supabase SQL Editor or converted to a migration.

## 3. Add Data Access Helpers
Potential files:

- `lib/rag/chat-sessions.ts`
- `lib/rag/chat-messages.ts`

Helpers should:

- list current user's sessions.
- load one owned session.
- create an owned session.
- update session title and `updated_at`.
- list messages for an owned session.
- insert user and assistant messages.
- delete owned sessions/messages if delete is included.

All helpers must derive `user_id` from the authenticated Supabase session or accept it only from trusted server code after auth.

## 4. Update Runtime Config
Add:

- `chatHistoryMessages`

Default:

- `6`

Safe range:

- `0` to `20`

Env fallback:

- `RAG_CHAT_HISTORY_MESSAGES`

Rules:

- Admin UI/app_config should remain the normal source of truth.
- Env values are fallback/emergency only according to Phase 5C priority.
- Final values must be clamped.

## 5. Update API Flow
Update `POST /api/rag/chat`:

1. Authenticate user.
2. Validate body.
3. If `sessionId` is present, verify owned session.
4. If `sessionId` is missing, create a session with a safe title.
5. Insert the user message only after validation/auth/session checks pass.
6. Load recent same-session messages using `chatHistoryMessages`.
7. Embed only the current user question.
8. Retrieve user-owned document chunks.
9. Build prompt with system instructions, recent chat history, retrieved chunks, and current question.
10. Record usage according to current policy.
11. Call LLM.
12. Insert assistant message with answer, sources, usage, and retrieval details.
13. Return `sessionId`, answer, sources, usage, and retrieval details.

Phase 5D-1 implementation notes:

- The API creates a session when `sessionId` is missing.
- The API verifies ownership when `sessionId` is provided.
- The API inserts the user message after auth, validation, quota, and session ownership checks.
- The API saves successful assistant messages with answer content, sources, usage, and retrieval details.
- If provider work fails, the user message may remain saved and no assistant error message is saved.
- Session `updated_at` is bumped in server code after valid message inserts.

## 6. Prompt Builder Changes
Update prompt builder to include recent chat history as untrusted context.

Rules:

- Keep system instructions highest priority.
- Label chat history clearly.
- Treat chat history as untrusted text.
- Retrieved document chunks remain the main evidence source.
- If retrieved context is insufficient, answer that uploaded documents do not contain enough information.
- Do not expose chain-of-thought, prompts, raw embeddings, provider payloads, keys, service role key, or model names.

## 7. Dashboard UI
Update dashboard RAG chat UI:

- `/dashboard/rag-chat` lists recent sessions.
- User can create a new chat.
- User can open a previous session.
- User can continue a previous session.
- Previous messages render after refresh.
- Assistant messages show Markdown answer rendering, sources, usage, and retrieval details.
- UI remains mobile-friendly.

Optional route:

- `/dashboard/rag-chat/[sessionId]`

## 8. Tests
Add pure tests where practical:

- session title generation.
- owned session guard behavior if extracted as pure logic.
- chat history limit clamping.
- prompt builder includes recent history.
- prompt builder treats history as untrusted.
- API response mapping includes `sessionId`.
- response mapping does not expose model names or secrets.

Data-access/route tests should be added only if the project has a clean Supabase mocking pattern. Otherwise rely on pure tests plus manual QA.

## 9. Manual QA
- Logged-out user cannot access RAG chat session routes.
- Logged-in user can create a new chat.
- Session appears in recent sessions list.
- User can continue a previous session.
- Messages persist after refresh.
- User cannot access another user's session.
- RAG answer still cites sources.
- Retrieval still only searches owned chunks.
- Model names and secrets do not appear.
- Public tools still work without login.

## Stop Conditions
Stop before completion if:

- Client can submit or override `user_id`.
- Session ownership is not checked server-side.
- Chat history is used for retrieval in v1 without a documented query rewrite decision.
- Full prompts, raw embeddings, model names, API keys, or service role key appear in responses.
- Public routes regress.
