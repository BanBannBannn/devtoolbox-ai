import type { Metadata } from "next";

const siteName = "DevToolBox AI";
const baseDescription =
  "Save documents, chat with your own knowledge base, and use practical developer tools in one workspace.";
const fallbackSiteUrl = "https://devtoolbox-ai-murex.vercel.app";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl).replace(
    /\/$/,
    "",
  );
}

type SeoConfig = {
  title?: string;
  description?: string;
  path?: string;
};

export function createMetadata({
  title,
  description = baseDescription,
  path = "/",
}: SeoConfig = {}): Metadata {
  const pageTitle = title ? `${title} | ${siteName}` : siteName;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: pageTitle,
      description,
      siteName,
      type: "website",
      url: path,
    },
    twitter: {
      card: "summary",
      title: pageTitle,
      description,
    },
  };
}

export const defaultMetadata = createMetadata();
