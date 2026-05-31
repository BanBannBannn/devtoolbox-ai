import { PublicBlogList } from "@/components/blog/public-blog-list";
import { getPublishedBlogPosts } from "@/lib/blog/public-posts";
import { createMetadata } from "@/lib/seo";

const pageTitle = "DevToolBox AI Blog - Developer Knowledge and AI Workflows";
const pageDescription =
  "Read developer articles, AI workflow notes, coding guides, and practical tool tips from the DevToolBox AI community.";
const baseMetadata = createMetadata({
  title: pageTitle,
  description:
    pageDescription,
  path: "/blog",
});

export const metadata = {
  ...baseMetadata,
  title: pageTitle,
  openGraph: {
    ...baseMetadata.openGraph,
    title: pageTitle,
  },
  twitter: {
    ...baseMetadata.twitter,
    title: pageTitle,
  },
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Blog
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Developer knowledge from the community
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Explore practical developer articles, coding notes, AI workflows, and
          useful ideas shared through DevToolBox AI.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white p-8">
          <h2 className="text-xl font-semibold text-slate-950">
            No published posts yet
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Published database-backed blog posts will appear here after they are
            approved. Existing static markdown articles are kept as legacy
            seed/reference content but are no longer the public source of truth.
          </p>
        </div>
      ) : (
        <PublicBlogList posts={posts} />
      )}
    </div>
  );
}
