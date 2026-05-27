import Link from "next/link";
import { notFound } from "next/navigation";
import { SharePostButton } from "@/components/blog/share-post-button";
import {
  getContentTextParagraphs,
  getPublishedBlogPostBySlug,
} from "@/lib/blog/public-posts";
import { createMetadata } from "@/lib/seo";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(date: string | null) {
  if (!date) {
    return "Published";
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return createMetadata({
      title: "Blog Post Not Found",
      path: `/blog/${slug}`,
    });
  }

  const metadata = createMetadata({
    title: post.title,
    description: post.excerpt || "Read this published DevToolBox AI article.",
    path: `/blog/${post.slug}`,
  });

  if (!post.coverImageUrl) {
    return metadata;
  }

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      images: [
        {
          url: post.coverImageUrl,
          alt: post.title,
        },
      ],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const paragraphs = getContentTextParagraphs(post.contentText);

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/blog"
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        Back to blog
      </Link>

      <header className="mt-8">
        <p className="text-sm font-medium text-slate-500">
          {formatDate(post.publishedAt)} by {post.authorDisplayName}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="mt-5 text-lg leading-8 text-slate-600">{post.excerpt}</p>
        ) : null}
        {post.tags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/blog/tags/${tag.slug}`}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      {post.coverImageUrl ? (
        <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImageUrl}
            alt=""
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mt-8">
        <SharePostButton title={post.title} />
      </div>

      <div className="mt-10 space-y-6">
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph) => (
            <p key={paragraph} className="leading-7 text-slate-600">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="leading-7 text-slate-600">
            This published post does not have body text yet.
          </p>
        )}
      </div>

      <footer className="mt-12 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
        Likes, bookmarks, comments, and reports are planned for later blog
        platform phases.
      </footer>
    </article>
  );
}
