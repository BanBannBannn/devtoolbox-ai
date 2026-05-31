import { NextResponse } from "next/server";
import {
  BLOG_IMAGE_BUCKET,
  createBlogImageStoragePath,
  isEditableBlogImagePostStatus,
  validateBlogImageFile,
} from "@/lib/blog/image-upload";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type UploadKind = "cover" | "inline";

function jsonError(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

function parseUploadKind(value: FormDataEntryValue | null): UploadKind | null {
  return value === "cover" || value === "inline" ? value : null;
}

function getSafeAltText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 180);
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return jsonError("Supabase is not configured.", 500);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Sign in to upload blog images.", 401);
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const postId = String(formData.get("postId") ?? "").trim();
  const kind = parseUploadKind(formData.get("kind"));
  const altText = getSafeAltText(formData.get("altText"));

  if (!postId) {
    return jsonError("Save the draft before uploading images.", 400);
  }

  if (!kind) {
    return jsonError("Choose a valid blog image upload type.", 400);
  }

  if (!(file instanceof File)) {
    return jsonError("Choose an image file to upload.", 400);
  }

  const validation = validateBlogImageFile({
    type: file.type,
    size: file.size,
  });

  if (!validation.success) {
    return jsonError(validation.error, 400);
  }

  const { data: post, error: postError } = await supabase
    .from("blog_posts")
    .select("id,author_id,status")
    .eq("id", postId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (postError || !post) {
    return jsonError("Blog post not found.", 404);
  }

  const status = String((post as { status?: string }).status ?? "");

  if (!isEditableBlogImagePostStatus(status)) {
    return jsonError("Images can only be uploaded for draft or rejected posts.", 403);
  }

  const storagePath = createBlogImageStoragePath({
    userId: user.id,
    postId,
    mimeType: validation.mimeType,
    randomId: crypto.randomUUID(),
  });

  const { error: uploadError } = await supabase.storage
    .from(BLOG_IMAGE_BUCKET)
    .upload(storagePath, file, {
      contentType: validation.mimeType,
      upsert: false,
    });

  if (uploadError) {
    return jsonError("Could not upload the image. Check blog image storage setup.", 500);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BLOG_IMAGE_BUCKET).getPublicUrl(storagePath);

  const { error: imageRowError } = await supabase.from("blog_images").insert({
    post_id: postId,
    user_id: user.id,
    url: publicUrl,
    storage_path: storagePath,
    alt_text: altText || null,
  });

  if (imageRowError) {
    return jsonError("Image uploaded, but it could not be attached to the post.", 500);
  }

  if (kind === "cover") {
    const { error: coverError } = await supabase
      .from("blog_posts")
      .update({ cover_image_url: publicUrl })
      .eq("id", postId)
      .eq("author_id", user.id);

    if (coverError) {
      return jsonError("Image uploaded, but the cover image could not be updated.", 500);
    }
  }

  return NextResponse.json({
    success: true,
    url: publicUrl,
    storagePath,
  });
}
