# Phase 5C-1 RAG Runtime Settings Spec

## Goal
Add a runtime settings layer for RAG retrieval and answer generation so quality-related settings can be tuned without editing code every time.

Phase 5C-1B implements the server-side config reader and applies effective runtime settings to `POST /api/rag/chat`. Phase 5C-1C implements the protected admin settings UI. The admin settings page now includes both RAG runtime tuning and plan limit editing. This phase does not implement benchmarking, new SQL, dependencies, streaming, global chatbox changes, public tool changes, or SQL execution.

## Admin Page
Route:

- `/dashboard/admin/rag-settings`

The page is protected server-side. Do not rely only on client-side hiding.

## Runtime Settings
Runtime settings live in `app_config.rag_runtime_settings`. They are RAG quality and behavior knobs, not quota ownership.

Supported runtime settings:

| Setting | Default | Safe range | Purpose |
| --- | ---: | --- | --- |
| `retrievedChunks` | `3` | `1` to `20` | Number of chunks requested for retrieval quality. Final value must also respect `plan_limits.retrieved_chunks_per_answer`. |
| `similarityThreshold` | `0` | `0` to `1` | Optional cutoff for low-similarity chunks. |
| `maxOutputTokens` | from `plan_limits.max_output_tokens` | `100` to `2000` | Runtime answer cap. Final value must not exceed the user's plan cap. |
| `temperature` | `0.2` | `0` to `1` | LLM answer randomness. |
| `sourceSnippetLength` | `240` | `80` to `500` | Length of snippets returned in sources and retrieval details. |
| `debugRetrieval` | `false` | boolean | Controls whether safe extra retrieval diagnostics are included server-side or in admin debugging flows. |
| `chatHistoryMessages` | `6` | `0` to `20` | Number of recent same-session chat messages included in the RAG prompt. |

Recommended stored default:

```json
{
  "retrievedChunks": 3,
  "similarityThreshold": 0,
  "maxOutputTokens": 800,
  "temperature": 0.2,
  "sourceSnippetLength": 240,
  "debugRetrieval": false,
  "chatHistoryMessages": 6
}
```

## Config Priority
Effective settings should be resolved in this order:

1. Safe hardcoded defaults.
2. Server environment tuning values as fallback only when a DB value is missing or invalid.
3. Database `app_config.rag_runtime_settings` as the normal source of truth.
4. Server environment tuning values as emergency overrides only when `RAG_FORCE_ENV_OVERRIDES=true`.
5. `plan_limits` for final quota-related caps.

Final effective values must always be clamped to safe ranges.

Important:

- `plan_limits` remain the product quota source.
- Runtime settings tune quality, not billing/quota ownership.
- By default, admin UI changes stored in `app_config` win over env tuning values.
- Env tuning values should be treated as fallback/emergency controls, not the normal source of truth.
- `RAG_FORCE_ENV_OVERRIDES=true` is required before env tuning values override `app_config`.
- `retrievedChunks` cannot exceed the user's `plan_limits.retrieved_chunks_per_answer`.
- `maxOutputTokens` cannot exceed the user's `plan_limits.max_output_tokens`.

Effective values:

- `effectiveRetrievedChunks = min(runtime.retrievedChunks, plan_limits.retrieved_chunks_per_answer, 20)`
- `effectiveMaxOutputTokens = min(runtime.maxOutputTokens, plan_limits.max_output_tokens, 2000)`
- `similarityThreshold`, `temperature`, `sourceSnippetLength`, and `debugRetrieval` come from runtime settings and are clamped to safe ranges.

Example:

- Runtime `retrievedChunks` is `5`.
- Free plan `retrieved_chunks_per_answer` is `3`.
- Effective value for free users is `3`.

## Plan Limits
Plan limits live in `plan_limits`. They are product quota caps.

Editable fields:

- `plan_key` displayed as the plan name for the current schema.
- `monthly_rag_messages`
- `monthly_vectorize_jobs`
- `max_saved_documents`
- `max_document_characters`
- `max_chunks_per_document`
- `max_chunks_total`
- `retrieved_chunks_per_answer`
- `max_output_tokens`
- `is_active`

Safe admin validation ranges:

| Field | Safe range |
| --- | --- |
| `monthly_rag_messages` | `0` to `100000` |
| `monthly_vectorize_jobs` | `0` to `100000` |
| `max_saved_documents` | `0` to `100000` |
| `max_document_characters` | `100` to `1000000` |
| `max_chunks_per_document` | `1` to `10000` |
| `max_chunks_total` | `1` to `1000000` |
| `retrieved_chunks_per_answer` | `1` to `20` |
| `max_output_tokens` | `100` to `4000` |

## Environment Variables
Server-only admin allowlist:

- `RAG_ADMIN_EMAILS=admin1@example.com,admin2@example.com`

Optional server-side emergency overrides:

- `RAG_FORCE_ENV_OVERRIDES=false`
- `RAG_RETRIEVED_CHUNKS_OVERRIDE=`
- `RAG_SIMILARITY_THRESHOLD=`
- `RAG_MAX_OUTPUT_TOKENS_OVERRIDE=`
- `RAG_TEMPERATURE=`
- `RAG_SOURCE_SNIPPET_LENGTH=`
- `RAG_DEBUG_RETRIEVAL=`
- `RAG_CHAT_HISTORY_MESSAGES=`

Do not create `NEXT_PUBLIC_RAG_ADMIN_EMAILS`.
Do not create `NEXT_PUBLIC_` versions of RAG tuning variables.

## Admin Access Plan
- Logged-out users visiting `/dashboard/admin/rag-settings` should be redirected to login.
- Logged-in non-admin users should receive not found or forbidden.
- Logged-in admin users are users whose email appears in server-only `RAG_ADMIN_EMAILS`.
- Email comparison should trim whitespace and use case-insensitive matching.
- Server actions or route handlers must re-check admin access before reading or writing admin-only settings.
- Client-side UI hiding is not sufficient protection.

## Admin UI Behavior
- The admin page reads `app_config.rag_runtime_settings` server-side.
- The admin page reads `plan_limits` server-side.
- If the row is missing, the page shows safe defaults and allows saving.
- Saving runtime settings and plan limits runs through server actions.
- Server actions authenticate the user, check `RAG_ADMIN_EMAILS`, clamp all values, and write only safe fields.
- Runtime settings should set `app_config.updated_by` to the authenticated admin user's id when saving.
- The current `plan_limits` schema has no `updated_by` field, so plan limit edits rely on the existing `updated_at` trigger if present.
- A reset action can store the safe defaults.
- The page should show a read-only effective preview for at least the free or active plan.
- Normal users should not see admin links, but route protection must not depend on hidden links.

## Database Plan
Create `public.app_config` if it does not exist.

Fields:

- `key text primary key`
- `value jsonb not null`
- `description text`
- `updated_by uuid references auth.users(id)`
- `updated_at timestamptz not null default timezone('utc', now())`

Initial key:

- `rag_runtime_settings`

## Security
- Enable RLS on `app_config`.
- Do not grant broad write access to authenticated users.
- Do not add public browser write policies.
- Normal users should not update `app_config` directly.
- If direct client reads are not needed, do not expose `app_config` to browser clients directly.
- RAG API should read settings server-side.
- Admin writes should go through server-side checked actions/routes after validating `RAG_ADMIN_EMAILS`.
- Browser clients must not write `app_config` or `plan_limits` directly.
- Runtime config must not expose secrets.
- Runtime config must not expose model names to the client.
- Runtime config must not expose API keys.

## RAG API Future Behavior
Runtime behavior:

- Load safe defaults.
- Load current user's plan limits.
- Load `app_config.rag_runtime_settings` server-side.
- Apply server env overrides.
- Clamp final values to safe ranges.
- Clamp quota-related values to plan limits.
- Use effective `retrievedChunks` for retrieval count.
- Use `similarityThreshold` to filter low-similarity matches after retrieval.
- Use `temperature` and effective `maxOutputTokens` for the LLM request.
- Use `sourceSnippetLength` when creating source snippets and retrieval details.
- Use `debugRetrieval` only for safe diagnostics; never expose chain-of-thought, model names, prompts, full chunks, raw embeddings, provider payloads, or secrets.

The RAG API may use a server-only service role client to read `app_config` because the table is private by default and has no direct browser select policy. This service role path must stay server-only and must not be used to bypass user-owned document or chunk access. Retrieval still uses the authenticated Supabase server client and the `match_document_chunks` RPC that filters by `auth.uid()`.

## Scope Boundaries
Out of scope:

- Benchmark tooling.
- Model-name exposure.
- SQL execution.
- Dependency changes.
- Public tool changes.
- Payment or plan changes.
