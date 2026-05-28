import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogPostForm } from "@/components/blog/blog-post-form";
import { updateBlogPostAction } from "@/app/dashboard/blog/actions";
import {
  canEditWriterPostStatus,
  getBlogPostErrorMessage,
  getOwnedBlogPostForCurrentUser,
} from "@/lib/blog/writer-posts";
import { createMetadata } from "@/lib/seo";

type EditBlogPostPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

const messages: Record<string, string> = {
  created: "Draft created.",
  saved: "Draft saved.",
  submitted: "Post submitted for review.",
};

export const metadata = createMetadata({
  title: "Edit Blog Post",
  description: "Edit your DevToolBox AI blog draft.",
  path: "/dashboard/blog",
});

export default async function EditBlogPostPage({
  params,
  searchParams,
}: EditBlogPostPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const post = await getOwnedBlogPostForCurrentUser(id);

  if (!post || !canEditWriterPostStatus(post.status)) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/blog"
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Back to posts
        </Link>
        <Link
          href={`/dashboard/blog/${post.id}/preview`}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
        >
          Preview
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
          Edit blog post
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Draft and rejected posts can be edited. Published slugs become stable
          after moderation in a later phase.
        </p>
        <div className="mt-8">
          <BlogPostForm
            action={updateBlogPostAction.bind(null, post.id)}
            postId={post.id}
            title={post.title}
            slug={post.slug}
            excerpt={post.excerpt}
            coverImageUrl={post.cover_image_url}
            contentJson={post.content_json}
            errorMessage={getBlogPostErrorMessage(query.error)}
            successMessage={query.message ? messages[query.message] : undefined}
            submitLabel="Submit for review"
          />
        </div>
      </div>
    </div>
  );
}
