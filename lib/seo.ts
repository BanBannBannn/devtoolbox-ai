import type { Metadata } from "next";

const siteName = "DevToolBox AI";
const baseDescription =
  "Free browser-based developer tools, AI coding prompts, and software testing checklists.";

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
