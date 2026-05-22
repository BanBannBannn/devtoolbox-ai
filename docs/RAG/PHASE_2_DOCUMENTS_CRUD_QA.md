# Phase 2 Documents CRUD QA

## Preflight
- [ ] Phase 1 auth still works.
- [ ] Supabase env variables are configured.
- [ ] `documents` SQL has been applied.
- [ ] RLS is enabled on `documents`.
- [ ] No service role key is used in browser code.
- [ ] Public tools still load while logged out.

## Logged-Out Access
- [ ] Logged-out user visiting `/dashboard/documents` redirects to `/login`.
- [ ] Logged-out user visiting `/dashboard/documents/new` redirects to `/login`.
- [ ] Logged-out user visiting `/dashboard/documents/[id]` redirects to `/login`.

## Documents List
- [ ] Logged-in user can open `/dashboard/documents`.
- [ ] Empty state appears when the user has no documents.
- [ ] New Document action is visible.
- [ ] Existing documents are listed.
- [ ] Each document shows title.
- [ ] Each document shows updated date.
- [ ] Each document shows character count.
- [ ] Each document shows vector status badge.
- [ ] Documents link to their edit page.

## Create Document
- [ ] Logged-in user can open `/dashboard/documents/new`.
- [ ] Title input is visible and labeled.
- [ ] Content textarea is visible and labeled.
- [ ] Character count updates in the UI.
- [ ] Empty title is rejected.
- [ ] Empty content is rejected.
- [ ] Content over `20,000` characters is rejected.
- [ ] Successful create redirects to the document edit page or documents list.
- [ ] New document has `vector_status = 'not_vectorized'`.
- [ ] New document has accurate `character_count`.

## Edit Own Document
- [ ] Logged-in user can open their own document.
- [ ] Existing title and content load correctly.
- [ ] User can update title.
- [ ] User can update content.
- [ ] Character count updates after save.
- [ ] Content over `20,000` characters is rejected.
- [ ] Editing content resets vector metadata to Phase 2 defaults.
- [ ] Save errors are clear and user-safe.

## Delete Own Document
- [ ] Logged-in user can delete their own document.
- [ ] Delete requires confirmation.
- [ ] Successful delete removes the document from the list.
- [ ] Delete errors are clear and user-safe.

## Cross-User Security
- [ ] User A cannot see User B's documents in the list.
- [ ] User A cannot open User B's document detail route.
- [ ] User A cannot update User B's document.
- [ ] User A cannot delete User B's document.
- [ ] Server actions or API routes do not accept trusted `user_id` from client input.
- [ ] RLS policies enforce ownership even if a route bug occurs.

## Public Regression
- [ ] `/` loads while logged out.
- [ ] `/tools` loads while logged out.
- [ ] Available tool pages load while logged out.
- [ ] `/blog` loads while logged out.
- [ ] Blog post pages load while logged out.
- [ ] `/sitemap.xml` works.
- [ ] `/robots.txt` works.
- [ ] AdSense meta/script setup is unchanged.

## Mobile Layout
- [ ] `/dashboard/documents` is usable on mobile.
- [ ] `/dashboard/documents/new` is usable on mobile.
- [ ] `/dashboard/documents/[id]` is usable on mobile.
- [ ] Textareas do not overflow.
- [ ] Buttons remain easy to tap.
- [ ] Error messages do not overlap controls.
- [ ] Delete confirmation is usable on mobile.

## Checks
- [ ] `npm run test:run` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

## Regression Guardrails
- [ ] No `document_chunks` table was created.
- [ ] No vectorization API was added.
- [ ] No RAG chat was added.
- [ ] No file upload was added.
- [ ] No PDF/DOCX parsing was added.
- [ ] No dynamic `plan_limits` implementation was added.
