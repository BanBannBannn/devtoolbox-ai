# Phase 1 Auth Dashboard Spec

## Goal
Add Supabase authentication and a protected dashboard shell while keeping all current public DevToolBox AI routes accessible without login.

Phase 1 is the platform foundation only. It should not introduce documents CRUD, vectorization, RAG chat, usage tracking, payments, or private knowledge-base behavior.

## User Outcomes
- Anonymous users can continue using all public tools, blog pages, and static pages.
- Anonymous users can visit `/login` and `/signup`.
- Anonymous users who visit `/dashboard` are redirected to `/login`.
- Logged-in users can reach `/dashboard`.
- Logged-in users can log out.
- Logged-in users who visit `/login` or `/signup` are redirected to `/dashboard` if practical.
- Dashboard users see clear placeholder cards for future RAG platform features.

## Required Routes
Public routes:

- `/login`
- `/signup`
- Existing public routes:
  - `/`
  - `/tools`
  - `/tools/*`
  - `/blog`
  - `/blog/*`
  - `/about`
  - `/contact`
  - `/privacy-policy`
  - `/terms`

Protected routes:

- `/dashboard`

Future protected routes are out of scope for Phase 1:

- `/dashboard/documents`
- `/dashboard/documents/new`
- `/dashboard/documents/[id]`
- `/dashboard/chat`
- `/dashboard/settings`

These can appear as disabled or placeholder dashboard cards but should not be implemented as full features yet.

## Supabase Integration
Use `@supabase/ssr` for Next.js App Router auth and session handling.

Expected pieces for implementation:

- Server-side Supabase helper for reading the current session/user.
- Browser Supabase helper only where interactive auth forms require it.
- Middleware or server-side route protection for dashboard routes.
- Cookie-based session handling using the patterns recommended by `@supabase/ssr`.

Do not use deprecated Supabase auth helper packages unless current installed-package documentation requires it.

## Environment Variables
Add public Supabase client variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Rules:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are allowed in browser code.
- Do not add or use a Supabase service role key in client code.
- If a service role key is ever needed in a later phase, it must be server-only and must not use a `NEXT_PUBLIC_` prefix.
- Phase 1 should handle missing Supabase env variables with a clear, safe error state in auth flows.

## Auth Behavior
Signup:

- User enters email and password.
- App calls Supabase signup through the appropriate client boundary.
- App shows a clear success, confirmation, or error message.
- If email confirmation is enabled in Supabase, the UI should explain that the user may need to check email.

Login:

- User enters email and password.
- App authenticates with Supabase.
- On success, redirect to `/dashboard`.
- On failure, show a clear error without exposing provider internals.

Logout:

- User can trigger logout from the dashboard shell.
- App signs out through Supabase.
- After logout, redirect to `/login` or the public home page.

Session redirects:

- Logged-out `/dashboard` access redirects to `/login`.
- Logged-in `/login` or `/signup` access redirects to `/dashboard` if practical.
- Existing public routes must not require auth.

## Dashboard Shell
The dashboard should be a protected shell only.

Suggested content:

- Page title: `Dashboard`
- Short message that the user is signed in.
- Logout action.
- Placeholder cards:
  - Documents
  - Usage
  - RAG Chat
  - Settings

Each placeholder card should:

- Explain that the feature is coming in a later phase.
- Avoid linking to unimplemented protected pages unless those pages intentionally exist as placeholders.
- Avoid implying that documents, usage limits, vectorization, or RAG chat are already functional.

## UI Requirements
- Mobile-friendly layout.
- Clear labels for email and password inputs.
- Accessible form errors.
- Buttons should clearly describe actions.
- Dashboard cards should be readable on small screens.
- Auth pages should not feel like marketing landing pages; they should prioritize the form and clear next action.

## Security Requirements
- Read auth session server-side where possible.
- Never trust user email or user ID from client request bodies.
- Do not expose a service role key.
- Do not log auth tokens.
- Do not log full session objects.
- Do not store passwords outside Supabase.
- Keep auth errors user-safe.
- Existing public tools should not receive user-specific data in Phase 1.

## Database Scope
Do not add RAG platform tables in Phase 1.

Allowed database work:

- Supabase-managed auth setup.
- Optional minimal profile bootstrap only if needed for the dashboard shell.

Avoid adding:

- `documents`
- `document_chunks`
- `document_vector_jobs`
- `chat_sessions`
- `chat_messages`
- `plan_limits`
- `usage_events`
- `app_config`

Those belong to later phases unless a later implementation spec explicitly changes scope.

## Out Of Scope
- Documents CRUD.
- Document upload.
- Vectorization.
- RAG chat.
- Usage limits.
- Payments.
- Teams/workspaces.
- OpenRouter changes.
- Service role usage.
- Public tool changes.
- Existing tool page redesigns.

## Acceptance Criteria
- Public pages and tools remain accessible while logged out.
- `/login` and `/signup` render usable auth forms.
- A user can sign up with Supabase.
- A user can log in with Supabase.
- A logged-in user can access `/dashboard`.
- A logged-out user cannot access `/dashboard`.
- A logged-in user can log out.
- Dashboard shows placeholder cards for Documents, Usage, RAG Chat, and Settings.
- Missing Supabase env variables are handled safely.
- No service role key is exposed to the browser.
