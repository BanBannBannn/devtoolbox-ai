# Phase 6A Blog Platform QA

## Planning Scope
- [ ] Docs define DevToolBox AI as a developer knowledge platform.
- [ ] Docs keep RAG Chat as a dashboard AI workspace feature.
- [ ] Docs keep tools as secondary utilities.
- [ ] Docs do not implement runtime code.
- [ ] Docs do not run SQL.
- [ ] Docs do not change RAG behavior.
- [ ] Docs do not remove public tools.

## Roles
- [ ] Roles are defined: `user`, `moderator`, `admin`.
- [ ] Users can write/manage own drafts.
- [ ] Users can submit own posts for review.
- [ ] Users cannot publish directly.
- [ ] Moderators can approve/reject/archive posts.
- [ ] Moderators can hide/remove comments.
- [ ] Moderators can review reports.
- [ ] Admins can manage roles.
- [ ] Users cannot change their own role.
- [ ] Role changes are server-side protected.
- [ ] `profiles.role` is not editable by normal users.
- [ ] Existing `profiles` policies are reviewed with the Phase 6B preflight query before adding `profiles.role`.
- [ ] After Phase 6B SQL is applied, default user role is `user`.
- [ ] Phase 6B role helper foundation exists for parsing roles, moderator/admin checks, blog moderation permission, and admin-only role management permission.
- [ ] Existing profile update flows do not allow self-promotion.
- [ ] Role helper functions revoke execute from `public` and grant execute only to `authenticated`.
- [ ] Client-provided role is never trusted.

## Post Lifecycle
- [ ] Post statuses are defined: `draft`, `pending_review`, `published`, `rejected`, `archived`.
- [ ] Drafts are private to author.
- [ ] Pending posts are visible only to author/moderator/admin.
- [ ] Published posts are public.
- [ ] Rejected posts store `rejection_reason`.
- [ ] `rejection_reason` max length is 1000 characters.
- [ ] Archived posts are hidden from public.
- [ ] Only moderator/admin can publish/archive.
- [ ] Published slugs are treated as stable.
- [ ] Authors cannot freely change slug after publish.
- [ ] Redirects are planned for any future published slug change.

## Community Interactions
- [ ] Logged-in users can like published posts.
- [ ] Like is toggleable.
- [ ] One like per user per post.
- [ ] Logged-in users can bookmark published posts.
- [ ] Bookmark is toggleable.
- [ ] One bookmark per user per post.
- [ ] Bookmarks are private.
- [ ] Logged-in users can comment on published posts.
- [ ] Normal users cannot change comment moderation status through comment edits.
- [ ] MVP comments avoid infinite nesting.
- [ ] Server actions reject replies to replies.
- [ ] Reply parent must be visible and top-level.
- [ ] Comment content is 1 to 2000 characters.
- [ ] Logged-in users can report published posts or visible comments.
- [ ] Report target existence is validated server-side before insert.
- [ ] Post reports can target only published posts.
- [ ] Comment reports can target only visible comments on published posts.
- [ ] Users cannot report unpublished/private content.
- [ ] Report details max length is 1000 characters.
- [ ] Report reasons and statuses are defined.
- [ ] Reports are private to reporter/moderator/admin.

## Sharing
- [ ] Share behavior requires no DB in MVP.
- [ ] Public posts can offer copy-link.
- [ ] Public posts can use native Web Share API when available.
- [ ] Optional social share links are documented.
- [ ] Sharing uses only public published post URLs.
- [ ] Share analytics is documented as optional future work.

## Editor And Images
- [ ] A polished block-based editor is used for rich text editing.
- [ ] `content_json` stores editor document JSON.
- [ ] `content_text` stores extracted plaintext.
- [ ] Blog image bucket is planned as `blog-images`.
- [ ] JPEG/PNG/WebP are allowed.
- [ ] SVG is excluded from MVP unless sanitized.
- [ ] Storage paths are planned as `userId/postId/fileName`.
- [ ] Normal users can delete only images attached to their own draft/rejected posts.
- [ ] Normal users cannot delete images attached to published posts.

## SQL Planning
- [ ] `profiles.role` is planned.
- [ ] Phase 6B implementation SQL exists for `profiles.role`.
- [ ] `blog_posts` is planned.
- [ ] `blog_tags` is planned.
- [ ] `blog_post_tags` is planned.
- [ ] `blog_post_likes` is planned.
- [ ] `blog_post_bookmarks` is planned.
- [ ] `blog_comments` is planned.
- [ ] `content_reports` is planned.
- [ ] `blog_images` is planned.
- [ ] Optional future `blog_post_shares` is documented.
- [ ] Required indexes are documented.
- [ ] Phase 6B implementation SQL includes table creation, indexes, and RLS policies.
- [ ] Full text search planning is documented.
- [ ] Title length limit is 1 to 120 characters.
- [ ] Slug length limit is 1 to 140 characters.
- [ ] Excerpt max length is 300 characters.
- [ ] Tag name length limit is 1 to 40 characters.

## RLS And Security
- [ ] Public can read only published posts.
- [ ] After Phase 6B SQL is applied, public users cannot read draft, pending, rejected, or archived posts.
- [ ] Authors can read own posts.
- [ ] Authors can insert drafts.
- [ ] Authors can update own draft/rejected posts.
- [ ] Authors cannot directly publish.
- [ ] Moderators/admins can review and moderate.
- [ ] Public can read tags.
- [ ] Public post-tag reads reveal relationships only for published posts.
- [ ] Public routes show only tags connected to published posts.
- [ ] Authors can manage tags only for own draft/rejected posts.
- [ ] Moderators/admins may manage tags during moderation.
- [ ] Public can read visible comments on published posts.
- [ ] Users can read only their own bookmarks.
- [ ] Users can create/read their own reports.
- [ ] Moderators/admins can read/resolve reports.
- [ ] Admins can manage roles.
- [ ] Users cannot self-promote.
- [ ] After Phase 6B SQL is applied, normal users cannot self-promote by updating `profiles.role`.
- [ ] Role helper tests verify invalid roles fall back to `user` and never gain moderator/admin privileges.
- [ ] Role helper functions are not executable by anonymous/public callers unless explicitly reviewed.
- [ ] Normal users cannot update comment status away from `visible`.
- [ ] Blog image delete policies do not let normal users break published posts.
- [ ] Public like/comment counts use a future server-side aggregate/RPC/view instead of exposing all like/bookmark rows.
- [ ] Client-provided `user_id` is never trusted.
- [ ] Client-provided role is never trusted.
- [ ] Public author display uses safe profile fields only.
- [ ] Public author display does not expose private data or email unless explicitly intended.
- [ ] Service role key is never exposed.
- [ ] API keys are never exposed.
- [ ] Drafts/reports/moderation notes cannot leak publicly.
- [ ] Blog content/comments/images/links are rendered safely against XSS.

## Routes
- [ ] Public `/blog` is planned.
- [ ] Public `/blog/[slug]` is planned.
- [ ] Public `/blog/tags/[slug]` is planned.
- [ ] Optional `/blog/search` is planned.
- [ ] Writer `/dashboard/blog` is planned.
- [ ] Writer `/dashboard/blog/new` is planned.
- [ ] Writer `/dashboard/blog/[id]/edit` is planned.
- [ ] Writer `/dashboard/blog/[id]/preview` is planned.
- [ ] `/dashboard/bookmarks` is planned.
- [ ] Moderation blog queue is planned.
- [ ] Moderation comment queue is planned.
- [ ] Moderation reports queue is planned.
- [ ] Admin user role management is planned.

## SEO
- [ ] Published posts have title and excerpt metadata.
- [ ] Published posts have canonical URLs.
- [ ] Published posts can have Open Graph image.
- [ ] Published time, author, and tags are planned.
- [ ] Only published posts appear in sitemap.
- [ ] Draft/rejected/pending/archived posts are not indexed.

## Abuse Planning
- [ ] Comment rate limiting is documented for later.
- [ ] Report rate limiting is documented for later.
- [ ] Likes/bookmarks use unique constraints.
- [ ] Moderators can hide harmful content quickly.

## Out Of Scope Confirmation
- [ ] No actual editor implementation in Phase 6A.
- [ ] No actual image upload in Phase 6A.
- [ ] No actual likes/comments/reports in Phase 6A.
- [ ] No notifications.
- [ ] No email alerts.
- [ ] No AI writing assistant.
- [ ] No paid plans.
- [ ] No public embeddable chatbox.
- [ ] No RAG behavior changes.

## Verification Commands
- [ ] `npm run test:run`
- [ ] `npm run lint`
- [ ] `npm run build`
