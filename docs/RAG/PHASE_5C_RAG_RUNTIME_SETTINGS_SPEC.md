# Phase 5C-1 RAG Runtime Settings Spec

## Goal
Add a runtime settings layer for RAG retrieval and answer generation so quality-related settings can be tuned without editing code every time.

Phase 5C-1B implements the server-side config reader and applies effective runtime settings to `POST /api/rag/chat`. It does not implement the admin UI, benchmarking, markdown answer formatting, dependencies, or SQL execution.

## Future Admin Page
Planned route:

- `/dashboard/admin/rag-settings`

The page must be protected server-side. Do not rely only on client-side hiding.

## Settings
Supported settings:

| Setting | Default | Safe range | Purpose |
| --- | ---: | --- | --- |
| `retrievedChunks` | `3` | `1` to `20` | Number of chunks requested for retrieval quality. Final value must also respect `plan_limits.retrieved_chunks_per_answer`. |
| `similarityThreshold` | `0` | `0` to `1` | Optional cutoff for low-similarity chunks. |
| `maxOutputTokens` | from `plan_limits.max_output_tokens` | `100` to `2000` | Runtime answer cap. Final value must not exceed the user's plan cap. |
| `temperature` | `0.2` | `0` to `1` | LLM answer randomness. |
| `sourceSnippetLength` | `240` | `80` to `500` | Length of snippets returned in sources and retrieval details. |
| `debugRetrieval` | `false` | boolean | Controls whether safe extra retrieval diagnostics are included server-side or in admin debugging flows. |

Recommended stored default:

```json
{
  "retrievedChunks": 3,
  "similarityThreshold": 0,
  "maxOutputTokens": 800,
  "temperature": 0.2,
  "sourceSnippetLength": 240,
  "debugRetrieval": false
}
```

## Config Priority
Effective settings should be resolved in this order:

1. Safe hardcoded defaults.
2. `plan_limits` for quota-related caps.
3. Database `app_config` value for `rag_runtime_settings`.
4. Server environment overrides for emergency/deployment tuning.

Final effective values must always be clamped to safe ranges.

Important:

- `plan_limits` remain the product quota source.
- Runtime settings tune quality, not billing/quota ownership.
- `retrievedChunks` cannot exceed the user's `plan_limits.retrieved_chunks_per_answer`.
- `maxOutputTokens` cannot exceed the user's `plan_limits.max_output_tokens`.

## Environment Variables
Server-only admin allowlist:

- `RAG_ADMIN_EMAILS=admin1@example.com,admin2@example.com`

Optional server-side emergency overrides:

- `RAG_RETRIEVED_CHUNKS_OVERRIDE=`
- `RAG_SIMILARITY_THRESHOLD=`
- `RAG_MAX_OUTPUT_TOKENS_OVERRIDE=`
- `RAG_TEMPERATURE=`
- `RAG_SOURCE_SNIPPET_LENGTH=`
- `RAG_DEBUG_RETRIEVAL=`

Do not create `NEXT_PUBLIC_RAG_ADMIN_EMAILS`.

## Admin Access Plan
- Logged-out users visiting `/dashboard/admin/rag-settings` should be redirected to login.
- Logged-in non-admin users should receive not found or forbidden.
- Logged-in admin users are users whose email appears in server-only `RAG_ADMIN_EMAILS`.
- Email comparison should trim whitespace and use case-insensitive matching.
- Server actions or route handlers must re-check admin access before reading or writing admin-only settings.
- Client-side UI hiding is not sufficient protection.

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

- Admin UI implementation.
- Benchmark tooling.
- Answer markdown formatting.
- Model-name exposure.
- SQL execution.
- Dependency changes.
- Public tool changes.
- Payment or plan changes.
