# Phase 6D Blog Image Storage Setup

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

Storage policies should allow authenticated users to upload, read, and remove
objects under their own user ID prefix if direct storage policies are used. The
application route still verifies post ownership and editable status before
calling storage.

## Deferred
- Private signed URL strategy
- Supabase Storage cleanup for orphaned failed uploads
- Image replacement cleanup
- Image deletion from storage when removing a cover or deleting a post
- Image optimization pipeline
