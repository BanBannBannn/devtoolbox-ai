# Phase 1 Auth Dashboard Tasks

## Scope Reminder
Implement Supabase auth and a protected dashboard shell only.

Do not implement:

- Documents CRUD.
- Vectorization.
- RAG chat.
- Usage limits.
- Database tables beyond what auth setup absolutely needs.
- Service role client.
- Existing tool page changes.

## 1. Dependency And Environment Setup
- Install `@supabase/ssr` and `@supabase/supabase-js` if they are not already installed.
- Add Supabase environment variables to `.env.example`:
  - `NEXT_PUBLIC_SUPABASE_URL=`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
- Do not add `SUPABASE_SERVICE_ROLE_KEY` for Phase 1.
- Confirm local `.env.local` can be configured without committing secrets.

## 2. Supabase Helper Setup
- Create a server-side Supabase helper for App Router usage.
- Create a browser Supabase helper only if auth forms need client-side Supabase calls.
- Use `@supabase/ssr` cookie/session handling.
- Keep helper names explicit, for example:
  - `createServerSupabaseClient`
  - `createBrowserSupabaseClient`
- Add clear handling for missing Supabase env variables.

## 3. Route Protection
- Add route protection for `/dashboard`.
- Prefer server-side session checks where possible.
- Redirect logged-out dashboard visitors to `/login`.
- Preserve all existing public routes without auth checks.
- If middleware is used, scope it carefully so public tools are not blocked.

## 4. Login Page
- Create `/login`.
- Add email and password fields.
- Add submit button.
- Show loading state.
- Show user-safe error state.
- Link to `/signup`.
- Redirect logged-in users to `/dashboard` if practical.
- Redirect successful login to `/dashboard`.

## 5. Signup Page
- Create `/signup`.
- Add email and password fields.
- Add submit button.
- Show loading state.
- Show user-safe error state.
- Link to `/login`.
- Explain email confirmation if Supabase requires it.
- Redirect logged-in users to `/dashboard` if practical.

## 6. Logout Action
- Add logout action from the dashboard shell.
- Sign out through Supabase.
- Redirect to `/login` or `/`.
- Do not log auth tokens or session objects.

## 7. Dashboard Shell
- Create protected `/dashboard`.
- Show dashboard title and signed-in state.
- Add placeholder cards:
  - Documents
  - Usage
  - RAG Chat
  - Settings
- Add empty-state copy explaining that each feature arrives in a later phase.
- Keep cards non-functional or link only to intentionally implemented placeholder pages.
- Keep layout mobile-friendly.

## 8. Metadata And Navigation
- Add unique metadata for `/login`, `/signup`, and `/dashboard`.
- Decide whether public navigation should show Login when logged out.
- Decide whether dashboard navigation should show Logout when logged in.
- Avoid adding dashboard links that imply unimplemented features are ready.

## 9. Tests And Checks
- Add tests for any extracted auth config or route helper logic if practical.
- Manual QA is required because Supabase auth depends on environment and provider configuration.
- Run:
  - `npm run test:run`
  - `npm run lint`
  - `npm run build`

## 10. Work Log
- Update `docs/WORK_LOG.md`.
- Note that Phase 1 implemented auth/dashboard shell only.
- Explicitly note that documents, vectorization, RAG chat, and usage limits remain future phases.

## Suggested Implementation Order
1. Read this spec and QA checklist.
2. Inspect the installed Next.js docs under `node_modules/next/dist/docs/` before coding App Router auth/session behavior.
3. Install Supabase packages if needed.
4. Add env examples.
5. Add Supabase helper utilities.
6. Add login/signup UI.
7. Add route protection.
8. Add dashboard shell and logout.
9. Run checks.
10. Complete QA checklist.

## Stop Conditions
Stop and reassess if:

- Supabase env variables are missing and the app cannot build safely.
- Auth helpers require a package or API different from the current `@supabase/ssr` docs.
- Route protection blocks public tools.
- Any implementation requires service role access.
- Documents, vectorization, or RAG chat become necessary to complete the task.
