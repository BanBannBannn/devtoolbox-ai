# RAG Roadmap

## Phase 0: Docs
Goal: plan the platform before implementation.

Deliverables:

- Product spec.
- Architecture plan.
- Database schema plan.
- Limits plan.
- Security plan.
- Roadmap.

Exit criteria:

- Scope is clear.
- V1 exclusions are explicit.
- Existing public tools remain protected from unnecessary changes.

## Phase 1: Supabase Auth + Dashboard Shell
Goal: add login/signup and a private dashboard foundation.

Deliverables:

- Supabase project setup instructions.
- Environment variable plan.
- Install and configure `@supabase/ssr` for Next.js App Router auth/session handling.
- Server-side Supabase client.
- Browser Supabase client if needed for interactive auth UI.
- Migration-first database setup plan using Supabase migrations or checked-in SQL scripts.
- Login/signup pages.
- Logout flow.
- Protected dashboard shell.
- Profile creation flow.

Exit criteria:

- Anonymous users can still use public tools.
- Logged-in users can reach `/dashboard`.
- Logged-out users are redirected from protected dashboard routes.
- API keys remain server-side.

## Phase 2: Documents CRUD
Goal: let users create and manage text or Markdown documents.

Deliverables:

- `documents` table and RLS.
- Repo-managed migration or SQL script for the documents schema.
- Document list page.
- Document create page.
- Document edit page.
- Create, read, update, delete API routes or server actions.
- Character count display.
- Vectorization status display, initially `not_vectorized`.

Exit criteria:

- Users can only see and edit their own documents.
- Document length is validated.
- No PDF or DOCX support yet.

## Phase 3: Usage Limits
Goal: enforce dynamic free plan limits from the database.

Deliverables:

- `plan_limits` table.
- `usage_events` table.
- Repo-managed migration or SQL script for limits and usage tables.
- Quota helper functions.
- Usage summary API.
- Dashboard usage display.
- Tests for quota calculations.

Exit criteria:

- Limits are read from `plan_limits`.
- Document count and monthly usage checks work.
- Errors show remaining quota and reset period when useful.

## Phase 4: Vectorization
Goal: convert user documents into private searchable chunks.

Deliverables:

- Embedding model and vector dimension decision.
- `document_chunks` table with vector support.
- Repo-managed migration or SQL script for `pgvector`, vector columns, indexes, and match RPC.
- Optional `document_vector_jobs` table if progress tracking and retries are needed.
- Chunking logic for text/Markdown.
- Vectorization API route.
- OpenRouter embedding call from server only.
- Document vector status transitions.
- Chunk count enforcement.
- Usage event recording.

Exit criteria:

- Embedding dimension is selected before vector storage is implemented.
- The implementation documents that changing embedding models may require re-vectorizing documents.
- User can vectorize a saved document.
- Chunks are stored with `user_id`.
- Vector search cannot return another user's chunks.
- Failed vectorization shows a useful status and error.

## Phase 5: RAG Chat API
Goal: answer questions using user-owned chunks.

Deliverables:

- RAG chat request validation.
- Question embedding.
- User-filtered vector retrieval.
- Prompt builder with retrieved context.
- OpenRouter LLM call from server only.
- Typed answer response with `answer`, `sources`, `usage`, and `retrievalDetails`.
- Usage event recording.

Exit criteria:

- API answers using only the current user's chunks.
- API returns clear errors for missing auth, no chunks, exhausted quota, and provider failures.
- `retrievalDetails` are source/search diagnostics, not model chain-of-thought.
- API does not stream in v1 unless a later decision changes scope.

## Phase 6: Dashboard RAG Chat UI
Goal: add a logged-in chat experience for personal knowledge bases.

Deliverables:

- `/dashboard/chat` page.
- Message composer.
- Answer display.
- Source cards.
- Retrieval details panel.
- Remaining usage indicator.
- Empty state for users without vectorized documents.

Exit criteria:

- User can ask questions and see cited answers.
- UI stays mobile-friendly.
- UI shows sources and retrieval details without exposing hidden chain-of-thought.

## Phase 7: Upgrade Global Chatbox
Goal: adapt the global chatbox for anonymous and logged-in modes.

Deliverables:

- Auth-aware chatbox behavior.
- Anonymous public assistant remains available when enabled.
- Public chat can remain disabled by default if abuse or cost risk is high.
- Separate public-chat rate limits from authenticated RAG quotas.
- Logged-in users can access personal RAG assistant or be routed to dashboard chat.
- Clear mode labels.

Exit criteria:

- Anonymous users do not access private RAG.
- Logged-in RAG mode uses authenticated API routes.
- Public chat and authenticated RAG chat do not share quota accounting.
- Public tools and pages remain unaffected.

## Phase 8: File Upload Support
Goal: expand beyond text/Markdown only after v1 is stable.

Deliverables:

- Storage strategy.
- File upload limits.
- PDF text extraction.
- DOCX text extraction.
- File processing status.
- Additional security review.

Exit criteria:

- Uploads are safe, limited, and private.
- Text extraction failures are handled clearly.
- Existing text/Markdown workflow remains stable.

## Deferred Until After V1
- Payments.
- Team workspaces.
- Shared knowledge bases.
- Public document sharing.
- Advanced admin console.
- Fine-tuning.
- Browser-side provider calls.
