# Phase 3 Usage Limits Spec

## Goal
Add dynamic free-plan usage limits using Supabase Postgres tables so document creation, future vectorization, and future RAG chat can enforce quotas without hardcoded limits in app logic.

Phase 3 replaces the Phase 2 temporary document limit constants with database-driven plan limits. It does not add vectorization, document chunks, RAG chat, payments, teams, or workspaces.

## User Outcomes
- A logged-in user has a profile with a default `free` plan.
- A logged-in user can see relevant usage limits and remaining document slots in the dashboard.
- Documents CRUD continues to work, but max document length and max saved documents come from `plan_limits`.
- Public tools, blog pages, sitemap, robots, and AdSense setup continue to work without login.
- Future phases can reuse the same limits and usage event tables for vectorization and RAG chat.

## Scope
In scope:

- Add `profiles`, `plan_limits`, and `usage_events` SQL documentation.
- Add helper planning for reading the current user's profile and plan limits.
- Add helper planning for monthly usage calculations.
- Update Documents CRUD in the implementation phase to use `plan_limits.max_document_characters` and `plan_limits.max_saved_documents`.
- Add a dashboard usage page or usage card that shows current free-plan limits and remaining document capacity.

Out of scope:

- Vectorization.
- `document_chunks`.
- RAG chat.
- Payments.
- Teams/workspaces.
- File upload.
- PDF/DOCX parsing.
- Any public tool behavior changes.

## Data Model
Phase 3 introduces three tables.

### `profiles`
Stores the authenticated user's application profile and plan assignment.

Fields:

- `id uuid primary key references auth.users(id) on delete cascade`
- `email text`
- `display_name text`
- `plan_key text default 'free'`
- `created_at timestamptz`
- `updated_at timestamptz`

Phase 3 should use `free` as the default `plan_key`.

### `plan_limits`
Stores quota values by plan. App logic should read this table instead of hardcoding plan limits.

Fields:

- `id uuid primary key`
- `plan_key text unique`
- `monthly_rag_messages integer`
- `monthly_vectorize_jobs integer`
- `max_saved_documents integer`
- `max_document_characters integer`
- `max_chunks_per_document integer`
- `max_chunks_total integer`
- `retrieved_chunks_per_answer integer`
- `max_output_tokens integer`
- `is_active boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

Initial `free` plan values:

- `monthly_rag_messages`: `30`
- `monthly_vectorize_jobs`: `3`
- `max_saved_documents`: `10`
- `max_document_characters`: `20000`
- `max_chunks_per_document`: `50`
- `max_chunks_total`: `100`
- `retrieved_chunks_per_answer`: `3`
- `max_output_tokens`: `800`

### `usage_events`
Stores countable usage events for monthly quota calculations and future usage reporting.

Fields:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `event_type text`
- `quantity integer default 1`
- `period_start date`
- `metadata jsonb`
- `created_at timestamptz`

Event types:

- `rag_message`
- `vectorize_job`
- `embedding_tokens`
- `llm_output_tokens`
- `document_created`
- `chunk_created`

## Profile Creation Strategy
Phase 3 should use a Supabase auth trigger as the primary profile creation strategy. When a new auth user is created, the trigger inserts a matching `profiles` row with `plan_key = 'free'`.

For users created before the trigger exists, Phase 3 SQL should include a backfill statement. The implementation may also add an idempotent server-side profile check when a logged-in user opens the dashboard, but app code must not trust client-provided user IDs.

## Limits And Enforcement
Limits must be resolved from the current user's profile and active plan:

1. Read the authenticated user from the Supabase session.
2. Load the user's profile by `profiles.id = auth.uid()`.
3. Load the active plan by `profiles.plan_key = plan_limits.plan_key`.
4. Use returned plan fields for validation and display.

Documents CRUD should enforce:

- `content.length <= plan_limits.max_document_characters`
- current owned document count `< plan_limits.max_saved_documents` before creating a new document

The app may still keep tiny fallback values for defensive error handling when a database query fails, but those fallbacks must not become the normal plan source.

## Monthly Periods
Monthly usage should use a UTC month start date:

- Example: any time in May 2026 maps to `2026-05-01`.
- Store that date in `usage_events.period_start`.
- Count monthly usage with `user_id`, `event_type`, and `period_start`.

## Dashboard Usage UI
Phase 3 should add either `/dashboard/usage` or a dashboard usage card that shows:

- Current plan key.
- Max saved documents.
- Current saved documents.
- Remaining document slots.
- Max document characters.
- Future RAG messages per month.
- Future vectorize jobs per month.
- Current monthly usage where events exist.

The UI should clearly label vectorization and RAG limits as future-facing until those features are implemented.

## Security
- RLS must be enabled on user-owned tables.
- Users can only select their own `profiles` and `usage_events` rows.
- Users must not be able to change their own `plan_key` from the browser.
- `plan_limits` may be readable by authenticated users because it contains non-secret quota values.
- API routes and server actions must derive `user_id` from Supabase auth session data.
- Never trust `user_id` from request bodies, hidden inputs, route params, or client state.
- Do not log auth tokens, secrets, full document content, or sensitive usage metadata.

## Acceptance Criteria
- `free` plan row exists in `plan_limits`.
- New users get a `profiles` row with `plan_key = 'free'`.
- Existing users can be backfilled into `profiles`.
- Documents CRUD reads max document length from `plan_limits`.
- Documents CRUD enforces max saved documents from `plan_limits`.
- Dashboard shows current limits and remaining document slots.
- Public tools remain accessible without login.
- Logged-out users cannot access dashboard usage routes.
- RLS prevents cross-user access to profiles and usage events.
- No vectorization, document chunks, RAG chat, payments, teams, or workspaces are implemented in Phase 3.
