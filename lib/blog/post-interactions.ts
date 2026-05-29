import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "../supabase/server";
import {
  getPublishedBlogPostsByIds,
  type PublicBlogPost,
} from "./public-posts";

export type PostInteractionState = {
  likeCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
};

export type BookmarkListItem = {
  post: PublicBlogPost;
  bookmarkedAt: string;
};

export type ToggleInteractionResult =
  | {
      success: true;
      toggledOn: boolean;
      slug: string;
    }
  | {
      success: false;
      code:
        | "auth_required"
        | "not_found"
        | "storage_unavailable"
        | "toggle_failed";
      error: string;
    };

type PublishedPostReference = {
  id: string;
  slug: string;
};

type BookmarkRow = {
  post_id: string;
  created_at: string;
};

export function getInteractionErrorMessage(code?: string) {
  switch (code) {
    case "auth_required":
      return "Sign in to like or bookmark posts.";
    case "not_found":
      return "This post is not available for likes or bookmarks.";
    case "storage_unavailable":
      return "Blog interactions are not configured.";
    case "toggle_failed":
      return "Could not update this post interaction. Please try again.";
    default:
      return undefined;
  }
}

export function getDisplayLikeCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.trunc(value)
    : 0;
}

export function mapBookmarkListItems({
  bookmarks,
  posts,
}: {
  bookmarks: BookmarkRow[];
  posts: PublicBlogPost[];
}) {
  const postsById = new Map(posts.map((post) => [post.id, post]));

  return bookmarks
    .map((bookmark) => {
      const post = postsById.get(bookmark.post_id);

      if (!post) {
        return null;
      }

      return {
        post,
        bookmarkedAt: bookmark.created_at,
      };
    })
    .filter((item): item is BookmarkListItem => Boolean(item));
}

async function getPublishedPostReference(
  postId: string,
): Promise<PublishedPostReference | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,slug")
    .eq("id", postId)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: String(data.id),
    slug: String(data.slug),
  };
}

async function requireInteractionUser() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    supabase,
    userId: user.id,
  };
}

export async function getPostLikeCount(postId: string) {
  const supabase = createServiceRoleSupabaseClient();

  if (!supabase) {
    return 0;
  }

  const { count, error } = await supabase
    .from("blog_post_likes")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  if (error) {
    return 0;
  }

  return getDisplayLikeCount(count);
}

export async function getPostInteractionState({
  postId,
  userId,
}: {
  postId: string;
  userId: string | null;
}): Promise<PostInteractionState> {
  const likeCount = await getPostLikeCount(postId);

  if (!userId) {
    return {
      likeCount,
      isLiked: false,
      isBookmarked: false,
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      likeCount,
      isLiked: false,
      isBookmarked: false,
    };
  }

  const [{ data: like }, { data: bookmark }] = await Promise.all([
    supabase
      .from("blog_post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("blog_post_bookmarks")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return {
    likeCount,
    isLiked: Boolean(like),
    isBookmarked: Boolean(bookmark),
  };
}

export async function togglePostLike(
  postId: string,
): Promise<ToggleInteractionResult> {
  const auth = await requireInteractionUser();

  if (!auth) {
    return {
      success: false,
      code: "auth_required",
      error: "Authentication is required.",
    };
  }

  const post = await getPublishedPostReference(postId);

  if (!post) {
    return {
      success: false,
      code: "not_found",
      error: "This published post was not found.",
    };
  }

  const { data: existingLike, error: existingError } = await auth.supabase
    .from("blog_post_likes")
    .select("id")
    .eq("post_id", post.id)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (existingError) {
    return {
      success: false,
      code: "toggle_failed",
      error: "Could not check like state.",
    };
  }

  if (existingLike) {
    const { error } = await auth.supabase
      .from("blog_post_likes")
      .delete()
      .eq("post_id", post.id)
      .eq("user_id", auth.userId);

    if (error) {
      return {
        success: false,
        code: "toggle_failed",
        error: "Could not remove like.",
      };
    }

    return {
      success: true,
      toggledOn: false,
      slug: post.slug,
    };
  }

  const { error } = await auth.supabase.from("blog_post_likes").insert({
    post_id: post.id,
    user_id: auth.userId,
  });

  if (error) {
    return {
      success: false,
      code: "toggle_failed",
      error: "Could not add like.",
    };
  }

  return {
    success: true,
    toggledOn: true,
    slug: post.slug,
  };
}

export async function togglePostBookmark(
  postId: string,
): Promise<ToggleInteractionResult> {
  const auth = await requireInteractionUser();

  if (!auth) {
    return {
      success: false,
      code: "auth_required",
      error: "Authentication is required.",
    };
  }

  const post = await getPublishedPostReference(postId);

  if (!post) {
    return {
      success: false,
      code: "not_found",
      error: "This published post was not found.",
    };
  }

  const { data: existingBookmark, error: existingError } = await auth.supabase
    .from("blog_post_bookmarks")
    .select("id")
    .eq("post_id", post.id)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (existingError) {
    return {
      success: false,
      code: "toggle_failed",
      error: "Could not check bookmark state.",
    };
  }

  if (existingBookmark) {
    const { error } = await auth.supabase
      .from("blog_post_bookmarks")
      .delete()
      .eq("post_id", post.id)
      .eq("user_id", auth.userId);

    if (error) {
      return {
        success: false,
        code: "toggle_failed",
        error: "Could not remove bookmark.",
      };
    }

    return {
      success: true,
      toggledOn: false,
      slug: post.slug,
    };
  }

  const { error } = await auth.supabase.from("blog_post_bookmarks").insert({
    post_id: post.id,
    user_id: auth.userId,
  });

  if (error) {
    return {
      success: false,
      code: "toggle_failed",
      error: "Could not add bookmark.",
    };
  }

  return {
    success: true,
    toggledOn: true,
    slug: post.slug,
  };
}

export async function listUserBookmarks(userId: string) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("blog_post_bookmarks")
    .select("post_id,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const bookmarks = data as BookmarkRow[];
  const posts = await getPublishedBlogPostsByIds(
    bookmarks.map((bookmark) => bookmark.post_id),
  );

  return mapBookmarkListItems({ bookmarks, posts });
}
