# Phase 3 Usage Limits QA Checklist

## Database Setup
- [ ] `profiles` table exists.
- [ ] `plan_limits` table exists.
- [ ] `usage_events` table exists.
- [ ] RLS is enabled on `profiles`.
- [ ] RLS is enabled on `plan_limits`.
- [ ] RLS is enabled on `usage_events`.
- [ ] `free` plan row exists in `plan_limits`.
- [ ] `free` plan values match the Phase 3 spec.
- [ ] Profile creation trigger exists on `auth.users`.
- [ ] Existing users are backfilled into `profiles`.

## Profile And Plan Resolution
- [ ] New signup creates a `profiles` row.
- [ ] Existing logged-in user has or receives a `profiles` row.
- [ ] Default `plan_key` is `free`.
- [ ] App reads plan limits from `plan_limits`, not hardcoded constants.
- [ ] Missing or inactive plan shows a clear server-side error.
- [ ] Browser-accessible code cannot change `plan_key`.

## Documents CRUD Regression
- [ ] Logged-in user can still open `/dashboard/documents`.
- [ ] Logged-in user can create a document under the database document length limit.
- [ ] Logged-in user cannot create a document over `plan_limits.max_document_characters`.
- [ ] Logged-in user cannot create more than `plan_limits.max_saved_documents`.
- [ ] Logged-in user can still edit an owned document.
- [ ] Editing content keeps `character_count = content.length`.
- [ ] Editing content resets vector metadata to `not_vectorized`.
- [ ] Logged-in user can still delete an owned document.
- [ ] Empty documents state still works.

## Usage Dashboard
- [ ] Logged-in user can open `/dashboard/usage` or the implemented usage card.
- [ ] Current plan is shown.
- [ ] Saved document count is shown.
- [ ] Remaining document slots are shown.
- [ ] Max document characters are shown.
- [ ] Monthly RAG message limit is shown as future-facing.
- [ ] Monthly vectorize job limit is shown as future-facing.
- [ ] Chunk limits are shown as future-facing.
- [ ] Usage UI is mobile-friendly.

## Security
- [ ] Logged-out users cannot access `/dashboard/usage`.
- [ ] Logged-out users cannot access document dashboard routes.
- [ ] User A cannot select User B's profile through Supabase client requests.
- [ ] User A cannot select User B's usage events through Supabase client requests.
- [ ] User-owned writes derive `user_id` from the Supabase auth session.
- [ ] No service role key is exposed to the browser.
- [ ] No auth tokens, secrets, full document content, or sensitive metadata are logged.

## Scope Boundaries
- [ ] No vectorization UI or API was added.
- [ ] No `document_chunks` table was added.
- [ ] No RAG chat API or dashboard chat was added.
- [ ] No payment behavior was added.
- [ ] No teams/workspaces behavior was added.
- [ ] Public tools are still accessible without login.
- [ ] Blog pages are still accessible without login.
- [ ] Sitemap and robots still build.
- [ ] AdSense meta/script setup is unchanged.

## Verification Commands
- [ ] `npm run test:run`
- [ ] `npm run lint`
- [ ] `npm run build`
