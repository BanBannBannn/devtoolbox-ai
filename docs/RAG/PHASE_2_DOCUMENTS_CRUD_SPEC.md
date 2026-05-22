# Phase 2 Documents CRUD Spec

## Goal
Allow logged-in users to create, view, edit, delete, and list their own text or Markdown documents in the dashboard.

Phase 2 adds private document management only. It does not add vectorization, document chunks, RAG chat, file upload, PDF/DOCX parsing, dynamic plan limits, payments, or teams.

## User Outcomes
- A logged-in user can open `/dashboard/documents`.
- A logged-in user can see an empty state when they have no documents.
- A logged-in user can create a text or Markdown document.
- A logged-in user can view and edit their own document.
- A logged-in user can delete their own document.
- A logged-in user can see character count and vector status.
- A logged-out user cannot access document dashboard routes.
- Public tools and blog pages remain accessible without login.

## Routes
Protected dashboard routes:

- `/dashboard/documents`: list current user's documents.
- `/dashboard/documents/new`: create a new document.
- `/dashboard/documents/[id]`: view and edit one owned document.

All routes must require Supabase auth. Logged-out users should redirect to `/login`.

## Data Model
Create a `documents` table in Supabase Postgres.

Fields:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `title text`
- `content text`
- `content_type text default 'markdown'`
- `character_count integer`
- `vector_status text default 'not_vectorized'`
- `vectorized_at timestamptz nullable`
- `last_vectorize_error text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

Phase 2 should use only text and Markdown content. `content_type` should default to `markdown`.

Suggested vector status values:

- `not_vectorized`
- `vectorizing`
- `vectorized`
- `failed`

In Phase 2, new or edited documents should normally have `vector_status = 'not_vectorized'`, `vectorized_at = null`, and `last_vectorize_error = null`.

## Security And Ownership
- Enable Row Level Security on `documents`.
- Users can only select, insert, update, and delete documents where `user_id = auth.uid()`.
- API routes or server actions must derive `user_id` from the authenticated Supabase session.
- Never trust `user_id` from request bodies, route params, query params, hidden inputs, or client state.
- Do not log full document content in production.
- Do not expose service role keys.
- Do not add a browser-side privileged client.

## UI Requirements
Documents list page:

- Page title and short intro.
- New document action.
- List of owned documents.
- Empty state when no documents exist.
- Each list item should show title, updated date, character count, and vector status badge.
- Links to edit/view owned documents.

New document page:

- Title input.
- Content textarea for Markdown/text.
- Character count display.
- Save action.
- Cancel/back link.
- Clear validation messages for required title/content and max length.

Edit document page:

- Load only the owned document.
- Title input.
- Content textarea.
- Character count display.
- Vector status badge.
- Save action.
- Delete action with confirmation.
- Clear save/delete error messages.
- Back link to documents list.

## Temporary Limits
Use the free plan concept from `RAG_LIMITS.md`.

Until Phase 3 adds dynamic `plan_limits`, Phase 2 may use temporary constants:

- `TEMP_MAX_DOCUMENT_CHARACTERS = 20000`
- Optional `TEMP_MAX_SAVED_DOCUMENTS = 10`

The implementation should isolate temporary constants in one place so Phase 3 can replace them with database-driven limits.

## Validation
- Title should be required.
- Content should be required.
- Content length should not exceed `20,000` characters in Phase 2.
- Character count should be computed server-side before save.
- Client-side character count is useful for UX but must not be trusted for enforcement.
- On edit, if content changes, reset vector metadata to the Phase 2 default state.

## Out Of Scope
- Vectorization.
- `document_chunks` table.
- `document_vector_jobs` table.
- Embeddings.
- RAG chat.
- File uploads.
- PDF parsing.
- DOCX parsing.
- Public document sharing.
- Teams/workspaces.
- Payments.
- Dynamic `plan_limits`.
- OpenRouter changes.

## Acceptance Criteria
- `documents` table exists with RLS enabled.
- Logged-in users can create, list, view, edit, and delete their own documents.
- Logged-out users cannot access document pages.
- A user cannot access another user's document.
- Character count is accurate after create and update.
- Content over `20,000` characters is rejected.
- Vector status badge displays `not_vectorized` for Phase 2 documents.
- Public tools remain accessible without login.
- No document chunks, vectorization, or RAG chat behavior is implemented.
