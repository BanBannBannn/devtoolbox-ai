# Work Log

## 2026-05-26

### Phase 5A RAG response model-name privacy patch
- Removed exact RAG embedding and LLM model names from client-facing `POST /api/rag/chat` success responses.
- Removed `usage.llmModel`, `usage.embeddingModel`, and `retrievalDetails.models` from the public response contract.
- Kept `RAG_LLM_MODEL` and `RAG_EMBEDDING_MODEL` in server-side provider/config behavior.
- Updated pure response helper tests to verify usage and retrieval details do not expose model names.
- Updated Phase 5 docs and RAG security notes to clarify that model names stay server-side implementation details by default.
- Kept the patch scoped to response shaping and documentation; no OpenRouter behavior, retrieval logic, dashboard UI, global chatbox, streaming, SQL, dependencies, or public tools were changed.

### Phase 5A RAG Chat API route
- Added `POST /api/rag/chat` for authenticated RAG questions against the current user's vectorized document chunks.
- Added pure request validation for required messages, empty messages, `2000` character max length, and optional UUID `sessionId`.
- Added pure prompt/source helpers for short snippets, source mapping, retrieval details, and untrusted-context prompt construction.
- Added a server-side OpenRouter RAG LLM wrapper using `RAG_LLM_MODEL`, `OPENROUTER_API_KEY`, `NEXT_PUBLIC_SITE_URL`, `temperature: 0.3`, and `plan_limits.max_output_tokens`.
- Added RAG chat orchestration that authenticates through Supabase, loads/creates the profile, loads active plan limits, enforces `monthly_rag_messages`, records `rag_message` usage after validation/quota checks and before provider work, embeds the question with the Phase 4 embedding helper, retrieves chunks through `match_document_chunks`, and returns `answer`, `sources`, `usage`, and `retrievalDetails`.
- The API uses the normal authenticated Supabase server client for retrieval RPC because the RPC uses `auth.uid()` internally.
- No-chunk results return `success: true` with a helpful answer, empty sources, and retrieval diagnostics.
- Added pure Vitest coverage for validation, snippet generation, source mapping, retrieval details shaping, and prompt safety wording.
- Kept Phase 5A scoped to the server API only; no dashboard chat UI, global chatbox changes, streaming, chat history persistence, file upload, SQL execution, dependency changes, or public tool changes were added.

## 2026-05-25

### Phase 5 match RPC SQL finalization
- Reviewed and finalized the Phase 5 `match_document_chunks` RPC SQL before Supabase execution.
- Kept the safest Option A design: `public.match_document_chunks(query_embedding vector(2048), match_count integer)` uses `auth.uid()` internally and does not accept a client-provided user ID.
- Confirmed cosine distance with `embedding <=> query_embedding` and `vector(2048)`.
- Added safe `match_count` clamping with a default of `3` and hard cap of `20`.
- Added explicit execute permission hardening by revoking from `public` and `anon`, then granting only to `authenticated`.
- Kept the work documentation-only; no app code, dashboard UI, runtime routes, SQL execution, or public tools were changed.

### Phase 5 RAG Chat API planning
- Added Phase 5 RAG Chat API planning docs under `docs/RAG`.
- Documented `POST /api/rag/chat` for authenticated user-owned document retrieval and OpenRouter answer generation.
- Added the response contract with `answer`, `sources`, `usage`, and `retrievalDetails`.
- Clarified that `retrievalDetails` are retrieval diagnostics, not model chain-of-thought.
- Documented query validation, question embedding with the Phase 4 embedding model, user-filtered vector retrieval, prompt injection protection, RAG message quota enforcement, max retrieved chunks, max output tokens, safe logging, and secret handling.
- Added a Phase 5 task breakdown for SQL review, validation helpers, LLM provider wrapper, prompt builder, retrieval helpers, usage helpers, API route implementation, prompt injection review, tests, and manual QA.
- Added a Phase 5 QA checklist covering auth, ownership, validation, embedding, retrieval, LLM answers, prompt injection, usage limits, retrieval details, secrets/logging, and public route regression.
- Added a reviewed `match_document_chunks` SQL plan using `vector(2048)`, cosine distance, and `auth.uid()` internally as the recommended Option A.
- Kept the work documentation-only; no runtime code, app routes, SQL execution, dependencies, Phase 4 behavior, public tools, or UI were changed.

### Phase 4 chunking strategy improvement
- Upgraded `chunkTextForEmbedding` from simple fixed-window splitting to deterministic markdown/paragraph-aware chunking.
- Updated the default chunk size from `1000` to `1200` characters while keeping `150` characters of overlap.
- The chunker now preserves logical blocks where possible, including fenced code blocks, markdown headings with following content, paragraphs, and consecutive list items.
- Oversized single blocks still fall back to deterministic character splitting with overlap.
- Kept the public chunking API compatible, including `chunkIndex`, `content`, `characterCount`, `tokenEstimate`, `sourceTitle`, and stable `sourceAnchor` values like `chunk-0`.
- Updated vectorization to use the chunker defaults so future vectorization uses the improved chunk boundaries.
- Expanded chunking tests for markdown block behavior, overlap behavior, validation, stable indexes, stable anchors, token estimates, and empty chunk avoidance.
- Updated Phase 4 docs to describe the production v1 chunking strategy and noted that already-vectorized documents should be re-vectorized to use the improved chunking.

### Phase 4 document vectorization closeout
- Documented completed manual QA for Phase 4 Document Vectorization.
- Confirmed logged-in document creation/opening, visible privacy warning, internal vectorization API call, successful `vectorized` status update, Supabase `document_chunks` creation, re-vectorization chunk replacement, `vectorize_job` usage tracking, no API key exposure in API responses, and public tools remaining available without login.
- Marked Phase 4 as ready to close in the Phase 4 QA checklist.
- Kept the work documentation-only; no app code, vectorization behavior, SQL, RAG chat, new features, public tools, file upload, streaming, or payment behavior were changed.

### Phase 4D dashboard vectorization UI
- Added a dashboard document vectorization control for `/dashboard/documents/[id]`.
- Added `components/rag/vectorize-document-button.tsx` as a client component that calls only the internal `POST /api/documents/[id]/vectorize` route.
- The document detail page now shows the current vector status near the vectorize action and keeps the existing edit/delete flows intact.
- Added button states for first-time vectorization, re-vectorization, retry after failure, and in-progress loading.
- Added success and failure messages using the API response, and refreshes the page after successful vectorization so the server-rendered status updates.
- Added the visible OpenRouter free-model privacy warning before users click vectorize.
- Kept Phase 4D scoped to dashboard UI only; no API behavior changes, RAG chat, file upload, streaming, payment behavior, public tool changes, API key exposure, or service-role browser exposure were added.

### Phase 4C document vectorization API route
- Added `POST /api/documents/[id]/vectorize` for authenticated document vectorization.
- Added server-side vectorization orchestration in `lib/rag/vectorize-document.ts`.
- The route authenticates with the normal Supabase server client, loads only owned documents, ensures profile/plan limits, checks monthly vectorize quota, checks document length, chunks content, checks replacement chunk totals, updates vector status, generates embeddings, replaces old chunks, records `vectorize_job`, and returns typed JSON.
- Added a Supabase service-role server client for `document_chunks` writes/deletes only after normal auth and ownership checks.
- Added `SUPABASE_SERVICE_ROLE_KEY` to `.env.example` as a server-only variable.
- Added pure helper tests for replacement chunk totals, vectorize quota checks, max chunk total checks, and user-safe error mapping.
- Kept Phase 4C scoped to the API/data path only; no dashboard UI, RAG chat, public tool changes, SQL changes, or service-role browser exposure were added.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Phase 4B OpenRouter embedding provider wrapper
- Implemented a server-side OpenRouter embedding wrapper in `lib/rag/embedding-provider.ts`.
- Added `getRagEmbeddingConfig` to validate `OPENROUTER_API_KEY`, `RAG_EMBEDDING_MODEL`, `RAG_EMBEDDING_DIMENSION`, and optional `NEXT_PUBLIC_SITE_URL`.
- Added `generateEmbedding` to call the OpenRouter embeddings endpoint with text input, request float embeddings, validate response shape, validate numeric vectors, and enforce the configured embedding dimension.
- Returned typed success/error results with user-safe errors and no raw provider payloads or API keys.
- Added mocked Vitest coverage for missing config, empty input, successful provider responses, wrong dimensions, invalid response shape, non-OK provider responses, and API key redaction from errors.
- Kept Phase 4B scoped to the provider wrapper only; no vectorization API route, Supabase writes, `document_chunks` inserts, dashboard UI, RAG chat, public tool changes, service role key, or direct NVIDIA API calls were added.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Phase 4A text chunking logic
- Implemented pure text chunking logic for Phase 4A in `lib/rag/chunk-text.ts`.
- Added typed `ChunkTextInput`, `TextChunk`, and `ChunkTextResult` shapes.
- Added `chunkTextForEmbedding` with line ending normalization, outer whitespace trimming, default `1000` character chunks, default `150` character overlap, stable source anchors, token estimates, max chunk enforcement, and validation for empty text and invalid chunk settings.
- Added Vitest coverage for short text, long text, overlap preservation, empty text rejection, empty chunk avoidance, max chunk enforcement, chunk indexes, source anchors, token estimates, and invalid overlap rejection.
- Kept Phase 4A scoped to pure logic only; no OpenRouter calls, Supabase calls, API routes, vectorization, dashboard UI, backend changes, service role key, or public tool changes were added.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

## 2026-05-22

### Phase 4 confirmed embedding dimension docs
- Updated Phase 4 vectorization docs now that the OpenRouter embedding dimension is confirmed as `2048`.
- Updated `.env.example` to set `RAG_EMBEDDING_DIMENSION=2048`.
- Updated the Phase 4 SQL planning template to use valid pgvector syntax: `embedding vector(2048)`.
- Updated the future RPC placeholder to use `query_embedding vector(2048)`.
- Set cosine distance as the v1 vector distance metric in the Phase 4 docs.
- Removed placeholder wording around `<2048>` while keeping the privacy warning for the free OpenRouter model and the note that changing embedding models may require re-vectorizing documents.
- Kept the work documentation/config-only; no vectorization implementation, API routes, SQL execution, `document_chunks` table creation, public tool changes, or provider calls were added.

### Phase 4 embedding dimension preflight utility
- Added a local-only OpenRouter embedding dimension preflight script at `scripts/check-embedding-dimension.mjs`.
- Added `npm run rag:check-embedding-dimension` to call the OpenRouter embeddings endpoint with a tiny non-sensitive test input.
- The script reads `OPENROUTER_API_KEY` and `RAG_EMBEDDING_MODEL`, defaults to `nvidia/llama-nemotron-embed-vl-1b-v2:free`, prints the selected model, embedding dimension, and first 5 embedding values only.
- The script avoids printing the API key, full embedding, private document content, or user content.
- Updated `.env.example` with `RAG_EMBEDDING_MODEL`, `RAG_LLM_MODEL`, and `RAG_EMBEDDING_DIMENSION`.
- Kept the work scoped to a local/server-only preflight utility; no API routes, SQL execution, `document_chunks` table, vectorization, public tool changes, or dependencies were added.

### Phase 4 OpenRouter model configuration docs
- Updated Phase 4 vectorization docs with the selected OpenRouter embedding model `nvidia/llama-nemotron-embed-vl-1b-v2:free`.
- Documented the later RAG chat LLM model `nvidia/nemotron-3-super-120b-a12b:free`.
- Added required environment variables: `OPENROUTER_API_KEY`, `RAG_EMBEDDING_MODEL`, `RAG_LLM_MODEL`, and `RAG_EMBEDDING_DIMENSION`.
- Clarified that `OPENROUTER_API_KEY` is server-side only, must not use `NEXT_PUBLIC_OPENROUTER_API_KEY`, and all embedding/LLM calls must go through server-side Next.js API routes.
- Clarified that model names should come from env first, may later move to non-secret `app_config`, and should not be hardcoded directly in API logic.
- Kept embedding dimension as the remaining blocker; implementation must run a preflight embedding request, inspect `embedding.length`, set `RAG_EMBEDDING_DIMENSION`, and update SQL before creating `document_chunks`.
- Added free-model privacy warnings for OpenRouter free endpoints and QA checks for missing env vars, client bundle key exposure, and privacy-warning display.
- Kept the work documentation-only; no API routes, `document_chunks` table, SQL execution, vectorization logic, public tool changes, dependencies, or provider calls were added.

### Phase 4 document vectorization planning
- Added Phase 4 Document Vectorization planning docs under `docs/RAG`.
- Documented the goal of vectorizing saved text/Markdown documents into private Supabase `pgvector` chunks for future RAG chat.
- Added a Phase 4 spec covering the blocking embedding provider/model/dimension decision, vectorization flow, chunking requirements, API response contract, document status transitions, quota enforcement, usage event policy, and security boundaries.
- Added an implementation task breakdown for embedding model selection, SQL setup, chunking logic, server-only embedding provider wrapper, vectorization data access, `POST /api/documents/[id]/vectorize`, dashboard document UI updates, tests, and QA.
- Added a QA checklist covering embedding decisions, database setup, auth and ownership, quota enforcement, chunking, status transitions, privacy, and scope boundaries.
- Added a SQL template for `pgvector`, `document_chunks`, RLS, indexes, vector index placeholder, and a Phase 5 `match_document_chunks` RPC placeholder.
- Kept the work documentation-only; no app code, API routes, provider calls, vector tables, RAG chat, file upload, PDF/DOCX parsing, payments, teams/workspaces, service role key, public tool changes, or database execution were added.

### Phase 3 usage limits implementation
- Implemented database-driven Phase 3 usage limits for authenticated dashboard users.
- Added server-side usage helpers for profile creation fallback, active plan limit loading, UTC monthly period calculation, saved document count checks, document length checks, and current-period usage summaries.
- Added pure usage calculation tests for period starts, saved document limits, document character limits, and usage event aggregation.
- Added `/dashboard/usage` to show the current plan, document count, RAG message usage, vectorize job usage, document character limit, chunk limits, retrieval limit, and output token limit.
- Updated the dashboard Usage card to link to the new usage page.
- Updated Documents CRUD to create a missing profile server-side, load active `plan_limits`, enforce `max_saved_documents` on create, and enforce `max_document_characters` on create and edit.
- Updated the document form character counter to use the database-loaded document character limit instead of the Phase 2 temporary constant.
- Kept Phase 3 scoped to usage limits only; no vectorization, `document_chunks`, RAG chat, file upload, payments, teams/workspaces, service role key, public tool logic changes, blog changes, sitemap changes, robots changes, or AdSense changes were added.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Phase 3 usage limits planning
- Added Phase 3 Usage Limits planning docs under `docs/RAG`.
- Documented the goal of replacing Phase 2 temporary document limits with database-driven `plan_limits`.
- Added a Phase 3 spec covering `profiles`, `plan_limits`, `usage_events`, default `free` plan behavior, UTC monthly periods, usage dashboard expectations, security boundaries, and acceptance criteria.
- Added an implementation task breakdown for SQL setup, server-side limit helpers, Documents CRUD limit enforcement, usage dashboard UI, tests, and QA.
- Added a QA checklist covering free plan setup, profile creation, plan resolution, document limit enforcement, usage display, dashboard protection, RLS, and public route regression.
- Added copyable Supabase SQL for `profiles`, `plan_limits`, `usage_events`, free plan seed data, auth-trigger profile creation, backfill, RLS policies, and indexes.
- Kept the work documentation-only; no app code, Supabase client changes, API routes, vectorization, document chunks, RAG chat, payments, teams, public tool changes, or database execution were added.

### Phase 2 documents CRUD implementation
- Implemented Phase 2 Documents CRUD for logged-in users.
- Added server-side document types, validation, temporary `20,000` character limit, Supabase data access helpers, and server actions.
- Added `/dashboard/documents`, `/dashboard/documents/new`, and `/dashboard/documents/[id]` routes for listing, creating, viewing, editing, and deleting owned documents.
- Added document UI components for character count, vector status badge, shared create/edit form, and delete confirmation.
- Updated the dashboard Documents card to link to the documents list while Usage, RAG Chat, and Settings remain later-phase placeholders.
- Ensured document writes derive `user_id` from the authenticated Supabase session and always send `character_count = content.length`.
- Reset vector metadata to `not_vectorized`, `vectorized_at = null`, and `last_vectorize_error = null` when content changes.
- Kept Phase 2 scoped to text/Markdown document CRUD only; no vectorization, `document_chunks`, RAG chat, file upload, PDF/DOCX parsing, dynamic `plan_limits`, service role key, tool logic changes, blog changes, sitemap changes, robots changes, or AdSense changes were added.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Phase 2 documents CRUD planning
- Added Phase 2 Documents CRUD planning docs under `docs/RAG`.
- Documented the goal of allowing logged-in users to create, list, view, edit, and delete their own text or Markdown documents.
- Added a Phase 2 spec covering protected dashboard routes, document fields, ownership rules, UI requirements, temporary document length limits, validation, and out-of-scope items.
- Added an implementation task breakdown for Supabase SQL, server-side data access, documents list/new/edit pages, dashboard navigation, tests, checks, and work log updates.
- Added a QA checklist covering logged-out access, create/edit/delete flows, cross-user security, character count, empty state, mobile layout, and public route regressions.
- Added copyable Supabase SQL for the `documents` table, `updated_at` trigger, RLS policies, and indexes.
- Kept the work documentation-only; no app code, database execution, document chunks, vectorization, RAG chat, file upload, dynamic `plan_limits`, or public tool changes were added.

### Header authentication UI polish
- Updated the global header logged-out state to show only one Login button while keeping the existing main navigation links.
- Added a compact circular logged-in user menu in the header instead of showing Dashboard and Sign out directly.
- Added `components/auth/user-menu.tsx` with Google avatar support from Supabase metadata, email initials fallback, and a generic user icon fallback.
- Added a dropdown menu with the signed-in email, Dashboard link, and Sign out action.
- Updated the logout button with a menu variant for the dropdown.
- Kept signup available through `/login` and `/signup`, and did not remove the `/signup` page.
- Kept the work scoped to auth UI only; no Supabase auth logic changes, documents CRUD, vectorization, RAG, tool logic changes, AdSense changes, sitemap changes, robots changes, or blog changes were added.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

## 2026-05-21

### Phase 1 authentication UX polish
- Updated the global header to show Login and Sign up for logged-out users, and Dashboard plus Sign out for logged-in users.
- Added Google OAuth buttons to `/login` and `/signup` using Supabase `signInWithOAuth` with the `google` provider.
- Added `/auth/callback` to exchange OAuth codes through Supabase and redirect safely to `/dashboard`.
- Improved signup copy to explain that email confirmation depends on Supabase project settings and to keep duplicate-email style errors generic.
- Kept email/password login and signup working through Supabase server actions.
- Kept auth limited to public Supabase URL and anon key; no service role key, database tables, documents CRUD, vectorization, RAG chat, public tool logic changes, AdSense changes, sitemap changes, robots changes, or blog changes were added.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Phase 1 Supabase auth dashboard shell
- Implemented Phase 1 Supabase Auth + Dashboard Shell.
- Added `@supabase/ssr` App Router helpers for browser and server Supabase clients using only the public Supabase URL and anon key.
- Added Next.js `proxy.ts` route protection and session refresh for `/dashboard`, `/login`, and `/signup` using the Next 16 Proxy convention.
- Added `/login` and `/signup` pages with email/password Supabase auth forms, user-safe errors, missing-env handling, and links between auth pages.
- Added protected `/dashboard` with server-side user verification, logout, and placeholder cards for Documents, Usage, RAG Chat, and Settings.
- Added a logout server action component that signs out through Supabase and redirects to `/login`.
- Updated `.env.example` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Kept Phase 1 scoped to auth and dashboard shell only; no documents CRUD, vectorization, RAG chat, database tables, service role key, OpenRouter changes, existing tool logic changes, AdSense changes, sitemap changes, robots changes, or blog changes were added.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Phase 1 auth dashboard planning
- Added Phase 1 planning docs for Supabase Auth + Dashboard Shell under `docs/RAG`.
- Documented the goal of adding login, signup, logout, and a protected `/dashboard` while keeping all public tools accessible without login.
- Specified `@supabase/ssr` for Next.js App Router integration and the required public Supabase env variables.
- Documented dashboard placeholder cards for Documents, Usage, RAG Chat, and Settings, with clear later-phase empty states.
- Captured security boundaries: server-side session reads where possible, no trusted client user IDs or emails, no client service role key, and no auth token logging.
- Added task breakdown and QA checklist for signup, login, logout, protected dashboard behavior, public route regression, missing env behavior, and mobile layout.
- Kept the work documentation-only; no Supabase clients, API routes, dashboard pages, dependencies, database tables, vectorization, RAG chat, or existing tool page changes were added.

### RAG planning documentation polish
- Clarified that future Supabase integration should use `@supabase/ssr` for Next.js App Router auth and session handling.
- Clarified that database changes should be migration-first or captured in checked-in SQL scripts.
- Added explicit embedding model and vector dimension decision points before implementing vector storage.
- Documented that changing embedding models may require re-vectorizing documents and tracking chunk embedding models.
- Added an optional future `document_vector_jobs` table for vectorization progress, retries, and provider failure tracking.
- Added a RAG API response contract with `answer`, `sources`, `usage`, and `retrievalDetails`.
- Clarified that anonymous public chat and authenticated RAG chat need separate quota and rate-limit handling.
- Clarified that public chat can remain disabled by default if abuse or cost risk is high.
- Reinforced that retrieval details are source/search diagnostics, not model chain-of-thought.
- Kept the work documentation-only; no Supabase clients, API routes, dashboard pages, dependencies, existing tool pages, or runtime code were added.

### User-based RAG platform planning
- Added planning documentation under `docs/RAG` for evolving DevToolBox AI from a public tools website into a user-based RAG platform.
- Documented the product vision, target users, MVP scope, out-of-scope items, user stories, and success metrics.
- Documented a Supabase-first architecture for auth, database, storage if needed, and vector search, with OpenRouter used server-side for LLM and embedding providers.
- Documented proposed database tables for profiles, documents, document chunks, chat sessions, chat messages, plan limits, usage events, and app config.
- Documented dynamic free-plan limits, quota checking flow, usage event design, and why each limit exists.
- Documented security requirements for API keys, Supabase auth, Row Level Security, document privacy, prompt injection, retrieval details, and hidden chain-of-thought boundaries.
- Documented a phased roadmap from docs through auth, dashboard, documents CRUD, usage limits, vectorization, RAG chat, global chatbox upgrade, and later file uploads.
- Kept the work planning-only; no Supabase client, API routes, dashboard pages, dependencies, existing tool pages, or runtime code were added.

## 2026-05-20

### Markdown blog system and first articles
- Added a markdown-backed blog content system under `content/blog`.
- Added the first five SEO articles: JSON formatting, README generation, AI coding prompts, beginner Git commands, and Unix timestamps.
- Added `lib/blog.ts` to read frontmatter and markdown content from local files.
- Updated `/blog` to list real articles with dates, descriptions, tags, and links.
- Added static blog detail pages at `/blog/[slug]` with metadata, generated static params, and a simple markdown renderer.
- Updated `app/sitemap.ts` to include blog post URLs.
- Kept the implementation static and file-based; no database, CMS, backend, AI API, AdSense placements, or tool logic changes were added.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### SEO metadata routes
- Added `app/sitemap.ts` using the App Router metadata route convention.
- Added `app/robots.ts` using the App Router metadata route convention.
- Sitemap includes the home page, tools page, available tool pages from `lib/tools.ts`, and the blog page.
- Robots allows site crawling and points to `/sitemap.xml`.
- Used `NEXT_PUBLIC_SITE_URL` when available with a fallback to `https://devtoolbox-ai-murex.vercel.app`.
- Kept the work SEO-only; no tool logic or unrelated pages were modified.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Next.js Code Demo Lab live preview comparison upgrade
- Updated the Code Demo Lab docs, tests, data model, and UI so working examples can show real fixed live previews while broken or missing-code examples show simulated error/output panels.
- Added `simulatedError` and optional `livePreviewId` support to lessons.
- Added separate Copy Working Code and Copy Broken Code actions.
- Updated live preview selection to use predefined `livePreviewId` values instead of evaluating lesson code.
- Kept real previews for the counter, props card, conditional toggle, and list rendering lessons, while server/client, route handler, environment variable, `page.tsx`, and `layout.tsx` lessons remain simulated-only.
- Preserved the safety boundary: no user-provided code execution, `eval`, `Function` constructor, Sandpack, backend, database, AI API, or file creation.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Next.js Code Demo Lab comparison learning
- Expanded the Code Demo Lab spec, test cases, and QA checklist with comparison-based learning requirements.
- Added `correctCode`, `brokenCode` or `withoutCode`, `correctOutput`, `brokenOutput`, `whyItWorks`, `whyItBreaks`, and `mentalModel` fields to every lesson.
- Added comparison lessons for `page.tsx` route creation and `layout.tsx` shared wrappers.
- Updated the lab UI to show With it, Without it, and Why it matters sections alongside existing live or simulated previews.
- Updated tests to require comparison fields and to scan all lesson code variants for `eval` and `Function` constructor usage.
- Kept the implementation safe and predefined-only; no arbitrary code execution, backend, database, AI API, Sandpack, or user-provided code execution was added.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Next.js Code Demo Lab UI
- Added the `/tools/nextjs-code-demo-lab` page with metadata, a client-side lesson selector UI, and SEO/help content.
- Added `components/code-demo-preview.tsx` for safe built-in previews that switch by predefined lesson ID instead of evaluating code.
- Wired the UI to the tested lesson data from `lib/nextjs-code-demo-lab.ts`.
- Added lesson title, difficulty badge, concept, readable code block, Copy Code, Reset Demo, explanation, common mistake, change explanation, and preview area.
- Added real built-in previews for the counter, props, conditional rendering, and list lessons, plus simulated previews for server/client, route handler, and environment variable lessons.
- Marked Next.js Code Demo Lab as available in `lib/tools.ts`.
- Kept the implementation client-side only; no `eval`, `Function` constructor, user-provided code execution, Sandpack, backend, database, AI API, or file creation was added.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Next.js Code Demo Lab logic
- Added typed lesson data in `lib/nextjs-code-demo-lab.ts` for the initial seven predefined Next.js and React lessons.
- Added `CodeDemoLesson`, `CodeDemoLessonId`, and `PreviewType` types.
- Added `getAllCodeDemoLessons`, `getCodeDemoLessonById`, and `getDefaultCodeDemoLesson` pure lookup helpers.
- Added fixed code snippets, explanations, common mistakes, change explanations, and live or simulated preview types for each lesson.
- Added Vitest coverage for lesson count, default lesson, lookup by ID, invalid ID handling, required fields, non-empty code, valid preview types, and no `eval` or `Function` constructor usage in snippets.
- Kept the work logic-only; no UI, app pages, tool registry entry, backend, database, AI API, Sandpack, arbitrary code execution, or user-provided code execution was added.
- Verified with `npm run test:run` and `npm run lint`.

### Next.js Code Demo Lab docs
- Added the Next.js Code Demo Lab feature spec, test cases, and QA checklist.
- Documented a client-side educational lab for predefined Next.js and React lessons with fixed code snippets, explanations, common mistakes, change notes, and live or simulated previews.
- Covered initial lessons for `useState`, props, conditional rendering, list rendering, Client Component vs Server Component, Route Handler GET response, and environment variable safety.
- Captured the v1 safety boundary: no free-form code runner, arbitrary code execution, `eval`, `Function` constructor, Sandpack, backend, database, AI API, or file creation.
- Kept the work documentation-only; no UI, app pages, tool registry entry, backend, database, AI API, or implementation code was added.

### Next.js File Tree Visualizer UI
- Added the `/tools/nextjs-file-tree-visualizer` page with metadata, a client-side visualizer UI, and SEO/help content.
- Wired the UI to the tested `generateNextjsFileTree` function.
- Added route path input, route type selector, Generate File Tree, Copy File Tree, Clear, quick examples, normalized route output, generated file tree, explanation list, and preview output.
- Marked Next.js File Tree Visualizer as available in `lib/tools.ts` under a Learning category.
- Kept the implementation browser-only and educational-only; no backend, database, AI API, file creation, code execution, unrelated pages, or existing tool logic changes were added.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Next.js File Tree Visualizer logic
- Added `generateNextjsFileTree` as a pure function in `lib/nextjs-file-tree-visualizer.ts`.
- Added typed support for page, layout, loading, error, and route handler file tree generation.
- Added route path validation, trailing slash normalization, repeated slash cleanup, safe segment validation, file tree output, educational explanations, and preview text.
- Added Vitest coverage for root page routes, nested page routes, dynamic routes, API route handlers, layout routes, loading routes, error routes, trailing slash normalization, and invalid paths.
- Kept the work logic-only; no UI, app pages, tool registry entry, backend, database, file creation, or code execution was added.
- Verified with `npm run test:run` and `npm run lint`.

### Next.js File Tree Visualizer docs
- Added the Next.js File Tree Visualizer feature spec, test cases, and QA checklist.
- Documented a client-side educational tool for mapping App Router route paths to `app` directory file trees.
- Covered page routes, layouts, loading UI, error UI, API route handlers, dynamic segments, explanations, previews, validation edge cases, mobile support, and SEO/help content.
- Kept the work documentation-only; no UI, app pages, tool registry entry, backend, database, AI API, file creation, or code execution was added.

### AI Chatbox UI
- Added `components/chatbox.tsx` as a gated client-side bottom-right chat widget.
- Wired the chatbox into `app/layout.tsx` so it can render globally when `NEXT_PUBLIC_CHAT_ENABLED` is `"true"`.
- Added open, close, send, clear, loading, error, mobile-friendly layout, frontend `1000` character input limit, and conversation trimming before POSTing to `/api/chat`.
- Kept the frontend from accessing `OPENROUTER_API_KEY` or calling OpenRouter directly.
- Did not add manual ad slots, database, persistent chat history, markdown rendering, tool logic changes, or AdSense script changes.

### AI Chatbox backend logic
- Added a POST-only App Router chat API route at `app/api/chat/route.ts`.
- Added `lib/chat-context.ts` to build the DevToolBox AI assistant system prompt from the current tool list.
- Added `lib/chat-validation.ts` with typed request validation for message arrays, supported roles, non-empty content, a maximum of `10` conversation messages, and user messages up to `1000` characters.
- Added Vitest coverage for valid chat bodies, missing messages, empty content, overlong user messages, too many messages, unsupported roles, and conversations without user messages.
- Updated `.env.example` with the OpenRouter and chat feature flag variables.
- Kept the work backend-only; no chatbox UI, layout wiring, database, auth, streaming, history persistence, or direct browser-to-OpenRouter call was added.

### AI Chatbox docs
- Added the AI Chatbox feature spec, test cases, and QA checklist.
- Documented a global bottom-right chat widget backed by `/api/chat`, with OpenRouter used only from the server.
- Captured the required model, environment variables, server-only API key boundary, request validation, input limits, JSON errors, and no-history requirements.
- Documented assistant behavior requirements, including tool-list context, concise practical replies, unsupported feature handling, and no claims of command, file, or private data access.
- Kept the work documentation-only; no API route, chatbox component, layout changes, environment file changes, backend calls, or OpenRouter calls were added.

### UUID Generator logic
- Added the UUID Generator feature spec, test cases, and QA checklist.
- Added `generateUuidV4List` as a pure function in `lib/uuid-generator.ts`.
- Validated UUID count with a minimum of `1` and maximum of `100`.
- Used `crypto.randomUUID` when available, with a Web Crypto fallback for UUID v4 formatting.
- Added Vitest coverage for single UUID generation, multiple UUIDs, uppercase output, count below minimum, and count above maximum.
- Kept the work logic-only; no UI, backend, database, auth, or additional tools were added.
- Verified with `npm run test:run` and `npm run lint`.

### UUID Generator UI
- Added the `/tools/uuid-generator` page with metadata, a client-side UUID generator UI, and SEO/help content.
- Wired the UI to the tested `generateUuidV4List` function.
- Added count input, uppercase checkbox, Generate UUIDs, Copy All, Clear, readable output, and helpful copy/status messages.
- Marked UUID Generator as available in `lib/tools.ts`.
- Kept the implementation browser-only with no backend, database, auth, AdSense, or external API calls.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### JWT Decoder logic
- Added the JWT Decoder feature spec, test cases, and QA checklist.
- Added `decodeJwt` as a pure function in `lib/jwt-decoder.ts`.
- Added typed success and failure result objects for decoded header, payload, signature, timestamps, and errors.
- Decoded Base64URL JWT header and payload safely without verifying signatures.
- Extracted `exp`, `iat`, and `nbf` timestamp claims when present.
- Added Vitest coverage for valid JWT decoding, empty input, malformed tokens, invalid Base64URL or JSON, and timestamp extraction.
- Kept the work logic-only; no UI, backend, database, auth, JWT signing, JWT generation, or external API calls were added.
- Verified with `npm run test:run` and `npm run lint`.

### JWT Decoder UI
- Added the `/tools/jwt-decoder` page with metadata, a client-side decoder UI, and SEO/help content.
- Wired the UI to the tested `decodeJwt` function.
- Added JWT input, Decode Token, Clear, formatted header JSON, formatted payload JSON, signature presence, timestamp claim date display, and decode-only warning.
- Marked JWT Decoder as available in `lib/tools.ts`.
- Kept the implementation browser-only with no backend, database, auth, JWT generator, JWT signing, JWT verification, AdSense, or external API calls.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Date Calculator logic
- Added the Date Calculator feature spec, test cases, and QA checklist.
- Added pure date helpers in `lib/date-calculator.ts` for adding days, months, years, and calculating days between dates.
- Used strict `YYYY-MM-DD` parsing and UTC date math to avoid timezone drift.
- Added clear errors for invalid dates and non-whole number offsets.
- Added Vitest coverage for adding 30 days, subtracting days, adding months, adding years, days between dates, and invalid date input.
- Kept the work logic-only; no UI, backend, database, auth, or external API calls were added.
- Verified with `npm run test:run` and `npm run lint`.

### Date Calculator UI
- Added the `/tools/date-calculator` page with metadata, a client-side calculator UI, and SEO/help content.
- Wired the UI to the tested date calculator functions.
- Added mode selector, date input, number input, days-between end date input, Calculate, Clear, visible result output, and 7/30/90 days-from-today quick buttons.
- Marked Date Calculator as available in `lib/tools.ts` under a new Calculators category.
- Kept the implementation browser-only with no backend, database, auth, AdSense, or external API calls.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Unix Timestamp Converter logic
- Added the Unix Timestamp Converter feature spec, test cases, and QA checklist.
- Added `timestampToDate` and `dateToTimestamp` as pure functions in `lib/unix-timestamp-converter.ts`.
- Supported Unix timestamp conversion in both seconds and milliseconds.
- Returned typed success and failure result objects with helpful invalid timestamp and invalid date errors.
- Added Vitest coverage for seconds-to-date, milliseconds-to-date, date-to-seconds, date-to-milliseconds, invalid timestamp input, and invalid date input.
- Kept the work logic-only; no UI, backend, database, auth, or external API calls were added.
- Verified with `npm run test:run` and `npm run lint`.

### Unix Timestamp Converter UI
- Added the `/tools/unix-timestamp-converter` page with metadata, a client-side converter UI, and SEO/help content.
- Wired the UI to the tested `timestampToDate` and `dateToTimestamp` functions.
- Added mode selector, seconds/milliseconds unit selector, timestamp input, date/time input, Convert, Use Current Time, Copy Result, Clear, visible result fields, and helpful errors.
- Marked Unix Timestamp Converter as available in `lib/tools.ts` under Calculators.
- Kept the implementation browser-only with no backend, database, auth, AdSense, or external API calls.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### QR Code Generator docs
- Added the QR Code Generator feature spec, test cases, and QA checklist.
- Documented client-side text/URL QR generation, size selection, error correction level selection, PNG download, clear action, mobile support, and SEO/help content requirements.
- Kept the work documentation-only; no UI, app route, tool registry entry, backend, database, auth, AdSense, or implementation code was added.

### QR Code Generator logic
- Added `generateQrCodeDataUrl` as a pure async function in `lib/qr-code-generator.ts`.
- Used the existing `qrcode` package to generate PNG data URLs.
- Added typed input and result objects for QR value, size, error correction level, generated data URL, and errors.
- Validated empty input, clamped QR size to a safe range, and restricted error correction levels to `L`, `M`, `Q`, and `H`.
- Added Vitest coverage for valid text generation, empty input, size below minimum, size above maximum, valid error correction levels, and invalid error correction level handling.
- Kept the work logic-only; no UI, app route, tool registry entry, backend, database, auth, AdSense, or external API calls were added.
- Verified with `npm run test:run` and `npm run lint`.

### QR Code Generator UI
- Added the `/tools/qr-code-generator` page with metadata, a client-side QR generator UI, and SEO/help content.
- Wired the UI to the tested `generateQrCodeDataUrl` function.
- Added text/URL input, QR size selector, error correction level selector, Generate QR Code, Download PNG, Clear, generated QR preview, and helpful error/status messages.
- Marked QR Code Generator as available in `lib/tools.ts`.
- Kept the implementation browser-only with no backend, database, auth, AdSense, or external API calls.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Home and tools visual refresh
- Installed `lucide-react` for reusable icons.
- Added `lib/tool-visuals.ts` to map tool slugs to icons, accent gradients, and icon badge styles.
- Added a reusable `ToolCard` component for available and planned tool cards.
- Added a CSS/Tailwind-only `HeroVisual` component for the home page.
- Updated the home page with a visual hero, registry-backed stats, icon buttons, and reusable tool cards while preserving existing content.
- Updated the tools page with a stronger visual header and reusable icon tool cards while keeping available tools clickable and planned tools non-clickable.
- Kept the work frontend-only with no backend, database, AdSense, individual tool logic changes, or individual tool page changes.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### AdSense ownership verification
- Added the global `google-adsense-account` ownership verification meta tag through the App Router metadata export in `app/layout.tsx`.
- Used the public publisher ID `ca-pub-7384886862638631`.
- Did not add AdSense scripts, Auto Ads, manual ad slots, backend, database, or unrelated changes.
- Verified with `npm run lint` and `npm run build`.

### AdSense ads.txt
- Added `public/ads.txt` with the Google AdSense authorized seller entry.
- The file will be publicly served at `/ads.txt` after deployment.
- Did not add AdSense scripts, Auto Ads, manual ad slots, backend, database, or unrelated changes.
- Verified with `npm run lint` and `npm run build`.

### AdSense Auto Ads script support
- Added `components/adsense-script.tsx` using `next/script`.
- Wired the script loader into `app/layout.tsx` so it can apply globally when enabled.
- Added `.env.example` with `NEXT_PUBLIC_ADSENSE_ENABLED=false` and `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-7384886862638631`.
- Updated `.gitignore` so `.env.example` can be tracked while other `.env*` files remain ignored.
- Kept Auto Ads disabled by default and rendered the script only when `NEXT_PUBLIC_ADSENSE_ENABLED` is `"true"` and a client ID is present.
- Did not add manual ad slots, `ins adsbygoogle` blocks, backend, database, or individual tool page changes.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

## 2026-05-14

### Vitest setup
- Installed Vitest as a development dependency.
- Added `test` and `test:run` scripts to `package.json`.
- Added a minimal `vitest.config.ts` using the Node test environment for future pure logic tests.
- Configured Vitest to pass when no tests exist yet.
- Did not add React Testing Library, tool implementations, or tool tests.

### JSON Formatter logic
- Added `formatJson` as a pure function in `lib/json-formatter.ts`.
- Added Vitest coverage for valid objects, valid arrays, invalid JSON, empty input, nested JSON, and whitespace trimming.
- Kept the work logic-only; no UI, backend, auth, database, or tool page implementation was added.
- Verified with `npm run test:run` and `npm run lint`.

### JSON Formatter UI
- Added the `/tools/json-formatter` page with metadata, a client-side formatter UI, and SEO/help content.
- Wired the UI to the tested `formatJson` function.
- Added input, Format JSON, Copy Output, Clear, readable output, and helpful error/copy status messages.
- Marked JSON Formatter as available in `lib/tools.ts`.
- Kept the implementation browser-only with no backend, database, auth, or AdSense.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Tools listing link fix
- Updated `/tools` so available tools render as clickable cards.
- JSON Formatter now links to `/tools/json-formatter` and shows as available.
- Kept all other tools marked as planned.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### README Generator logic
- Added `generateReadme` as a pure function in `lib/readme-generator.ts`.
- Added Vitest coverage for all fields, missing project name fallback, empty features, and commands with special characters.
- Kept the work logic-only; no UI, backend, database, auth, or additional tools were added.
- Verified with `npm run test:run` and `npm run lint`.

### README Generator UI
- Added the `/tools/readme-generator` page with metadata, a client-side README form, and SEO/help content.
- Wired the UI to the tested `generateReadme` function.
- Added project name, description, tech stack, install command, run command, features, generated markdown output, copy, download, and clear actions.
- Marked README Generator as available in `lib/tools.ts`; other unfinished tools remain planned.
- Kept the implementation browser-only with no backend, database, auth, or AdSense.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### AI Coding Prompt Generator logic
- Added `generateAiCodingPrompt` as a pure function in `lib/ai-coding-prompt-generator.ts`.
- Added Vitest coverage for basic prompt generation, empty constraints fallback, and missing expected output fallback.
- Kept the work logic-only; no UI, backend, database, auth, external AI API calls, or additional tools were added.
- Verified with `npm run test:run` and `npm run lint`.

### AI Coding Prompt Generator UI
- Added the `/tools/ai-coding-prompt-generator` page with metadata, a client-side prompt form, and SEO/help content.
- Wired the UI to the tested `generateAiCodingPrompt` function.
- Added task type, tech stack, feature description, constraints, expected output, generated prompt output, copy, and clear actions.
- Marked AI Coding Prompt Generator as available in `lib/tools.ts`; unfinished tools remain planned.
- Kept the implementation browser-only with no backend, database, auth, AdSense, or external AI API calls.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Git Command Helper logic
- Added `getGitCommandHelp` as a pure function in `lib/git-command-helper.ts`.
- Added typed support for all predefined Git helper goals.
- Added warnings and `isRisky` flags for risky commands.
- Added Vitest coverage for status, create branch, undo last commit while keeping changes, discard local file changes, and missing branch name fallback.
- Kept the work logic-only; no UI, backend, database, auth, or command execution was added.
- Verified with `npm run test:run` and `npm run lint`.

### Git Command Helper UI
- Added the `/tools/git-command-helper` page with metadata, a client-side goal selector, and SEO/help content.
- Wired the UI to the tested `getGitCommandHelp` function.
- Added conditional branch name, commit message, and file path inputs, plus generate, copy, and clear actions.
- Displayed command, explanation, and warning messages for risky commands without executing anything.
- Marked Git Command Helper as available in `lib/tools.ts`; unfinished tools remain planned.
- Kept the implementation browser-only with no backend, database, auth, or AdSense.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.

### Test Case Checklist Generator logic
- Added `generateTestCaseChecklist` as a pure function in `lib/test-case-checklist-generator.ts`.
- Added markdown sections for smoke tests, happy path tests, edge case tests, error handling tests, mobile/responsive tests, accessibility checks, and regression checks.
- Added Vitest coverage for all fields, missing feature name fallback, and empty edge cases fallback.
- Kept the work logic-only; no UI, backend, database, auth, or additional tools were added.
- Verified with `npm run test:run` and `npm run lint`.

### Test Case Checklist Generator UI
- Added the `/tools/test-case-checklist-generator` page with metadata, a client-side checklist form, and SEO/help content.
- Wired the UI to the tested `generateTestCaseChecklist` function.
- Added feature name, main user flow, edge cases, platform, generated checklist output, copy, download, and clear actions.
- Marked Test Case Checklist Generator as available in `lib/tools.ts`.
- Kept the implementation browser-only with no backend, database, auth, or AdSense.
- Verified with `npm run test:run`, `npm run lint`, and `npm run build`.
