import type { MetadataRoute } from "next";
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

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const availableToolPaths = tools
    .filter((tool) => tool.status === "available")
    .map((tool) => tool.href);

  const paths = ["/", "/tools", ...availableToolPaths, "/blog"];

  return paths.map((path) =>
    createSitemapEntry(path, lastModified, path === "/" ? 1 : 0.8),
  );
}
