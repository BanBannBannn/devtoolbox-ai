# Phase 1 Auth Dashboard QA

## Preflight
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`.
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] No service role key is used in browser code.
- [ ] Supabase project auth settings are known, including whether email confirmation is required.
- [ ] Existing public site can still build before auth testing.

## Signup
- [ ] `/signup` loads while logged out.
- [ ] Signup form has accessible email and password labels.
- [ ] Empty email/password shows a helpful error.
- [ ] Invalid email shows a helpful error.
- [ ] Weak password or provider rejection shows a user-safe error.
- [ ] Successful signup shows the expected next step.
- [ ] If email confirmation is enabled, the page tells the user to check email.
- [ ] `/signup` links to `/login`.

## Login
- [ ] `/login` loads while logged out.
- [ ] Login form has accessible email and password labels.
- [ ] Empty email/password shows a helpful error.
- [ ] Invalid credentials show a user-safe error.
- [ ] Successful login redirects to `/dashboard`.
- [ ] `/login` links to `/signup`.
- [ ] Logged-in users visiting `/login` redirect to `/dashboard` if implemented.

## Logout
- [ ] Logged-in dashboard shows a logout action.
- [ ] Logout signs the user out.
- [ ] Logout redirects to `/login` or `/`.
- [ ] After logout, `/dashboard` is no longer accessible.
- [ ] Logout does not log auth tokens or full session data.

## Protected Dashboard
- [ ] Logged-out user visiting `/dashboard` redirects to `/login`.
- [ ] Logged-in user visiting `/dashboard` can see the dashboard shell.
- [ ] Dashboard shows placeholder cards:
  - [ ] Documents
  - [ ] Usage
  - [ ] RAG Chat
  - [ ] Settings
- [ ] Placeholder cards clearly say the features are coming in later phases.
- [ ] Dashboard does not expose documents CRUD.
- [ ] Dashboard does not expose vectorization.
- [ ] Dashboard does not expose RAG chat.
- [ ] Dashboard does not expose usage limit enforcement.

## Public Routes Still Accessible
While logged out, verify:

- [ ] `/` loads.
- [ ] `/tools` loads.
- [ ] Available tool pages load.
- [ ] `/blog` loads.
- [ ] Blog post pages load.
- [ ] `/about` loads.
- [ ] `/contact` loads.
- [ ] `/privacy-policy` loads.
- [ ] `/terms` loads.
- [ ] Existing public tools still work without login.

## Missing Environment Behavior
- [ ] Missing `NEXT_PUBLIC_SUPABASE_URL` fails safely.
- [ ] Missing `NEXT_PUBLIC_SUPABASE_ANON_KEY` fails safely.
- [ ] Auth pages show a clear configuration error or disable the form safely.
- [ ] Public tools do not crash because Supabase env variables are missing.
- [ ] Build does not expose private keys.

## Security
- [ ] Auth session is read server-side where possible.
- [ ] Dashboard protection does not trust user ID from the client.
- [ ] Auth actions do not trust user email as proof of identity.
- [ ] No service role key appears in client bundles.
- [ ] Auth tokens are not logged.
- [ ] Full session objects are not logged.
- [ ] Error messages do not expose provider internals.

## Mobile Layout
- [ ] `/login` works on mobile width.
- [ ] `/signup` works on mobile width.
- [ ] `/dashboard` cards stack cleanly on mobile.
- [ ] Buttons are easy to tap.
- [ ] Form fields do not overflow.
- [ ] Error messages do not overlap controls.
- [ ] Header/footer remain usable with auth pages.

## Checks
- [ ] `npm run test:run` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

## Regression Guardrails
- [ ] No documents tables were added unless explicitly required for minimal auth setup.
- [ ] No vector storage was added.
- [ ] No RAG chat API was added.
- [ ] No OpenRouter behavior was changed.
- [ ] No existing tool page was modified unless absolutely necessary for navigation.
