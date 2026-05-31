import type { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/lib/blog/public-posts";
import { getPublishedBlogSitemapPaths } from "@/lib/blog/public-seo";
import { getSiteUrl } from "@/lib/seo";
import { tools } from "@/lib/tools";

function createSitemapEntry(
  path: string,
  lastModified: Date,
  priority: number,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${getSiteUrl()}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const availableToolPaths = tools
    .filter((tool) => tool.status === "available")
    .map((tool) => tool.href);
  const blogPaths = getPublishedBlogSitemapPaths(
    (await getPublishedBlogPosts()).map((post) => ({
      slug: post.slug,
      status: "published",
      tags: post.tags,
    })),
  );

  const paths = [
    "/",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/tools",
    ...availableToolPaths,
    "/blog",
    ...blogPaths,
  ];

  return paths.map((path) =>
    createSitemapEntry(path, lastModified, path === "/" ? 1 : 0.8),
  );
}
