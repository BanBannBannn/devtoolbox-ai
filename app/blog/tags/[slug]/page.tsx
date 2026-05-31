import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicBlogCard } from "@/components/blog/public-blog-card";
import { getPublishedPostsByTagSlug } from "@/lib/blog/public-posts";
import { createMetadata } from "@/lib/seo";

type BlogTagPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: BlogTagPageProps) {
  const { slug } = await params;
  const { tag } = await getPublishedPostsByTagSlug(slug);

  if (!tag) {
    return createMetadata({
      title: "Blog Tag Not Found",
      path: `/blog/tags/${slug}`,
    });
  }

  return createMetadata({
    title: `${tag.name} Articles`,
    description: `Read published DevToolBox AI articles tagged ${tag.name}.`,
    path: `/blog/tags/${tag.slug}`,
  });
}

export default async function BlogTagPage({ params }: BlogTagPageProps) {
  const { slug } = await params;
  const { tag, posts } = await getPublishedPostsByTagSlug(slug);

  if (!tag) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/blog"
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        Back to blog
      </Link>

      <div className="mt-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Blog tag
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          {tag.name}
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Published articles connected to this tag.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white p-8">
          <h2 className="text-xl font-semibold text-slate-950">
            No published posts for this tag yet
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Draft, pending, rejected, and archived posts are intentionally hidden
            from public tag pages.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {posts.map((post) => (
            <PublicBlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
