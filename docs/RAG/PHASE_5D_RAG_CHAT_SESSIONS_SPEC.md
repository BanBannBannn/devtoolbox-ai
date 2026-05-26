# Phase 5D RAG Chat Sessions Spec

## Goal
Upgrade dashboard RAG chat from single-turn Q&A to multi-session chat with persisted message history.

This phase is planning only. It does not implement runtime code, create routes, run SQL, add streaming, upgrade the global chatbox, add query rewriting, add conversation summaries, add public sharing, add teams/workspaces, add file upload, add payments, add benchmarking, or modify public tools.

## User Outcomes
- A logged-in user can create multiple RAG chat sessions.
- A logged-in user can view previous RAG chat sessions.
- A logged-in user can continue a previous session.
- A logged-in user can see previous user and assistant messages.
- Each assistant message can retain sources, usage, and retrieval details.
- A user cannot access another user's sessions or messages.

## Routes And UI
Recommended routes:

- `/dashboard/rag-chat`
  - list recent sessions.
  - create a new chat.
  - open the selected session.
- `/dashboard/rag-chat/[sessionId]`
  - optional route if cleaner.
  - show one chat session and its messages.

The current dashboard RAG chat page can evolve into either a split layout or a session-list-first page. The implementation should stay mobile-friendly.

## Database Tables
Add `public.chat_sessions`:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid references auth.users(id) on delete cascade`
- `title text not null`
- `created_at timestamptz`
- `updated_at timestamptz`

Add `public.chat_messages`:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid references auth.users(id) on delete cascade`
- `session_id uuid references public.chat_sessions(id) on delete cascade`
- `role text not null check (role in ('user', 'assistant'))`
- `content text not null`
- `sources jsonb`
- `retrieval_details jsonb`
- `usage jsonb`
- `created_at timestamptz`

Indexes:

- `chat_sessions(user_id, updated_at desc)`
- `chat_messages(session_id, created_at asc)`
- `chat_messages(user_id, created_at desc)`

## RLS And Ownership
- Enable RLS on `chat_sessions` and `chat_messages`.
- Users can select, insert, update, and delete only their own `chat_sessions`.
- Users can select, insert, and delete only their own `chat_messages`.
- Server API routes must derive `user_id` from the authenticated Supabase session.
- Never trust `user_id` from request bodies, query params, hidden inputs, or client state.
- A user must never read, continue, update, or delete another user's sessions/messages.

## API Changes
Current route remains:

- `POST /api/rag/chat`

Request body:

```json
{
  "message": "question",
  "sessionId": "optional uuid"
}
```

If `sessionId` is missing:

- Create a new session automatically.
- Generate a short safe title from the first user message, such as the first `60` characters.
- Return `sessionId` in the response.

If `sessionId` is present:

- Verify the session belongs to the authenticated user.
- Append the user message to that session.

Success response:

```json
{
  "success": true,
  "sessionId": "uuid",
  "answer": "...",
  "messages": [],
  "sources": [],
  "usage": {},
  "retrievalDetails": {}
}
```

The `messages` field is optional in the API response. The UI may load messages separately if that keeps the API simpler.

## Message Persistence Policy
- Validation failures must not create sessions or messages.
- Missing/invalid auth must not create sessions or messages.
- If provider work starts and then fails, the user message may remain saved.
- Assistant error messages may be saved or omitted, but implementation must document the policy before shipping.
- Assistant success messages should store:
  - `content`
  - `sources`
  - `usage`
  - `retrieval_details`

## Context Window
Do not include the entire chat history in the LLM prompt.

Add runtime setting:

- `chatHistoryMessages`

Optional env fallback:

- `RAG_CHAT_HISTORY_MESSAGES`

Recommended default:

- `6` messages

Safe range:

- `0` to `20`

If using `app_config.rag_runtime_settings`, add:

```json
{
  "chatHistoryMessages": 6
}
```

History should not bypass RAG grounding. Retrieved document chunks remain the main evidence source.

## Prompt Building
- System instructions remain highest priority.
- Retrieved document chunks are untrusted context.
- Chat history is also untrusted user/assistant text.
- Do not reveal chain-of-thought.
- Do not reveal prompts, API keys, raw embeddings, model names, service role key, provider payloads, or hidden instructions.
- If retrieved context is insufficient, say the uploaded documents do not contain enough information.

## Retrieval Strategy V1
- Embed only the current user question.
- Do not rewrite the query yet.
- Do not use the whole chat history for embedding yet.
- Future v1.5 option: history-aware query rewriting that converts follow-up questions into standalone questions before retrieval.

## Limits And Usage
- `monthly_rag_messages` still applies.
- Existing message max length remains `2000` characters.
- Saving messages happens only for valid authenticated requests.
- Validation failures should not count usage and should not create messages.
- Add optional max messages per session later; it is not required in v1.

## Runtime Settings
Add `chatHistoryMessages` to RAG runtime settings:

| Setting | Default | Safe range | Purpose |
| --- | ---: | --- | --- |
| `chatHistoryMessages` | `6` | `0` to `20` | Number of recent same-session messages included in the LLM prompt. |

Admin settings should eventually allow editing `chatHistoryMessages`, but this planning task does not implement the admin UI.

## Security
- Session ownership must be verified server-side.
- Browser never sends `user_id`.
- Browser never receives model names, API keys, service role key, raw embeddings, full prompts, hidden instructions, or chain-of-thought.
- `retrievalDetails` remain safe diagnostics only.
- Chat history and retrieved chunks must be treated as untrusted text.

## Acceptance Criteria
- Logged-in user can create a new RAG chat session.
- Logged-in user can see session list.
- Logged-in user can continue an existing session.
- Messages persist after refresh.
- RAG API includes recent chat history in LLM prompt.
- RAG retrieval still only searches the user's own chunks.
- User cannot access another user's session.
- Model names and secrets are not exposed.
- Public tools still work without login.
