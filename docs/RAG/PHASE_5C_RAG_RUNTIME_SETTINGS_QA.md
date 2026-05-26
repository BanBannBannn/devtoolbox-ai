# Phase 5C-1 RAG Runtime Settings QA Checklist

## Scope
- [ ] Planning docs are created.
- [ ] SQL planning doc is created.
- [ ] `.env.example` includes server-only admin/settings variables.
- [ ] No runtime code is implemented.
- [ ] RAG API behavior is unchanged.
- [ ] Dashboard admin UI is not implemented yet.
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

## Config Priority
- [ ] Safe hardcoded defaults are first.
- [ ] `plan_limits` remain the quota cap source.
- [ ] DB `app_config.rag_runtime_settings` is applied after defaults and plan caps.
- [ ] Server env overrides are applied last.
- [ ] Final effective values are clamped to safe ranges.
- [ ] `retrievedChunks` cannot exceed `plan_limits.retrieved_chunks_per_answer`.
- [ ] `maxOutputTokens` cannot exceed `plan_limits.max_output_tokens`.

## Admin Access
- [ ] `RAG_ADMIN_EMAILS` is server-only.
- [ ] No `NEXT_PUBLIC_RAG_ADMIN_EMAILS` exists.
- [ ] Logged-out users are redirected to login.
- [ ] Logged-in non-admin users receive not found or forbidden.
- [ ] Logged-in admins can access the future settings page.
- [ ] Admin check is server-side.
- [ ] Admin writes re-check allowlist server-side.
- [ ] Client-side hiding is not the only admin protection.

## Security
- [ ] Runtime config does not contain secrets.
- [ ] Runtime config does not expose API keys.
- [ ] Runtime config does not expose exact model names to the client.
- [ ] RAG responses continue to hide model names.
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
