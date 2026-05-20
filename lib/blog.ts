import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

export type BlogPost = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  slug: string;
  content: string;
};

const blogDirectory = path.join(process.cwd(), "content", "blog");

function parseFrontmatterValue(value: string) {
  const trimmedValue = value.trim();

  if (trimmedValue.startsWith("[") && trimmedValue.endsWith("]")) {
    return trimmedValue
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
  }

  return trimmedValue.replace(/^"|"$/g, "");
}

function parseBlogPost(fileName: string): BlogPost {
  const filePath = path.join(blogDirectory, fileName);
  const source = readFileSync(filePath, "utf8");
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    throw new Error(`Invalid blog frontmatter in ${fileName}`);
  }

  const frontmatter = match[1].split("\n").reduce<Record<string, unknown>>(
    (metadata, line) => {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) {
        return metadata;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1);

      metadata[key] = parseFrontmatterValue(value);
      return metadata;
    },
    {},
  );

  const post = {
    title: frontmatter.title,
    description: frontmatter.description,
    date: frontmatter.date,
    tags: frontmatter.tags,
    slug: frontmatter.slug,
    content: match[2].trim(),
  };

  if (
    typeof post.title !== "string" ||
    typeof post.description !== "string" ||
    typeof post.date !== "string" ||
    typeof post.slug !== "string" ||
    !Array.isArray(post.tags)
  ) {
    throw new Error(`Missing blog metadata in ${fileName}`);
  }

  return post as BlogPost;
}

export function getAllBlogPosts(): BlogPost[] {
  return readdirSync(blogDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map(parseBlogPost)
    .sort((firstPost, secondPost) =>
      secondPost.date.localeCompare(firstPost.date),
    );
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getAllBlogPosts().find((post) => post.slug === slug);
}
