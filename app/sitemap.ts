import type { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/lib/blog/public-posts";
import { tools } from "@/lib/tools";

const fallbackSiteUrl = "https://devtoolbox-ai-murex.vercel.app";

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl).replace(
    /\/$/,
    "",
  );
}

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
  const blogPostPaths = (await getPublishedBlogPosts()).map(
    (post) => `/blog/${post.slug}`,
  );

  const paths = ["/", "/tools", ...availableToolPaths, "/blog", ...blogPostPaths];

  return paths.map((path) =>
    createSitemapEntry(path, lastModified, path === "/" ? 1 : 0.8),
  );
}
