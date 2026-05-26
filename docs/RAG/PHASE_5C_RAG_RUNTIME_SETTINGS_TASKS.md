# Phase 5C-1 RAG Runtime Settings Tasks

## Goal
Plan a safe RAG runtime settings layer and future admin page without implementing runtime code yet.

## 1. Review Current RAG Contract
- Confirm `POST /api/rag/chat` does not expose exact model names.
- Confirm `retrievalDetails` contain safe diagnostics only.
- Confirm `plan_limits.retrieved_chunks_per_answer` and `plan_limits.max_output_tokens` remain quota caps.
- Confirm public tools remain unchanged.

## 2. Apply Or Review SQL
Use:

- `docs/RAG/PHASE_5C_RAG_RUNTIME_SETTINGS_SQL.md`

SQL should:

- create `public.app_config` if missing.
- reuse or create `public.set_updated_at()`.
- add an `updated_at` trigger.
- enable RLS.
- avoid broad client write policies.
- seed `rag_runtime_settings`.

Do not run SQL until reviewed.

## 3. Add Environment Variables
Update `.env.example` with:

- `RAG_ADMIN_EMAILS=`
- `RAG_RETRIEVED_CHUNKS_OVERRIDE=`
- `RAG_SIMILARITY_THRESHOLD=`
- `RAG_MAX_OUTPUT_TOKENS_OVERRIDE=`
- `RAG_TEMPERATURE=`
- `RAG_SOURCE_SNIPPET_LENGTH=`
- `RAG_DEBUG_RETRIEVAL=`

Rules:

- All variables are server-side.
- Do not use `NEXT_PUBLIC_RAG_ADMIN_EMAILS`.
- Do not expose model names or secrets through runtime settings.

## 4. Future Admin Access Helper
When implementing runtime code later, create a server-only helper:

- parse `RAG_ADMIN_EMAILS`.
- trim whitespace.
- compare emails case-insensitively.
- require logged-in Supabase user.
- return admin status without exposing the allowlist to the browser.

Tests should cover:

- empty allowlist.
- matching email.
- case-insensitive match.
- whitespace trimming.
- non-admin rejection.

## 5. Future Runtime Settings Helper
Create pure helpers later:

- default settings.
- safe range definitions.
- parse DB JSON.
- parse env overrides.
- clamp values.
- combine defaults, plan limits, DB config, and env overrides.

Expected priority:

1. safe hardcoded defaults.
2. `plan_limits` caps.
3. DB `app_config.rag_runtime_settings`.
4. server env overrides.

Tests should cover:

- defaults.
- DB values.
- env overrides.
- clamping lower bounds.
- clamping upper bounds.
- retrieved chunks cannot exceed plan cap.
- max output tokens cannot exceed plan cap.
- invalid JSON values fall back safely.

## 6. Future Admin UI
Planned route:

- `/dashboard/admin/rag-settings`

UI should:

- be server-protected.
- show current effective values.
- show DB stored values.
- show safe ranges.
- show whether env overrides are active without revealing secrets.
- save settings through a server-side checked action/route.
- avoid model-name exposure.

## 7. Future RAG API Integration
After settings helpers exist:

- load runtime settings server-side in `POST /api/rag/chat`.
- use effective `retrievedChunks` for RPC match count.
- apply `similarityThreshold` after retrieval.
- use effective `maxOutputTokens` for OpenRouter.
- use `temperature` for OpenRouter.
- use `sourceSnippetLength` for response snippets.
- include safe retrieval diagnostics only when appropriate.
- do not expose model names, API keys, prompts, full chunks, raw embeddings, or provider payloads.

## Stop Conditions
Stop before implementation if:

- admin allowlist would be exposed to the browser.
- normal authenticated users can update `app_config` directly.
- runtime settings can exceed safe ranges.
- runtime settings can bypass `plan_limits` quota caps.
- model names would reappear in client responses.
- RAG API behavior is changed before the planning/SQL step is reviewed.
