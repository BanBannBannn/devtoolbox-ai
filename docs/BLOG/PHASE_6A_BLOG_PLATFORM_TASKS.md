# Phase 6A Blog Platform Tasks

## Purpose
Break the developer knowledge publishing platform into safe implementation phases.

Phase 6A is planning only. Do not implement runtime code, run SQL, change RAG behavior, or modify public tools in this phase.

## Current App Surface
Existing public routes:

- `/`
- `/blog`
- `/blog/[slug]`
- `/tools`
- individual `/tools/*`
- `/about`
- `/contact`
- `/privacy-policy`
- `/terms`

Existing dashboard/workspace routes:

- `/dashboard`
- `/dashboard/documents`
- `/dashboard/documents/new`
- `/dashboard/documents/[id]`
- `/dashboard/rag-chat`
- `/dashboard/rag-chat/[sessionId]`
- `/dashboard/usage`
- `/dashboard/admin/rag-settings`

Phase 6 should extend these surfaces instead of replacing them.

## Phase 6B: SQL Schema + Roles Foundation
- Review and apply SQL from `PHASE_6A_BLOG_PLATFORM_SQL.md`.
- Add `profiles.role` with default `user`.
- Add safe role helpers.
- Add server-side role checks.
- Add tests for role parsing and permission checks.
- Verify `profiles.role` cannot be edited by normal users through RLS or profile update actions.
- Do not expose role changes to normal users.
- Do not create public blog writes yet.

Acceptance:

- Users have `role = user` by default.
- Admin/moderator checks are server-side.
- Users cannot self-promote.
- Client-provided role is ignored everywhere.

## Phase 6C: Public Blog List/Detail For Published Posts
- Replace or extend markdown-only blog data source with database-backed published posts.
- Keep existing static markdown blog posts until migration is deliberate.
- Public `/blog` reads only `published` posts.
- Public `/blog/[slug]` reads only `published` posts.
- Add `/blog/tags/[slug]`.
- Ensure sitemap includes only published posts.
- Add safe SEO metadata.
- Treat published slugs as stable. If a published slug must change, plan redirects in a later phase.
- Public author display should use safe profile fields such as display name/avatar, not private email by default.

Acceptance:

- Draft/pending/rejected/archived posts are not publicly reachable.
- Published posts show title, excerpt, author, date, tags, content, and share UI.

## Phase 6D: Writer Dashboard With Tiptap Draft Editor
- Add `/dashboard/blog`.
- Add `/dashboard/blog/new`.
- Add `/dashboard/blog/[id]/edit`.
- Add `/dashboard/blog/[id]/preview`.
- Add Tiptap editor.
- Store `content_json`.
- Extract and store `content_text`.
- Support save draft.
- Support submit for review.
- Validate title, slug, excerpt, content, and tags server-side.
- Enforce recommended MVP limits: title 1-120, slug 1-140, excerpt max 300, tag name 1-40.
- Prevent authors from freely changing slugs after publish.

Acceptance:

- Users can manage their own drafts.
- Users cannot edit another user's posts.
- Users cannot publish directly.

## Phase 6E: Submit/Review/Publish Moderation Workflow
- Add `/dashboard/moderation/blog`.
- Add pending post queue.
- Add moderation preview.
- Add approve/publish action.
- Add reject with reason action.
- Add archive/unpublish action.
- Show status badges.

Acceptance:

- Moderators/admins can publish/archive.
- Users can see rejection reason for their own rejected posts.
- Non-moderators cannot access moderation routes.

## Phase 6F: Likes And Bookmarks
- Add like toggle for published posts.
- Add bookmark toggle for published posts.
- Add like count.
- Add `/dashboard/bookmarks`.
- Enforce one like/bookmark per user per post with unique constraints.

Acceptance:

- Logged-in users can like/bookmark published posts.
- Logged-out users see login CTA.
- Users cannot like/bookmark unpublished posts.
- Bookmarks remain private to the user.

## Phase 6G: Comments
- Add visible comments on published posts.
- Add comment form for logged-in users.
- Add login CTA for logged-out users.
- Add edit/delete own comment if allowed.
- Add one-level replies only if needed.
- Reject replies to replies server-side.
- If `parent_id` is provided, verify the parent comment is visible and top-level.
- Add server-side validation and length limits.

Acceptance:

- Comments only exist on published posts.
- Visible comments are public.
- Hidden/removed comments are not public.
- Users cannot edit/delete other users' comments.
- Comment content is 1-2000 characters.

## Phase 6H: Reports And Moderation Queues
- Add report post/comment controls.
- Add `/dashboard/moderation/reports`.
- Add `/dashboard/moderation/comments`.
- Add review/dismiss/action_taken report status changes.
- Add hide/remove comment actions.
- Validate polymorphic report targets server-side before insert.
- For post reports, target must be a published post.
- For comment reports, target must be a visible comment on a published post.
- Enforce report details max 1000 characters.

Acceptance:

- Logged-in users can report published posts or visible comments.
- Users cannot report unpublished/private content.
- Reports are private.
- Moderators/admins can resolve reports.
- Users cannot resolve their own reports.

## Phase 6I: Image Upload And Cover Images
- Create Supabase Storage bucket `blog-images`.
- Add cover image upload.
- Add optional inline image tracking through `blog_images`.
- Restrict file type and size.
- Store under `userId/postId/fileName`.
- Add alt text.

Acceptance:

- Public post rendering shows safe images.
- Storage secrets are not exposed.
- SVG is not accepted unless sanitized in a later phase.

## Phase 6J: Admin User Role Management
- Add `/dashboard/admin/users`.
- List users/profiles.
- Allow admins to set role to `user`, `moderator`, or `admin`.
- Prevent admins from accidentally demoting the last admin if possible.
- Re-check admin role server-side in actions.
- Ensure profile edit flows cannot update role for normal users.

Acceptance:

- Only admins manage roles.
- Users cannot change their own role.
- Moderators cannot manage roles.

## Phase 6K: SEO/Search/Share Polish
- Add blog tag pages and optional search.
- Add title/excerpt/canonical/Open Graph image metadata.
- Add published time, author, and tags metadata.
- Add copy-link and native Web Share API.
- Optionally add social share links.
- Keep share analytics out unless explicitly implemented.

Acceptance:

- Only published posts are indexable.
- Draft/pending/rejected/archived posts are excluded from sitemap.
- Share UI works without requiring a database.

## Cross-Cutting Security Tasks
- Never trust `user_id` from the client.
- Never trust role from the client.
- Keep service role key server-only.
- Keep API keys server-only.
- Sanitize/render editor content safely.
- Avoid `dangerouslySetInnerHTML` unless content is sanitized and reviewed.
- Add safe `rel` attributes to external links.
- Rate-limit comments/reports later.
- Keep reports/moderation notes private.
- Keep public author display limited to safe profile fields.
- Validate report targets because `content_reports.target_id` is polymorphic and has no normal FK.

## Implementation Guardrails
- Do not change RAG Chat behavior while implementing blog phases.
- Do not remove existing public tools.
- Do not expose model names.
- Do not expose private drafts.
- Do not index unpublished content.
