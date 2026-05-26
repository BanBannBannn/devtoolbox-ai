# Phase 5C-1 RAG Runtime Settings QA Checklist

## Scope
- [ ] Planning docs are created.
- [ ] SQL planning doc is created.
- [ ] `.env.example` includes server-only admin/settings variables.
- [ ] Server-side runtime config reader is implemented.
- [ ] RAG API uses effective runtime settings.
- [ ] Dashboard admin UI is implemented at `/dashboard/admin/rag-settings`.
- [ ] Dashboard admin UI includes both runtime settings and plan limits.
- [ ] Public tools are unchanged.
- [ ] SQL is not run from this task.

## Database
- [ ] `public.app_config` SQL is reviewed before execution.
- [ ] `app_config.key` is the primary key.
- [ ] `app_config.value` is `jsonb not null`.
- [ ] `app_config.updated_by` references `auth.users(id)`.
- [ ] `app_config.updated_at` defaults to UTC `now()`.
- [ ] `set_updated_at()` is reused or created safely.
- [ ] RLS is enabled on `app_config`.
- [ ] No broad authenticated write policy exists.
- [ ] No public client write policy exists.
- [ ] `rag_runtime_settings` default row is seeded.

## Settings
- [ ] `retrievedChunks` default is `3`.
- [ ] `retrievedChunks` safe range is `1` to `20`.
- [ ] `similarityThreshold` default is `0`.
- [ ] `similarityThreshold` safe range is `0` to `1`.
- [ ] `maxOutputTokens` defaults from `plan_limits.max_output_tokens`.
- [ ] `maxOutputTokens` safe range is `100` to `2000`.
- [ ] `temperature` default is `0.2`.
- [ ] `temperature` safe range is `0` to `1`.
- [ ] `sourceSnippetLength` default is `240`.
- [ ] `sourceSnippetLength` safe range is `80` to `500`.
- [ ] `debugRetrieval` default is `false`.
- [ ] `debugRetrieval` is boolean.

## Plan Limits
- [ ] Admin can view existing `plan_limits` rows.
- [ ] Admin can edit the free plan at minimum.
- [ ] Multiple plan rows are shown if they exist.
- [ ] `plan_key` is shown as the plan name for the current schema.
- [ ] `monthly_rag_messages` is clamped to `0` to `100000`.
- [ ] `monthly_vectorize_jobs` is clamped to `0` to `100000`.
- [ ] `max_saved_documents` is clamped to `0` to `100000`.
- [ ] `max_document_characters` is clamped to `100` to `1000000`.
- [ ] `max_chunks_per_document` is clamped to `1` to `10000`.
- [ ] `max_chunks_total` is clamped to `1` to `1000000`.
- [ ] `retrieved_chunks_per_answer` is clamped to `1` to `20`.
- [ ] `max_output_tokens` is clamped to `100` to `4000`.
- [ ] `is_active` can be viewed and updated when present.
- [ ] Browser does not write `plan_limits` directly.

## Config Priority
- [ ] Safe hardcoded defaults are first.
- [ ] Env tuning values are fallback only when DB values are missing or invalid.
- [ ] DB `app_config.rag_runtime_settings` is the normal source of truth.
- [ ] Server env values override DB values only when `RAG_FORCE_ENV_OVERRIDES=true`.
- [ ] Final effective values are clamped to safe ranges.
- [ ] `plan_limits` remain the final quota cap source.
- [ ] `retrievedChunks` cannot exceed `plan_limits.retrieved_chunks_per_answer`.
- [ ] `maxOutputTokens` cannot exceed `plan_limits.max_output_tokens`.
- [ ] Effective preview shows runtime value, plan cap, and effective value.
- [ ] Runtime settings cannot silently bypass plan limits.
- [ ] Admin UI changes take effect when env values exist but `RAG_FORCE_ENV_OVERRIDES` is not true.
- [ ] `RAG_FORCE_ENV_OVERRIDES` is server-only and has no `NEXT_PUBLIC_` equivalent.

## RAG API Runtime Behavior
- [ ] `retrievedChunks` is used as the RPC `match_count`.
- [ ] `similarityThreshold` filters low-similarity chunks after retrieval.
- [ ] `maxOutputTokens` is passed to the OpenRouter LLM request.
- [ ] `temperature` is passed to the OpenRouter LLM request.
- [ ] `sourceSnippetLength` controls source and retrieval detail snippet length.
- [ ] Invalid DB config values fall back safely or clamp without crashing the API.
- [ ] Server env overrides are server-only and also clamped.
- [ ] Usage response includes counts only, not model names.
- [ ] Retrieval details may include `similarityThreshold` and `debugRetrievalEnabled`.

## Admin Access
- [ ] `RAG_ADMIN_EMAILS` is server-only.
- [ ] No `NEXT_PUBLIC_RAG_ADMIN_EMAILS` exists.
- [ ] Logged-out users are redirected to login.
- [ ] Logged-in non-admin users receive not found or forbidden.
- [ ] Logged-in admins can access `/dashboard/admin/rag-settings`.
- [ ] Admin check is server-side.
- [ ] Admin writes re-check allowlist server-side.
- [ ] Client-side hiding is not the only admin protection.

## Admin UI
- [ ] Admin can view current saved runtime settings.
- [ ] Admin can view current plan limits.
- [ ] Missing `rag_runtime_settings` row shows safe defaults.
- [ ] Admin can save settings.
- [ ] Admin can save plan limits.
- [ ] Admin can reset settings to safe defaults.
- [ ] Invalid values are clamped server-side.
- [ ] `updated_by` is set to the authenticated admin user id when saving.
- [ ] Admin dashboard link is shown only to admins.
- [ ] Non-admin users cannot access the page even if they know the URL.
- [ ] Browser does not write `app_config` directly.
- [ ] Browser/network responses do not expose `RAG_ADMIN_EMAILS`, API keys, service role key, model names, prompts, raw embeddings, or provider payloads.

## Security
- [ ] Runtime config does not contain secrets.
- [ ] Runtime config does not expose API keys.
- [ ] Runtime config does not expose exact model names to the client.
- [ ] RAG responses continue to hide model names.
- [ ] RAG responses do not expose raw runtime DB JSON.
- [ ] Retrieval details remain safe diagnostics only.
- [ ] `debugRetrieval` never exposes chain-of-thought.
- [ ] `debugRetrieval` never exposes full prompts.
- [ ] `debugRetrieval` never exposes full document chunks.
- [ ] `debugRetrieval` never exposes raw embeddings.
- [ ] `debugRetrieval` never exposes raw provider responses.
- [ ] `debugRetrieval` never exposes API keys or service role keys.

## Verification Commands
- [ ] `npm run test:run`
- [ ] `npm run lint`
- [ ] `npm run build`
