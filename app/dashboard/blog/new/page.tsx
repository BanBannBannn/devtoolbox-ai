import Link from "next/link";
import { BlogPostForm } from "@/components/blog/blog-post-form";
import { createBlogPostAction } from "@/app/dashboard/blog/actions";
import { createMetadata } from "@/lib/seo";
import { getBlogPostErrorMessage } from "@/lib/blog/writer-posts";

type NewBlogPostPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export const metadata = createMetadata({
  title: "New Blog Post",
  description: "Create a DevToolBox AI blog draft.",
  path: "/dashboard/blog/new",
});

export default async function NewBlogPostPage({
  searchParams,
}: NewBlogPostPageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/dashboard/blog"
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        Back to posts
      </Link>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
          New blog post
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Save a draft while writing, then submit it for moderator review when
          it is ready.
        </p>
        <div className="mt-8">
          <BlogPostForm
            action={createBlogPostAction}
            errorMessage={getBlogPostErrorMessage(params.error)}
            submitLabel="Submit for review"
          />
        </div>
      </div>
    </div>
  );
}
