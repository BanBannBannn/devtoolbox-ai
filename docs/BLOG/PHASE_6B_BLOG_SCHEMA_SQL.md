# Phase 6B Blog Schema SQL

This SQL prepares the database foundation for the DevToolBox AI blog/community platform. It is repo-managed implementation SQL for manual review and application in Supabase SQL Editor, or conversion into a formal migration.

Do not run this blindly in production. Review existing `profiles` policies first, especially any policy that could allow normal users to update `profiles.role`. This SQL must not be applied until the live `profiles` update policies have been reviewed.

## Profiles Policy Preflight

Run this read-only query in Supabase SQL Editor before applying the Phase 6B SQL:

```sql
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'profiles';
```

Expected project policy shape from repo docs:

- `Users can read own profile` for `select`.
- `Users can insert own free profile` for `insert`.
- No broad normal-user `update` policy on `profiles`.

If the live database has a broad policy such as `Users can update own profile`, do not continue until it is replaced with a safer profile-edit path that cannot update `role` or `plan_key`. Prefer server-side admin-only role changes in a later phase.

Example review-only replacement note:

```sql
-- Review only. Do not run unless this exact broad policy exists and you have
-- confirmed no browser profile update flow depends on it.
--
-- drop policy if exists "Users can update own profile" on public.profiles;
```

## SQL

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

comment on column public.profiles.role is
  'Blog platform role. Normal users must not be able to update this field. Role changes must be admin-only and server-side verified.';

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select profiles.role from public.profiles where profiles.id = auth.uid()),
    'user'
  );
$$;

create or replace function public.current_user_is_moderator_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('moderator', 'admin');
$$;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'admin';
$$;

revoke execute on function public.current_user_role() from public;
revoke execute on function public.current_user_is_moderator_or_admin() from public;
revoke execute on function public.current_user_is_admin() from public;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.current_user_is_moderator_or_admin() to authenticated;
grant execute on function public.current_user_is_admin() to authenticated;

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
  slug text not null unique check (char_length(slug) between 1 and 140),
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

comment on table public.content_reports is
  'Reports use polymorphic target_type + target_id. Server actions must validate that post targets are published posts and comment targets are visible comments on published posts before insert.';

create table if not exists public.blog_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  storage_path text not null,
  alt_text text,
  created_at timestamptz not null default timezone('utc', now())
);

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

## RLS SQL

```sql
alter table public.blog_posts enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_post_tags enable row level security;
alter table public.blog_post_likes enable row level security;
alter table public.blog_post_bookmarks enable row level security;
alter table public.blog_comments enable row level security;
alter table public.content_reports enable row level security;
alter table public.blog_images enable row level security;

drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts"
on public.blog_posts
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Authors can read own blog posts" on public.blog_posts;
create policy "Authors can read own blog posts"
on public.blog_posts
for select
to authenticated
using (author_id = auth.uid());

drop policy if exists "Moderators can read moderation blog posts" on public.blog_posts;
create policy "Moderators can read moderation blog posts"
on public.blog_posts
for select
to authenticated
using (public.current_user_is_moderator_or_admin());

drop policy if exists "Authors can insert own draft blog posts" on public.blog_posts;
create policy "Authors can insert own draft blog posts"
on public.blog_posts
for insert
to authenticated
with check (author_id = auth.uid() and status = 'draft');

drop policy if exists "Authors can update own draft rejected blog posts" on public.blog_posts;
create policy "Authors can update own draft rejected blog posts"
on public.blog_posts
for update
to authenticated
using (author_id = auth.uid() and status in ('draft', 'rejected'))
with check (
  author_id = auth.uid()
  and status in ('draft', 'pending_review', 'rejected')
  and reviewed_by is null
  and reviewed_at is null
  and published_at is null
);

drop policy if exists "Authors can delete own draft rejected blog posts" on public.blog_posts;
create policy "Authors can delete own draft rejected blog posts"
on public.blog_posts
for delete
to authenticated
using (author_id = auth.uid() and status in ('draft', 'rejected'));

drop policy if exists "Moderators can update blog posts" on public.blog_posts;
create policy "Moderators can update blog posts"
on public.blog_posts
for update
to authenticated
using (public.current_user_is_moderator_or_admin())
with check (public.current_user_is_moderator_or_admin());

drop policy if exists "Public can read blog tags" on public.blog_tags;
create policy "Public can read blog tags"
on public.blog_tags
for select
to anon, authenticated
using (true);

-- Tags are globally readable for tag pages and navigation.
-- Public routes should still display only tags connected to published posts.

drop policy if exists "Moderators can manage blog tags" on public.blog_tags;
create policy "Moderators can manage blog tags"
on public.blog_tags
for all
to authenticated
using (public.current_user_is_moderator_or_admin())
with check (public.current_user_is_moderator_or_admin());

drop policy if exists "Public can read published blog post tags" on public.blog_post_tags;
create policy "Public can read published blog post tags"
on public.blog_post_tags
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.blog_posts
    where blog_posts.id = blog_post_tags.post_id
      and blog_posts.status = 'published'
  )
);

drop policy if exists "Authors can read own blog post tags" on public.blog_post_tags;
create policy "Authors can read own blog post tags"
on public.blog_post_tags
for select
to authenticated
using (
  exists (
    select 1
    from public.blog_posts
    where blog_posts.id = blog_post_tags.post_id
      and blog_posts.author_id = auth.uid()
  )
);

drop policy if exists "Authors can manage own draft rejected blog post tags" on public.blog_post_tags;
create policy "Authors can manage own draft rejected blog post tags"
on public.blog_post_tags
for all
to authenticated
using (
  exists (
    select 1
    from public.blog_posts
    where blog_posts.id = blog_post_tags.post_id
      and blog_posts.author_id = auth.uid()
      and blog_posts.status in ('draft', 'rejected')
  )
)
with check (
  exists (
    select 1
    from public.blog_posts
    where blog_posts.id = blog_post_tags.post_id
      and blog_posts.author_id = auth.uid()
      and blog_posts.status in ('draft', 'rejected')
  )
);

drop policy if exists "Moderators can manage blog post tags" on public.blog_post_tags;
create policy "Moderators can manage blog post tags"
on public.blog_post_tags
for all
to authenticated
using (public.current_user_is_moderator_or_admin())
with check (public.current_user_is_moderator_or_admin());

drop policy if exists "Users can read own blog likes" on public.blog_post_likes;
create policy "Users can read own blog likes"
on public.blog_post_likes
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can like published blog posts" on public.blog_post_likes;
create policy "Users can like published blog posts"
on public.blog_post_likes
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.blog_posts
    where blog_posts.id = blog_post_likes.post_id
      and blog_posts.status = 'published'
  )
);

drop policy if exists "Users can delete own blog likes" on public.blog_post_likes;
create policy "Users can delete own blog likes"
on public.blog_post_likes
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read own blog bookmarks" on public.blog_post_bookmarks;
create policy "Users can read own blog bookmarks"
on public.blog_post_bookmarks
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can bookmark published blog posts" on public.blog_post_bookmarks;
create policy "Users can bookmark published blog posts"
on public.blog_post_bookmarks
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.blog_posts
    where blog_posts.id = blog_post_bookmarks.post_id
      and blog_posts.status = 'published'
  )
);

drop policy if exists "Users can delete own blog bookmarks" on public.blog_post_bookmarks;
create policy "Users can delete own blog bookmarks"
on public.blog_post_bookmarks
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Public can read visible comments on published posts" on public.blog_comments;
create policy "Public can read visible comments on published posts"
on public.blog_comments
for select
to anon, authenticated
using (
  status = 'visible'
  and exists (
    select 1
    from public.blog_posts
    where blog_posts.id = blog_comments.post_id
      and blog_posts.status = 'published'
  )
);

drop policy if exists "Users can read own comments" on public.blog_comments;
create policy "Users can read own comments"
on public.blog_comments
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert comments on published posts" on public.blog_comments;
create policy "Users can insert comments on published posts"
on public.blog_comments
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'visible'
  and exists (
    select 1
    from public.blog_posts
    where blog_posts.id = blog_comments.post_id
      and blog_posts.status = 'published'
  )
);

drop policy if exists "Users can update own visible comments" on public.blog_comments;
create policy "Users can update own visible comments"
on public.blog_comments
for update
to authenticated
using (user_id = auth.uid() and status = 'visible')
with check (user_id = auth.uid() and status = 'visible');

-- RLS keeps normal users from changing moderation status away from visible.
-- Browser-facing comment edit code should still update content only through a
-- server action. If direct table updates are exposed later, add column-level
-- grants or a stricter server-only edit path before launch.

drop policy if exists "Users can delete own visible comments" on public.blog_comments;
create policy "Users can delete own visible comments"
on public.blog_comments
for delete
to authenticated
using (user_id = auth.uid() and status in ('visible', 'pending_review'));

drop policy if exists "Moderators can manage comments" on public.blog_comments;
create policy "Moderators can manage comments"
on public.blog_comments
for all
to authenticated
using (public.current_user_is_moderator_or_admin())
with check (public.current_user_is_moderator_or_admin());

drop policy if exists "Users can create content reports" on public.content_reports;
create policy "Users can create content reports"
on public.content_reports
for insert
to authenticated
with check (
  reporter_id = auth.uid()
  and status = 'open'
  and (
    (
      target_type = 'post'
      and exists (
        select 1
        from public.blog_posts
        where blog_posts.id = content_reports.target_id
          and blog_posts.status = 'published'
      )
    )
    or (
      target_type = 'comment'
      and exists (
        select 1
        from public.blog_comments
        join public.blog_posts on blog_posts.id = blog_comments.post_id
        where blog_comments.id = content_reports.target_id
          and blog_comments.status = 'visible'
          and blog_posts.status = 'published'
      )
    )
  )
);

drop policy if exists "Users can read own content reports" on public.content_reports;
create policy "Users can read own content reports"
on public.content_reports
for select
to authenticated
using (reporter_id = auth.uid());

drop policy if exists "Moderators can read content reports" on public.content_reports;
create policy "Moderators can read content reports"
on public.content_reports
for select
to authenticated
using (public.current_user_is_moderator_or_admin());

drop policy if exists "Moderators can update content reports" on public.content_reports;
create policy "Moderators can update content reports"
on public.content_reports
for update
to authenticated
using (public.current_user_is_moderator_or_admin())
with check (public.current_user_is_moderator_or_admin());

drop policy if exists "Public can read images for published posts" on public.blog_images;
create policy "Public can read images for published posts"
on public.blog_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.blog_posts
    where blog_posts.id = blog_images.post_id
      and blog_posts.status = 'published'
  )
);

drop policy if exists "Users can read own blog images" on public.blog_images;
create policy "Users can read own blog images"
on public.blog_images
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert images for own draft rejected posts" on public.blog_images;
create policy "Users can insert images for own draft rejected posts"
on public.blog_images
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.blog_posts
    where blog_posts.id = blog_images.post_id
      and blog_posts.author_id = auth.uid()
      and blog_posts.status in ('draft', 'rejected')
  )
);

drop policy if exists "Users can delete own blog images" on public.blog_images;
create policy "Users can delete own blog images"
on public.blog_images
for delete
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.blog_posts
    where blog_posts.id = blog_images.post_id
      and blog_posts.author_id = auth.uid()
      and blog_posts.status in ('draft', 'rejected')
  )
);

drop policy if exists "Moderators can manage blog images" on public.blog_images;
create policy "Moderators can manage blog images"
on public.blog_images
for all
to authenticated
using (public.current_user_is_moderator_or_admin())
with check (public.current_user_is_moderator_or_admin());
```

## Important Manual Review Notes

- This SQL does not add a normal-user `profiles` update policy. Run the preflight query above before applying this SQL. If your database already has a broad `profiles` update policy, replace it with a safer server-side profile update path before running Phase 6B so users cannot update `role` or `plan_key`.
- Role helper function execution is revoked from `public` and granted only to `authenticated`; no public/anonymous role helper access is required.
- `content_reports.target_id` is polymorphic. The RLS insert policy validates published post and visible comment targets, but server actions must still validate targets and reject unpublished/private content before insert.
- The database allows `blog_comments.parent_id`; server actions must enforce top-level comments plus optional one-level replies only.
- Normal users can update only their own comments that remain `visible`. Treat comment edits as server-action work that updates content only; soft-delete/status changes should be handled by a trusted moderation or delete flow.
- Normal users can delete only images attached to their own `draft` or `rejected` posts. They cannot delete images attached to published posts.
- Published slugs should be treated as stable. Future slug changes should include redirect planning.
- Public tag reads are broad, but public routes should show only tags connected to published posts.
- Public like/comment counts need a server-side aggregate/RPC/view later because this SQL does not expose all like, bookmark, or comment rows publicly just for counts.
- Public bookmark rows are intentionally private.
