import { createClient } from "@supabase/supabase-js";
import type { EditorJsonValue } from "./post-utils";

export type PublicBlogTag = {
  name: string;
  slug: string;
};

export type PublicBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  contentJson: EditorJsonValue;
  contentText: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  authorDisplayName: string;
  tags: PublicBlogTag[];
};

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_json: EditorJsonValue | null;
  content_text: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  author_id: string;
};

type BlogTagRow = {
  id?: string;
  name?: string | null;
  slug?: string | null;
};

type BlogPostTagRow = {
  post_id: string;
  blog_tags?: BlogTagRow | BlogTagRow[] | null;
};

const publicPostFields =
  "id,title,slug,excerpt,content_json,content_text,cover_image_url,published_at,author_id";

const fallbackAuthorName = "DevToolBox AI contributor";

function createPublicBlogClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function mapPublicBlogPost(
  row: BlogPostRow,
  tags: PublicBlogTag[] = [],
  authorDisplayName = fallbackAuthorName,
): PublicBlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    contentJson: row.content_json ?? [],
    contentText: row.content_text ?? "",
    coverImageUrl: row.cover_image_url,
    publishedAt: row.published_at,
    authorDisplayName,
    tags,
  };
}

export function getContentTextParagraphs(contentText: string) {
  return contentText
    .replace(/\r\n?/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

export function getPublishedStatusFilter() {
  return {
    column: "status",
    value: "published",
  } as const;
}

function normalizeTagRow(row: BlogPostTagRow): PublicBlogTag | null {
  const tag = Array.isArray(row.blog_tags) ? row.blog_tags[0] : row.blog_tags;

  if (!tag?.name || !tag.slug) {
    return null;
  }

  return {
    name: tag.name,
    slug: tag.slug,
  };
}

async function getTagsByPostId(postIds: string[]) {
  const supabase = createPublicBlogClient();
  const tagsByPostId = new Map<string, PublicBlogTag[]>();

  if (!supabase || postIds.length === 0) {
    return tagsByPostId;
  }

  const { data, error } = await supabase
    .from("blog_post_tags")
    .select("post_id,blog_tags(name,slug)")
    .in("post_id", postIds);

  if (error || !data) {
    return tagsByPostId;
  }

  for (const row of data as BlogPostTagRow[]) {
    const tag = normalizeTagRow(row);

    if (!tag) {
      continue;
    }

    const existingTags = tagsByPostId.get(row.post_id) ?? [];
    existingTags.push(tag);
    tagsByPostId.set(row.post_id, existingTags);
  }

  return tagsByPostId;
}

async function getAuthorNamesById(authorIds: string[]) {
  const supabase = createPublicBlogClient();
  const namesById = new Map<string, string>();

  if (!supabase || authorIds.length === 0) {
    return namesById;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,display_name")
    .in("id", authorIds);

  if (error || !data) {
    return namesById;
  }

  for (const profile of data as Array<{ id: string; display_name: string | null }>) {
    const displayName = profile.display_name?.trim();

    if (displayName) {
      namesById.set(profile.id, displayName);
    }
  }

  return namesById;
}

async function attachPublicPostMetadata(rows: BlogPostRow[]) {
  const postIds = rows.map((post) => post.id);
  const authorIds = Array.from(new Set(rows.map((post) => post.author_id)));
  const [tagsByPostId, authorNamesById] = await Promise.all([
    getTagsByPostId(postIds),
    getAuthorNamesById(authorIds),
  ]);

  return rows.map((row) =>
    mapPublicBlogPost(
      row,
      tagsByPostId.get(row.id) ?? [],
      authorNamesById.get(row.author_id) ?? fallbackAuthorName,
    ),
  );
}

export async function getPublishedBlogPosts() {
  const supabase = createPublicBlogClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select(publicPostFields)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return attachPublicPostMetadata(data as BlogPostRow[]);
}

export async function getPublishedBlogPostBySlug(slug: string) {
  const supabase = createPublicBlogClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select(publicPostFields)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const [post] = await attachPublicPostMetadata([data as BlogPostRow]);

  return post ?? null;
}

export async function getPublishedPostsByTagSlug(tagSlug: string) {
  const supabase = createPublicBlogClient();

  if (!supabase) {
    return {
      tag: null,
      posts: [],
    };
  }

  const { data: tag, error: tagError } = await supabase
    .from("blog_tags")
    .select("id,name,slug")
    .eq("slug", tagSlug)
    .maybeSingle();

  if (tagError || !tag) {
    return {
      tag: null,
      posts: [],
    };
  }

  const publicTag = {
    name: String(tag.name),
    slug: String(tag.slug),
  };

  const { data: relationships, error: relationshipError } = await supabase
    .from("blog_post_tags")
    .select("post_id")
    .eq("tag_id", String(tag.id));

  if (relationshipError || !relationships?.length) {
    return {
      tag: publicTag,
      posts: [],
    };
  }

  const postIds = relationships.map((relationship) => String(relationship.post_id));
  const { data: posts, error: postsError } = await supabase
    .from("blog_posts")
    .select(publicPostFields)
    .eq("status", "published")
    .in("id", postIds)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (postsError || !posts) {
    return {
      tag: publicTag,
      posts: [],
    };
  }

  return {
    tag: publicTag,
    posts: await attachPublicPostMetadata(posts as BlogPostRow[]),
  };
}
