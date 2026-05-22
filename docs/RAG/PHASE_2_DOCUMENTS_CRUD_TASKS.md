# Phase 2 Documents CRUD Tasks

## Scope Reminder
Build private text/Markdown document CRUD only.

Do not implement:

- Vectorization.
- `document_chunks`.
- RAG chat.
- File uploads.
- PDF/DOCX parsing.
- Dynamic `plan_limits`.
- Service role usage.
- Public tool changes.

## 1. Database SQL
- Review `docs/RAG/PHASE_2_DOCUMENTS_CRUD_SQL.md`.
- Apply the SQL through Supabase SQL Editor or convert it into a repo-managed Supabase migration.
- Confirm `documents` table exists.
- Confirm RLS is enabled.
- Confirm select/insert/update/delete policies are active.
- Confirm indexes exist.

## 2. Types And Constants
- Create a typed document model or Supabase row type for implementation.
- Add temporary constants in one place:
  - `TEMP_MAX_DOCUMENT_CHARACTERS = 20000`
  - optional `TEMP_MAX_SAVED_DOCUMENTS = 10`
- Document that Phase 3 replaces temporary constants with dynamic `plan_limits`.

## 3. Server-Side Data Access
- Create server-side helpers, server actions, or API routes for documents.
- Read the authenticated user from Supabase session.
- Never accept `user_id` from the client.
- Compute `character_count` server-side.
- Reset vector metadata on content updates:
  - `vector_status = 'not_vectorized'`
  - `vectorized_at = null`
  - `last_vectorize_error = null`
- Return clear user-safe errors.

Suggested operations:

- `listDocumentsForCurrentUser`
- `getDocumentForCurrentUser(id)`
- `createDocument`
- `updateDocument`
- `deleteDocument`

## 4. Dashboard Navigation
- Update the dashboard shell/card for Documents to link to `/dashboard/documents`.
- Keep Usage, RAG Chat, and Settings as later-phase placeholders.
- Do not add nav links that imply vectorization or RAG chat are ready.

## 5. Documents List Page
- Create `/dashboard/documents`.
- Protect route with server-side auth.
- Show title, intro, and New Document action.
- Query only current user's documents.
- Show empty state when no documents exist.
- Show title, updated date, character count, and vector status badge for each document.
- Link each document to `/dashboard/documents/[id]`.

## 6. New Document Page
- Create `/dashboard/documents/new`.
- Protect route with server-side auth.
- Add title input.
- Add content textarea.
- Add character count display.
- Add Save action.
- Add Cancel/back link.
- Enforce temporary max length server-side.
- Show clear validation and save errors.

## 7. Edit Document Page
- Create `/dashboard/documents/[id]`.
- Protect route with server-side auth.
- Load only owned document.
- Return not found or redirect if document is missing or not owned.
- Add editable title and content.
- Show character count and vector status badge.
- Add Save action.
- Add Delete action with confirmation.
- Show save/delete errors.

## 8. Tests
Add tests for extracted pure logic if created:

- Character count helper.
- Document validation helper.
- Vector status reset helper.
- Temporary limit constants.

Manual QA is required for Supabase RLS and cross-user access.

## 9. Checks
Run:

- `npm run test:run`
- `npm run lint`
- `npm run build`

## 10. Work Log
- Update `docs/WORK_LOG.md`.
- Note that Phase 2 added Documents CRUD only.
- Explicitly note that vectorization, document chunks, RAG chat, file upload, and dynamic plan limits remain future phases.

## Stop Conditions
Stop and reassess if:

- Implementing documents requires service role access.
- A route or action must trust client-provided `user_id`.
- RLS blocks legitimate current-user access after policies are applied.
- Public tools become protected by mistake.
- The work starts drifting into vectorization, RAG chat, file upload, or dynamic limits.
