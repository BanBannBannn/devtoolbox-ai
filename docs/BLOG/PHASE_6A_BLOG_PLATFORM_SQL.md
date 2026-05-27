# Phase 6A Blog Platform SQL

This SQL is planning-only. Do not run it in Phase 6A. Review it, convert it into a repo-managed migration if desired, then apply it in Phase 6B.

## SQL Plan

```sql
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

alter table public.profiles
add column if not exists role text not null default 'user'
check (role in ('user', 'moderator', 'admin'));

-- Role safety note:
-- Normal users must not be able to edit profiles.role through RLS or profile
-- update actions. Role changes should be admin-only and verified server-side.
-- Client-provided role must never be trusted.

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  slug text not null unique check (char_length(slug) between 1 and 140),
  excerpt text check (excerpt is null or char_length(excerpt) <= 300),
  content_json jsonb not null default '{}'::jsonb,
  content_text text not null default '',
  cover_image_url text,
  status text not null default 'draft' check (
    status in ('draft', 'pending_review', 'published', 'rejected', 'archived')
  ),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  rejection_reason text check (
    rejection_reason is null or char_length(rejection_reason) <= 1000
  ),
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;
create trigger set_blog_posts_updated_at
before update on public.blog_posts
for each row
execute function public.set_updated_at();

create table if not exists public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 40),
  slug text not null unique check (char_length(slug) > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.blog_post_tags (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id uuid not null references public.blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table if not exists public.blog_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (post_id, user_id)
);

create table if not exists public.blog_post_bookmarks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (post_id, user_id)
);

create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.blog_comments(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  status text not null default 'visible' check (
    status in ('visible', 'hidden', 'removed', 'pending_review')
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_blog_comments_updated_at on public.blog_comments;
create trigger set_blog_comments_updated_at
before update on public.blog_comments
for each row
execute function public.set_updated_at();

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  reason text not null check (
    reason in (
      'spam',
      'harassment',
      'hate',
      'sexual_content',
      'violence',
      'misinformation',
      'copyright',
      'other'
    )
  ),
  details text check (details is null or char_length(details) <= 1000),
  status text not null default 'open' check (
    status in ('open', 'reviewed', 'dismissed', 'action_taken')
  ),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.blog_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  storage_path text not null,
  alt_text text,
  created_at timestamptz not null default timezone('utc', now())
);
```

## Indexes

```sql
create index if not exists blog_posts_status_published_at_idx
on public.blog_posts (status, published_at desc);

create index if not exists blog_posts_author_status_updated_idx
on public.blog_posts (author_id, status, updated_at desc);

create index if not exists blog_posts_slug_idx
on public.blog_posts (slug);

create index if not exists blog_posts_status_submitted_idx
on public.blog_posts (status, submitted_at asc);

create index if not exists blog_tags_slug_idx
on public.blog_tags (slug);

create index if not exists blog_post_likes_post_id_idx
on public.blog_post_likes (post_id);

create index if not exists blog_post_bookmarks_user_created_idx
on public.blog_post_bookmarks (user_id, created_at desc);

create index if not exists blog_comments_post_created_idx
on public.blog_comments (post_id, created_at asc);

create index if not exists blog_comments_parent_id_idx
on public.blog_comments (parent_id);

create index if not exists content_reports_status_created_idx
on public.content_reports (status, created_at asc);

create index if not exists content_reports_target_idx
on public.content_reports (target_type, target_id);
```

## Full Text Search Planning
MVP may start with simple title/tag filtering.

Future search options:

```sql
-- Optional future search column/index. Review before running.
-- alter table public.blog_posts
-- add column if not exists search_vector tsvector
-- generated always as (
--   setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
--   setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
--   setweight(to_tsvector('english', coalesce(content_text, '')), 'C')
-- ) stored;
--
-- create index if not exists blog_posts_search_vector_idx
-- on public.blog_posts using gin (search_vector);
```

## RLS Planning
Enable RLS:

```sql
alter table public.blog_posts enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_post_tags enable row level security;
alter table public.blog_post_likes enable row level security;
alter table public.blog_post_bookmarks enable row level security;
alter table public.blog_comments enable row level security;
alter table public.content_reports enable row level security;
alter table public.blog_images enable row level security;
```

Role helper planning:

```sql
-- Planning helper. Review security definer behavior before applying.
-- create or replace function public.current_user_role()
-- returns text
-- language sql
-- stable
-- security definer
-- set search_path = public
-- as $$
--   select coalesce(
--     (select profiles.role from public.profiles where profiles.id = auth.uid()),
--     'user'
--   );
-- $$;
--
-- create or replace function public.current_user_is_moderator_or_admin()
-- returns boolean
-- language sql
-- stable
-- security definer
-- set search_path = public
-- as $$
--   select public.current_user_role() in ('moderator', 'admin');
-- $$;
```

Policy plan:

- Public can read only `blog_posts.status = 'published'`.
- Authors can read their own posts.
- Authors can insert their own posts as `draft`.
- Authors can update own `draft` and `rejected` posts.
- Authors can submit own `draft`/`rejected` posts for review through server-side action.
- Authors cannot directly set `published` or `archived`.
- Moderators/admins can read pending/rejected/published/archived posts.
- Moderators/admins can approve/reject/archive through server-side actions.
- Public can read tags.
- `blog_post_tags` public reads should reveal relationships only for published posts.
- Authors can manage tags only for their own `draft` and `rejected` posts.
- Moderators/admins may manage tags during moderation if needed.
- Logged-in users can like/bookmark only published posts.
- Logged-in users can delete their own likes/bookmarks.
- Users can read only their own bookmarks.
- Public can read visible comments on published posts.
- Logged-in users can insert comments only on published posts.
- Users can update/delete their own comments when allowed.
- Moderators/admins can hide/remove comments.
- Logged-in users can create reports.
- Users can read their own reports.
- Moderators/admins can read and resolve reports.
- Admins can manage roles.
- Users cannot self-promote.

Polymorphic report target note:

- `content_reports.target_type` + `content_reports.target_id` is polymorphic.
- `target_id` cannot have a normal foreign key to both `blog_posts` and `blog_comments`.
- Server actions must validate target existence before inserting a report.
- For `target_type = 'post'`, `target_id` must reference a published `blog_posts` row.
- For `target_type = 'comment'`, `target_id` must reference a visible `blog_comments` row whose post is published.
- Users cannot report unpublished/private content.

Comment nesting note:

- MVP supports top-level comments and optionally one-level replies only.
- Server actions must reject replies to replies.
- If `parent_id` is provided, the parent comment must be `visible` and have `parent_id is null`.

Slug stability note:

- Slugs are unique.
- Published slugs should be treated as stable to protect SEO links.
- Authors should not freely change a slug after publish.
- If a published slug must change later, add redirect planning in a future phase.

Prefer server-side actions/routes for status transitions and role changes. Do not rely on client-provided role or user ID.

## Optional Future Share Analytics
Not required for MVP:

```sql
-- create table public.blog_post_shares (
--   id uuid primary key default gen_random_uuid(),
--   post_id uuid not null references public.blog_posts(id) on delete cascade,
--   user_id uuid references auth.users(id) on delete set null,
--   channel text not null,
--   created_at timestamptz not null default timezone('utc', now())
-- );
```

## Storage Planning
Create Supabase Storage bucket:

- `blog-images`

Rules:

- JPEG/PNG/WebP only.
- 2MB or 5MB max.
- No SVG in MVP unless sanitized.
- Paths should use `userId/postId/fileName`.
- Server-side upload policy should verify user owns the post or is moderator/admin.
