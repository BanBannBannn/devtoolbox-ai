import type { Metadata } from "next";
import { createMetadata } from "../seo";
import type { PublicBlogPost } from "./public-posts";

const fallbackDescription =
  "Read this published DevToolBox AI article about developer knowledge and practical workflows.";

export type BlogSitemapPost = {
  slug: string;
  status: string;
  tags?: Array<{
    slug: string;
  }>;
};

export function getPublicBlogPostDescription(
  post: Pick<PublicBlogPost, "excerpt" | "contentText">,
) {
  const description = (post.excerpt || post.contentText)
    .replace(/\s+/g, " ")
    .trim();

  if (!description) {
    return fallbackDescription;
  }

  return description.length > 160
    ? `${description.slice(0, 157).trimEnd()}...`
    : description;
}

export function createPublicBlogPostMetadata(post: PublicBlogPost): Metadata {
  const description = getPublicBlogPostDescription(post);
  const metadata = createMetadata({
    title: post.title,
    description,
    path: `/blog/${post.slug}`,
  });
  const image = post.coverImageUrl
    ? [
        {
          url: post.coverImageUrl,
          alt: post.title,
        },
      ]
    : undefined;

  return {
    ...metadata,
    keywords: post.tags.map((tag) => tag.name),
    authors: [{ name: post.authorDisplayName }],
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      authors: [post.authorDisplayName],
      tags: post.tags.map((tag) => tag.name),
      images: image,
    },
    twitter: {
      ...metadata.twitter,
      card: image ? "summary_large_image" : "summary",
      images: image?.map(({ url, alt }) => ({ url, alt })),
    },
  };
}

export function getPublicBlogShareUrl(origin: string, slug: string) {
  return `${origin.replace(/\/+$/, "")}/blog/${encodeURIComponent(slug)}`;
}

export function getPublishedBlogSitemapPaths(posts: BlogSitemapPost[]) {
  const publishedPosts = posts.filter((post) => post.status === "published");
  const tagSlugs = Array.from(
    new Set(
      publishedPosts.flatMap((post) =>
        (post.tags ?? []).map((tag) => tag.slug).filter(Boolean),
      ),
    ),
  );

  return [
    ...publishedPosts.map((post) => `/blog/${post.slug}`),
    ...tagSlugs.map((slug) => `/blog/tags/${slug}`),
  ];
}
