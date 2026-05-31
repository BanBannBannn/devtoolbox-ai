import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorJsonRenderer } from "@/components/blog/editor-json-renderer";
import { BlogPostStatusBadge } from "@/components/blog/blog-post-status-badge";
import {
  canEditWriterPostStatus,
  getPreviewableBlogPostForCurrentUser,
} from "@/lib/blog/writer-posts";
import { createMetadata } from "@/lib/seo";

type PreviewBlogPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata = {
  ...createMetadata({
    title: "Blog Post Preview",
    description: "Preview a private DevToolBox AI blog post draft.",
    path: "/dashboard/blog",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function PreviewBlogPostPage({
  params,
}: PreviewBlogPostPageProps) {
  const { id } = await params;
  const post = await getPreviewableBlogPostForCurrentUser(id);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/blog"
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Back to posts
        </Link>
        {canEditWriterPostStatus(post.status) ? (
          <Link
            href={`/dashboard/blog/${post.id}/edit`}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Edit
          </Link>
        ) : null}
      </div>

      <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        This is a private dashboard preview. Public blog pages still show only
        published posts.
      </div>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <BlogPostStatusBadge status={post.status} />
          <p className="text-sm text-slate-500">
            Updated {formatDate(post.updated_at)}
          </p>
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
          {post.title}
        </h1>
      {post.excerpt ? (
          <p className="mt-5 text-lg leading-8 text-slate-600">{post.excerpt}</p>
        ) : null}
      </header>

      {post.cover_image_url ? (
        <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image_url}
            alt={`${post.title} cover image`}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mt-10 space-y-6">
        {post.content_text.trim() ? (
          <EditorJsonRenderer content={post.content_json} />
        ) : (
          <p className="leading-7 text-slate-600">
            This draft does not have body text yet.
          </p>
        )}
      </div>
    </article>
  );
}
