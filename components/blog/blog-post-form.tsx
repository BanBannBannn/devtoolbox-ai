"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useFormStatus } from "react-dom";
import {
  extractPlainTextFromEditorJson,
  getInitialEditorBlocks,
  slugifyTitle,
  type EditorJsonValue,
} from "@/lib/blog/post-utils";

const BlockNoteBlogEditor = dynamic(
  () =>
    import("./blocknote-blog-editor").then((mod) => mod.BlockNoteBlogEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[620px] px-6 py-8 text-sm text-slate-500">
        Loading editor...
      </div>
    ),
  },
);

type BlogPostFormProps = {
  action: (formData: FormData) => void;
  postId?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  contentJson?: EditorJsonValue;
  submitLabel?: string;
  errorMessage?: string;
  successMessage?: string;
  backHref?: string;
};

type UploadResponse =
  | {
      success: true;
      url: string;
      storagePath: string;
    }
  | {
      success: false;
      error: string;
    };

function SubmitButtons({
  submitLabel,
  disabled,
}: {
  submitLabel: string;
  disabled: boolean;
}) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
      <button
        type="submit"
        name="intent"
        value="save_draft"
        disabled={isDisabled}
        className="inline-flex justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save draft"}
      </button>
      <button
        type="submit"
        name="intent"
        value="submit_review"
        disabled={isDisabled}
        className="inline-flex justify-center rounded-md bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Submitting..." : submitLabel}
      </button>
    </div>
  );
}

async function uploadBlogImage({
  file,
  postId,
  kind,
  altText,
}: {
  file: File;
  postId: string;
  kind: "cover" | "inline";
  altText?: string;
}) {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("postId", postId);
  formData.set("kind", kind);
  formData.set("altText", altText ?? file.name);

  const response = await fetch("/api/blog/images/upload", {
    method: "POST",
    body: formData,
  });
  const payload = (await response.json()) as UploadResponse;

  if (!response.ok || !payload.success) {
    throw new Error(
      payload.success ? "Could not upload image." : payload.error,
    );
  }

  return payload;
}

export function BlogPostForm({
  action,
  postId,
  title = "",
  slug = "",
  excerpt = "",
  coverImageUrl = "",
  contentJson,
  submitLabel = "Submit for review",
  errorMessage,
  successMessage,
  backHref = "/dashboard/blog",
}: BlogPostFormProps) {
  const initialBlocks = useMemo(
    () => getInitialEditorBlocks(contentJson),
    [contentJson],
  );
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSlug, setCurrentSlug] = useState(slug);
  const [currentExcerpt, setCurrentExcerpt] = useState(excerpt ?? "");
  const [currentCoverImageUrl, setCurrentCoverImageUrl] = useState(
    coverImageUrl ?? "",
  );
  const [contentJsonValue, setContentJsonValue] = useState(
    JSON.stringify(initialBlocks),
  );
  const [contentTextValue, setContentTextValue] = useState(
    extractPlainTextFromEditorJson(initialBlocks),
  );
  const [slugWasEdited, setSlugWasEdited] = useState(Boolean(slug));
  const [editorMessage, setEditorMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!postId) {
      setUploadError("Save the draft once before uploading a cover image.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setEditorMessage("Uploading cover image...");

    try {
      const uploaded = await uploadBlogImage({
        file,
        postId,
        kind: "cover",
        altText: currentTitle || file.name,
      });

      setCurrentCoverImageUrl(uploaded.url);
      setEditorMessage("Cover image uploaded.");
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Could not upload cover image.",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <form action={action} className="space-y-7">
      {errorMessage ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {errorMessage}
        </p>
      ) : null}
      {successMessage ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {successMessage}
        </p>
      ) : null}
      {uploadError ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          {uploadError}
        </p>
      ) : null}

      <input type="hidden" name="content_json" value={contentJsonValue} />
      <input type="hidden" name="content_text" value={contentTextValue} />
      <input
        type="hidden"
        name="cover_image_url"
        value={currentCoverImageUrl}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <div>
            <label htmlFor="title" className="text-sm font-semibold text-slate-900">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={currentTitle}
              onChange={(event) => {
                const nextTitle = event.target.value;
                setCurrentTitle(nextTitle);

                if (!slugWasEdited) {
                  setCurrentSlug(slugifyTitle(nextTitle));
                }
              }}
              maxLength={120}
              required
              placeholder="A practical guide to..."
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label htmlFor="slug" className="text-sm font-semibold text-slate-900">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={currentSlug}
              onChange={(event) => {
                setSlugWasEdited(true);
                setCurrentSlug(event.target.value);
              }}
              maxLength={140}
              required
              placeholder="practical-guide"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-end justify-between gap-3">
            <label
              htmlFor="excerpt"
              className="text-sm font-semibold text-slate-900"
            >
              Excerpt
            </label>
            <p className="text-xs text-slate-500">
              {currentExcerpt.length} / 300
            </p>
          </div>
          <textarea
            id="excerpt"
            name="excerpt"
            value={currentExcerpt}
            onChange={(event) => setCurrentExcerpt(event.target.value)}
            rows={3}
            maxLength={300}
            placeholder="A short summary shown on the blog index."
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Cover image</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Upload JPEG, PNG, or WebP images up to 5MB. SVG is not allowed.
            </p>
          </div>
          <label className="inline-flex cursor-pointer justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 has-disabled:cursor-not-allowed has-disabled:opacity-60">
            {isUploading ? "Uploading..." : "Upload cover"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isUploading || !postId}
              onChange={handleCoverUpload}
              className="sr-only"
            />
          </label>
        </div>

        {!postId ? (
          <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
            Save the draft once to enable cover and inline image uploads. Upload
            paths include your user ID and the post ID.
          </p>
        ) : null}

        {currentCoverImageUrl ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentCoverImageUrl}
              alt=""
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
              <p className="truncate text-xs text-slate-500">
                {currentCoverImageUrl}
              </p>
              <button
                type="button"
                onClick={() => setCurrentCoverImageUrl("")}
                className="shrink-0 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section>
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Content</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Drafts can be sparse. Submitting for review requires body content.
            </p>
          </div>
          {editorMessage ? (
            <p className="text-xs font-medium text-emerald-700">{editorMessage}</p>
          ) : null}
        </div>

        <div className="blog-editor-shell overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">
              Developer article editor
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Type <span className="font-mono">/</span> for blocks, use the
              floating controls for formatting, and drop or upload images once
              the draft has been saved.
            </p>
          </div>
          <BlockNoteBlogEditor
            initialBlocks={initialBlocks}
            postId={postId}
            onChange={(nextContentJson, nextContentText) => {
              setContentJsonValue(nextContentJson);
              setContentTextValue(nextContentText);
            }}
            onUploadStart={(message) => {
              setIsUploading(true);
              setUploadError("");
              setEditorMessage(message);
            }}
            onUploadComplete={(message) => {
              setIsUploading(false);
              setEditorMessage(message);
            }}
            onUploadError={(message) => {
              setIsUploading(false);
              setUploadError(message);
            }}
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={backHref}
          className="inline-flex justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
        >
          Back to posts
        </Link>
        <SubmitButtons submitLabel={submitLabel} disabled={isUploading} />
      </div>
    </form>
  );
}
