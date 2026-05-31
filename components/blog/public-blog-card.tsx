import Link from "next/link";
import type { PublicBlogPost } from "@/lib/blog/public-posts";

type PublicBlogCardProps = {
  post: PublicBlogPost;
};

function formatDate(date: string | null) {
  if (!date) {
    return "Published";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function PublicBlogCard({ post }: PublicBlogCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-emerald-300 hover:shadow-sm">
      <Link href={`/blog/${post.slug}`} className="group flex flex-1 flex-col">
        {post.coverImageUrl ? (
          <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt={`${post.title} cover image`}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col p-6">
          <p className="text-sm font-medium text-slate-500">
            {formatDate(post.publishedAt)} by {post.authorDisplayName}
          </p>
          <h2 className="mt-3 text-xl font-semibold text-slate-950 group-hover:text-emerald-800">
            {post.title}
          </h2>
          {post.excerpt ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
              {post.excerpt}
            </p>
          ) : null}
          {post.tags.length > 0 ? (
            <div className="mt-auto flex flex-wrap gap-2 pt-5">
              {post.tags.map((tag) => (
                <span
                  key={tag.slug}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
