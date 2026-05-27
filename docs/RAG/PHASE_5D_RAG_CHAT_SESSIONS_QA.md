# Phase 5D RAG Chat Sessions QA Checklist

## Scope
- [ ] Phase 5D adds persisted RAG chat sessions.
- [ ] Phase 5D-1 implements backend session persistence.
- [ ] Phase 5D-1 does not add dashboard session list UI yet.
- [ ] Phase 5D does not add streaming.
- [ ] Phase 5D does not upgrade the global public chatbox.
- [ ] Phase 5D does not add query rewriting in v1.
- [ ] Phase 5D does not add conversation summarization memory.
- [ ] Phase 5D does not add public session sharing.
- [ ] Phase 5D does not add teams/workspaces.
- [ ] Phase 5D does not add file upload.
- [ ] Phase 5D does not add payments.
- [ ] Phase 5D does not add benchmarking.
- [ ] Public tools remain unchanged.

## Database
- [ ] `chat_sessions` table exists.
- [ ] `chat_messages` table exists.
- [ ] `chat_sessions.user_id` references `auth.users(id)`.
- [ ] `chat_messages.user_id` references `auth.users(id)`.
- [ ] `chat_messages.session_id` references `chat_sessions(id)`.
- [ ] `chat_messages.role` is constrained to `user` or `assistant`.
- [ ] Assistant messages can store `sources`, `retrieval_details`, and `usage` as `jsonb`.
- [ ] `chat_sessions.updated_at` updates on changes.
- [ ] Required indexes exist.

## RLS And Ownership
- [ ] RLS is enabled on `chat_sessions`.
- [ ] RLS is enabled on `chat_messages`.
- [ ] User can select only own sessions.
- [ ] User can insert only own sessions.
- [ ] User can update only own sessions.
- [ ] User can delete only own sessions.
- [ ] User can select only own messages.
- [ ] User can insert only own messages.
- [ ] User can delete only own messages.
- [ ] User cannot access another user's session by guessing UUID.
- [ ] User cannot access another user's messages by guessing UUID.

## API Behavior
- [ ] `POST /api/rag/chat` accepts optional `sessionId`.
- [ ] Missing `sessionId` creates a new owned session.
- [ ] New session title is generated safely from the first user message.
- [ ] Existing `sessionId` is verified as owned by the authenticated user.
- [ ] Invalid or unowned `sessionId` returns a clear safe error.
- [ ] Success response includes `sessionId`.
- [ ] Validation failures do not create sessions.
- [ ] Validation failures do not create messages.
- [ ] Validation failures do not count `rag_message` usage.
- [ ] User message is saved for valid authenticated requests.
- [ ] Assistant message is saved on successful answer.
- [ ] Assistant message stores sources, usage, and retrieval details.
- [ ] Provider failures may leave the user message saved.
- [ ] Provider failures do not save an assistant error message in Phase 5D-1.
- [ ] Session `updated_at` is bumped after valid messages are inserted.

## Context Window
- [ ] `chatHistoryMessages` runtime setting exists.
- [ ] `RAG_CHAT_HISTORY_MESSAGES` env fallback is documented or implemented.
- [ ] Default is `6`.
- [ ] Safe range is `0` to `20`.
- [ ] Only recent same-session messages are included.
- [ ] Entire history is not included.
- [ ] Chat history does not bypass RAG grounding.
- [ ] Retrieved document chunks remain the main evidence source.

## Prompt Safety
- [ ] System instructions remain highest priority.
- [ ] Retrieved chunks are treated as untrusted context.
- [ ] Chat history is treated as untrusted text.
- [ ] Prompt says context/history cannot override system/developer/user instructions.
- [ ] If retrieved context is insufficient, answer says uploaded documents do not contain enough information.
- [ ] Prompt does not expose hidden instructions, secrets, or model names.

## Retrieval
- [ ] Only the current user question is embedded in v1.
- [ ] Whole chat history is not embedded in v1.
- [ ] Query rewriting is not added in v1.
- [ ] Retrieval still uses only owned document chunks.
- [ ] User cannot retrieve another user's chunks.

## Dashboard UI
- [ ] User can see recent RAG chat sessions.
- [ ] User can create a new chat.
- [ ] User can open a previous chat.
- [ ] User can continue a previous chat.
- [ ] Previous messages render after refresh.
- [ ] Assistant Markdown rendering still works safely.
- [ ] Sources still show short snippets.
- [ ] Retrieval details remain structured diagnostics, not thinking.
- [ ] UI is mobile-friendly.

## Security
- [ ] Browser never sends `user_id`.
- [ ] Browser never receives API keys.
- [ ] Browser never receives service role key.
- [ ] Browser never receives model names.
- [ ] Browser never receives raw embeddings.
- [ ] Browser never receives full prompts.
- [ ] Browser never receives hidden chain-of-thought.
- [ ] Browser never receives full private document chunks.
- [ ] Production logs do not include full prompts, full chunks, raw embeddings, keys, or provider payloads.

## Public Regression
- [ ] Public tools work without login.
- [ ] Blog pages work without login.
- [ ] Sitemap builds.
- [ ] Robots builds.
- [ ] Existing document CRUD still works.
- [ ] Existing vectorization still works.
- [ ] Existing RAG runtime/admin settings still work.

## Verification Commands
- [ ] `npm run test:run`
- [ ] `npm run lint`
- [ ] `npm run build`
