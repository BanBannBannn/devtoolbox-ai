import type { PublicBlogPost, PublicBlogTag } from "./public-posts";

export const PUBLIC_BLOG_PAGE_SIZE = 12;
const maxSearchLength = 120;

export type PublicBlogSort = "newest" | "oldest";

export type PublicBlogQuery = {
  q: string;
  tag: string;
  sort: PublicBlogSort;
  page: number;
};

type SearchParamValue = string | string[] | undefined;

function getFirstValue(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

export function parsePublicBlogSort(value: SearchParamValue): PublicBlogSort {
  return getFirstValue(value) === "oldest" ? "oldest" : "newest";
}

export function parsePublicBlogQuery(params: {
  q?: SearchParamValue;
  tag?: SearchParamValue;
  sort?: SearchParamValue;
  page?: SearchParamValue;
}): PublicBlogQuery {
  const parsedPage = Number.parseInt(getFirstValue(params.page) ?? "", 10);

  return {
    q: (getFirstValue(params.q) ?? "").trim().slice(0, maxSearchLength),
    tag: (getFirstValue(params.tag) ?? "").trim().toLowerCase(),
    sort: parsePublicBlogSort(params.sort),
    page: Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
}

function getPublishedAtTimestamp(post: PublicBlogPost) {
  const timestamp = post.publishedAt
    ? new Date(post.publishedAt).getTime()
    : 0;

  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function filterAndSortPublishedBlogPosts(
  posts: PublicBlogPost[],
  query: PublicBlogQuery,
) {
  const search = query.q.toLowerCase();

  return posts
    .filter((post) => {
      const matchesSearch =
        !search ||
        [post.title, post.excerpt, post.contentText]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchesTag =
        !query.tag || post.tags.some((tag) => tag.slug === query.tag);

      return matchesSearch && matchesTag;
    })
    .sort((left, right) => {
      const difference =
        getPublishedAtTimestamp(right) - getPublishedAtTimestamp(left);

      return query.sort === "oldest" ? -difference : difference;
    });
}

export function getPublishedBlogTags(posts: PublicBlogPost[]) {
  const tagsBySlug = new Map<string, PublicBlogTag>();

  for (const post of posts) {
    for (const tag of post.tags) {
      if (!tagsBySlug.has(tag.slug)) {
        tagsBySlug.set(tag.slug, tag);
      }
    }
  }

  return Array.from(tagsBySlug.values()).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}

export function paginatePublicBlogPosts(
  posts: PublicBlogPost[],
  page: number,
  pageSize = PUBLIC_BLOG_PAGE_SIZE,
) {
  const pageCount = Math.max(1, Math.ceil(posts.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const offset = (currentPage - 1) * pageSize;

  return {
    posts: posts.slice(offset, offset + pageSize),
    currentPage,
    pageCount,
    totalPosts: posts.length,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < pageCount,
  };
}

export function createPublicBlogQueryHref(
  query: PublicBlogQuery,
  overrides: Partial<PublicBlogQuery> = {},
) {
  const nextQuery = {
    ...query,
    ...overrides,
  };
  const searchParams = new URLSearchParams();

  if (nextQuery.q) {
    searchParams.set("q", nextQuery.q);
  }

  if (nextQuery.tag) {
    searchParams.set("tag", nextQuery.tag);
  }

  if (nextQuery.sort !== "newest") {
    searchParams.set("sort", nextQuery.sort);
  }

  if (nextQuery.page > 1) {
    searchParams.set("page", String(nextQuery.page));
  }

  const search = searchParams.toString();

  return search ? `/blog?${search}` : "/blog";
}
