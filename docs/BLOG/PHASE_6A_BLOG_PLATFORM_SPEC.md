# Phase 6A Blog Platform Spec

## Goal
Plan DevToolBox AI as a developer knowledge platform where public blog/community content is a primary feature, dashboard RAG Chat remains an AI workspace feature, and existing developer tools become secondary utilities.

Phase 6A is documentation/spec only. It does not implement runtime code, run SQL, change RAG behavior, add editor/image upload, or modify public tools.

## Product Direction
DevToolBox AI should support three connected product surfaces:

1. Public developer knowledge platform
   - Browse and read developer articles.
   - Search/filter by tag.
   - Share useful posts.
   - See author, date, tags, likes, and comments.

2. Authenticated creator/community layer
   - Logged-in users can write and manage drafts.
   - Users submit posts for review.
   - Moderators/admins approve, reject, archive, and moderate comments/reports.
   - Logged-in users can like, bookmark, comment, and report.

3. Dashboard AI workspace
   - Users save documents.
   - Users vectorize documents.
   - Users chat with their own knowledge base through RAG.

Existing developer tools remain available as useful utilities, but they are no longer the main product promise.

## Roles
Roles:

- `user`
- `moderator`
- `admin`

Role rules:

- Users can write and manage their own drafts.
- Users can submit their own posts for review.
- Users can edit own draft/rejected posts.
- Users cannot directly publish.
- Users can like, bookmark, comment, and report.
- Moderators can review pending posts, approve, reject, and archive public posts.
- Moderators can hide/remove comments.
- Moderators can review content reports.
- Admins can do everything moderators can do.
- Admins can manage user roles.
- Users cannot change their own role.
- Role changes must be server-side protected.
- `profiles.role` must not be editable by normal users.
- Existing profile RLS and server actions must not allow users to self-promote.
- Client-provided role must never be trusted.

## Post Lifecycle
Post statuses:

- `draft`
- `pending_review`
- `published`
- `rejected`
- `archived`

Status rules:

- `draft` is private to the author.
- `pending_review` is visible to the author, moderator, and admin.
- `published` is public.
- `rejected` is visible to the author, moderator, and admin.
- `archived` is hidden from public but visible to moderator/admin and author.
- Only moderator/admin can publish or archive posts.
- Rejected posts should store `rejection_reason`.
- Published post slugs should be treated as stable to avoid breaking SEO links.
- Authors should not freely change a slug after publish.
- If a published slug must change later, redirects should be considered in a separate phase.

## Comments
Comment statuses:

- `visible`
- `hidden`
- `removed`
- `pending_review` optional

Comment rules:

- Only logged-in users can comment.
- Comments can exist only on published posts.
- Users can edit/delete their own comments while allowed by status.
- Moderators/admins can hide/remove comments.
- MVP supports top-level comments and optionally one-level replies.
- Server actions must reject replies to replies.
- If `parent_id` is provided, the parent comment must be visible and must have `parent_id = null`.
- Infinite nested comments are out of scope for MVP.

## Reports
Report statuses:

- `open`
- `reviewed`
- `dismissed`
- `action_taken`

Report target types:

- `post`
- `comment`

Report reasons:

- `spam`
- `harassment`
- `hate`
- `sexual_content`
- `violence`
- `misinformation`
- `copyright`
- `other`

Report rules:

- `content_reports` uses polymorphic target fields: `target_type` plus `target_id`.
- Because `target_id` cannot have a normal foreign key to multiple target tables, server actions must validate target existence before inserting a report.
- For `target_type = post`, `target_id` must reference a published `blog_posts` row.
- For `target_type = comment`, `target_id` must reference a visible `blog_comments` row on a published post.
- Logged-in users can report published posts or visible comments.
- Users cannot report unpublished/private content.
- Users cannot resolve their own reports.
- Moderators/admins can review reports.
- Reports are not public.
- Report details are private to moderators/admins.

## Validation Limits
Recommended MVP validation limits:

- Title: 1 to 120 characters.
- Slug: 1 to 140 characters.
- Excerpt: max 300 characters.
- Comment content: 1 to 2000 characters.
- Report details: max 1000 characters.
- Rejection reason: max 1000 characters.
- Tag name: 1 to 40 characters.

## Likes
- Logged-in users can like published posts.
- Likes are toggleable.
- One like per user per post.
- Public post pages can show like count.
- Users cannot like unpublished posts.

## Bookmarks
- Logged-in users can bookmark published posts.
- Bookmarks are toggleable.
- One bookmark per user per post.
- Users can view saved/bookmarked posts in dashboard.
- Bookmarks are private to that user.

## Sharing
MVP sharing should not require a database.

Public post share UI:

- Copy link.
- Native Web Share API when available.
- Optional social share links for X, Facebook, and LinkedIn.

Sharing should only use public published post URLs. A future `blog_post_shares` table can track share analytics, but it is not required for MVP.

## Editor Recommendation
Recommend a polished block-based editor for rich text editing. Phase 6D uses
BlockNote because it gives the writer dashboard a more complete Notion/Medium
style editing experience out of the box while still storing structured editor
JSON instead of unsafe raw HTML.

Storage plan:

- Store editor document JSON in `content_json`.
- Store extracted plaintext in `content_text` for search, SEO, and moderation.

Future editor capabilities:

- Headings.
- Links.
- Quotes.
- Lists.
- Code blocks.
- Tables.
- Images.
- Code block language labels and copy button later.

Phase 6A does not implement the editor.

## Image Upload Planning
Use Supabase Storage bucket:

- `blog-images`

Rules:

- Allow JPEG, PNG, and WebP.
- Suggested max file size: 2MB or 5MB.
- Do not allow SVG in MVP unless sanitized.
- Store files under `userId/postId/fileName`.
- Store cover image URL on `blog_posts.cover_image_url`.
- Track inline editor images in optional `blog_images`.
- Public rendering must not expose storage secrets.

## Routes
Public:

- `/blog`
- `/blog/[slug]`
- `/blog/tags/[slug]`
- optional `/blog/search`

Writer dashboard:

- `/dashboard/blog`
- `/dashboard/blog/new`
- `/dashboard/blog/[id]/edit`
- `/dashboard/blog/[id]/preview`
- `/dashboard/bookmarks`

Moderation:

- `/dashboard/moderation/blog`
- `/dashboard/moderation/comments`
- `/dashboard/moderation/reports`

Admin:

- `/dashboard/admin/users`

## Public Post UI
Published post pages should include:

- Title.
- Excerpt.
- Author.
- Safe author display information when available, such as display name and avatar.
- Published date.
- Tags.
- Cover image.
- Content.
- Code blocks.
- Like button/count.
- Bookmark button.
- Share button/copy link.
- Comments section.
- Report post button.

## Comment UI
- List visible comments.
- Add comment box for logged-in users.
- Login CTA for logged-out users.
- Edit/delete own comment.
- Report comment.
- Moderator hide/remove actions only in moderation/admin UI or gated controls.

## Moderation UI
- Pending post queue.
- Post preview.
- Approve and publish.
- Reject with reason.
- Archive/unpublish action.
- Reports queue.
- Comment moderation queue.
- Safe status badges.

## SEO
- Blog posts should have title, description/excerpt, canonical URL, Open Graph image, published time, author, and tags.
- Slugs should be unique and stable.
- Published slugs should be treated as stable.
- If a published slug changes, redirects should be considered in a later phase.
- Only published posts should appear in sitemap.
- Draft, rejected, pending, and archived posts should not be indexed.

## Security
- Never trust `user_id` or role from the client.
- Never expose service role key.
- Never expose API keys.
- Sanitize/render editor content safely.
- Avoid raw unsafe HTML.
- Public routes should only show published posts.
- Public posts should not expose private author data or email unless explicitly intended.
- Private drafts must not be accessible by guessing UUID or slug.
- Reports and moderation notes must not be public.
- Report details should not expose reporter info publicly.
- Rate limiting should be considered for comments, likes, bookmarks, and reports.
- Prevent duplicate likes/bookmarks with unique constraints.
- Do not allow users to report or comment on unpublished posts.
- Do not allow XSS through blog content, comments, images, links, or embeds.
- External links should use safe `rel` attributes.

## Abuse And Rate Limits
Plan for:

- Comment creation rate limits.
- Report creation rate limits.
- Like/bookmark unique constraints and spam-resistant server handlers.
- Fast moderation actions to hide harmful content.

Do not implement rate limiting in Phase 6A unless a project-wide pattern already exists.

## Out Of Scope
- Actual editor implementation.
- Actual image upload implementation.
- Actual like/comment/report implementation.
- Infinite nested comments.
- Notifications.
- Email alerts.
- AI writing assistant.
- Paid plans.
- Benchmark execution.
- Public embeddable chatbox.
- Changing RAG behavior.
- Analytics-heavy share tracking.

## Recommended Implementation Phases
- Phase 6B: SQL schema + roles foundation.
- Phase 6C: Public blog list/detail for published posts.
- Phase 6D: Writer dashboard with block-based draft editor.
- Phase 6E: Submit/review/publish moderation workflow.
- Phase 6F: Likes and bookmarks.
- Phase 6G: Comments.
- Phase 6H: Reports and moderation queues.
- Phase 6I: Image upload and cover images.
- Phase 6J: Admin user role management.
- Phase 6K: SEO/search/share polish.
