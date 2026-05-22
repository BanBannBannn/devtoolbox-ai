# Phase 3 Usage Limits Tasks

## Goal
Implement database-driven usage limits for the authenticated dashboard without adding vectorization or RAG chat yet.

## 1. Apply Database SQL
- Review `docs/RAG/PHASE_3_USAGE_LIMITS_SQL.md`.
- Apply the SQL in Supabase SQL Editor or convert it into the repo's migration flow.
- Confirm `profiles`, `plan_limits`, and `usage_events` exist.
- Confirm the `free` plan seed row exists.
- Confirm RLS is enabled on all three tables.
- Confirm the profile creation trigger exists.

## 2. Add Type Definitions
Create or extend server-side types for:

- `Profile`
- `PlanLimits`
- `UsageEvent`
- `UsageEventType`
- `UsageSummary`

Keep types close to the data access layer so server actions and pages can share them.

## 3. Add Limits And Usage Helpers
Add server-side helpers for:

- Getting the current authenticated Supabase user.
- Getting the current user's profile.
- Getting the current user's active plan limits.
- Creating or checking a profile for pre-existing users if needed.
- Calculating current month `period_start` in UTC.
- Counting usage by `event_type`.
- Reading current saved document count.
- Checking max saved documents.
- Checking max document length.
- Recording a usage event.
- Building a usage summary for dashboard display.

Suggested helper names:

- `getCurrentUserProfileAndPlan`
- `getCurrentMonthPeriodStartUtc`
- `countUsageByEventType`
- `getUsageSummary`
- `checkDocumentCountLimit`
- `checkMaxDocumentLength`
- `recordUsageEvent`

## 4. Update Documents CRUD
Replace Phase 2 temporary constants with database limits:

- Use `plan_limits.max_document_characters` for create and update validation.
- Use `plan_limits.max_saved_documents` before create.
- Keep `character_count = content.length`.
- Keep `user_id` derived from the authenticated session.
- Keep vector metadata reset behavior when content changes.
- Optionally record a `document_created` usage event after successful document creation.

Do not add vectorization behavior.

## 5. Add Usage Dashboard UI
Add a dashboard usage view or card:

- Suggested route: `/dashboard/usage`.
- Link to it from the existing dashboard Usage placeholder card.
- Show current plan.
- Show saved documents used and remaining.
- Show max document characters.
- Show future monthly RAG message limit.
- Show future monthly vectorize job limit.
- Show future chunk and output token limits.
- Clearly label RAG/vector limits as reserved for later phases.

## 6. Add Tests
Add focused tests around pure helper logic where possible:

- Current month period starts in UTC.
- Usage quantities sum correctly.
- Document count limit allows under-limit users.
- Document count limit rejects users at limit.
- Document length limit allows valid content.
- Document length limit rejects over-limit content.
- Unknown or inactive plan fails clearly.

For Supabase queries, prefer small helper boundaries that can be tested without a real database when practical.

## 7. Manual QA
Use `docs/RAG/PHASE_3_USAGE_LIMITS_QA.md`.

Minimum checks:

- New logged-in user gets a profile.
- Existing logged-in user can be backfilled.
- Documents CRUD still works.
- Overlong document validation uses the database plan limit.
- Max saved document validation uses the database plan limit.
- Usage page is protected.
- Public tools still work while logged out.

## 8. Verification Commands
After implementation:

- `npm run test:run`
- `npm run lint`
- `npm run build`

## Stop Conditions
Stop and fix before proceeding if:

- The app can create documents without reading plan limits.
- A user can change their own `plan_key` from browser-accessible code.
- RLS allows one user to read another user's profile or usage events.
- Public tools require login.
- Vectorization, document chunks, or RAG chat are accidentally added in Phase 3.
