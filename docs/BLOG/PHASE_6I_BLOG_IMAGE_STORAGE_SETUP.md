# Phase 6I Blog Image Storage Setup

This phase uses Supabase Storage for writer-uploaded cover and inline blog images.

## Bucket
- Bucket name: `blog-images`
- Read strategy for MVP: public bucket/public read URLs.
- Upload path format: `{userId}/{postId}/{random-file-name}`
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Rejected MIME types: SVG and all non-image types
- Max file size: `5MB`

## Runtime Behavior
- Browser uploads go through the internal route `POST /api/blog/images/upload`.
- The route authenticates the user with the normal Supabase server client.
- The route verifies the post belongs to the authenticated user.
- The route allows uploads only for `draft` or `rejected` posts.
- The route validates file type and size server-side before storage upload.
- The route records uploaded images in `public.blog_images`.
- No service role key is required for this MVP path.

## Manual Supabase Setup
Create the `blog-images` bucket in Supabase Storage before manual QA.

Recommended bucket settings for MVP:

- Public bucket: enabled
- File size limit: `5MB`
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

The current internal upload route uses the authenticated user's Supabase
session to write Storage objects. Review and apply an insert policy before
manual QA if the bucket does not already have an equivalent policy. This
defense-in-depth policy validates the bucket, authenticated user folder, owned
editable post folder, and generated file extension:

```sql
-- Review only. Apply manually in Supabase after confirming existing policies.
drop policy if exists "Users can upload own blog images" on storage.objects;

create policy "Users can upload own blog images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'blog-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from public.blog_posts
    where blog_posts.id::text = (storage.foldername(name))[2]
      and blog_posts.author_id = auth.uid()
      and blog_posts.status in ('draft', 'rejected')
  )
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);
```

For future Storage cleanup, review this optional delete policy. It permits a
normal user to remove objects only from their own `draft` or `rejected` post
folder. It does not allow a normal user to delete images attached to published
posts:

```sql
-- Review only. Optional until application cleanup is implemented.
drop policy if exists "Users can delete own draft blog images" on storage.objects;

create policy "Users can delete own draft blog images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'blog-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from public.blog_posts
    where blog_posts.id::text = (storage.foldername(name))[2]
      and blog_posts.author_id = auth.uid()
      and blog_posts.status in ('draft', 'rejected')
  )
);
```

Public bucket reads provide the MVP display path. If the bucket becomes private
later, replace public URLs with signed URLs. Do not add broad public select
policies unless intentionally using RLS-based private Storage reads.

The application upload route must still validate authentication, post
ownership, editable `draft` or `rejected` status, MIME type, file size, SVG
rejection, and the safe Storage path before calling Storage.

## Deferred
- Private signed URL strategy
- Supabase Storage cleanup for orphaned failed uploads
- Image replacement cleanup
- Image deletion from storage when removing a cover or deleting a post
- Image deletion from `public.blog_images` when an inline image is removed from editor JSON
- Image optimization pipeline
