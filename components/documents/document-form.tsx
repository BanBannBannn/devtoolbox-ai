"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DocumentContentType } from "@/lib/document-types";

type DocumentFormProps = {
  action: (formData: FormData) => void;
  title?: string;
  content?: string;
  contentType?: DocumentContentType;
  submitLabel: string;
  maxDocumentCharacters: number;
  errorMessage?: string;
  successMessage?: string;
};

export function DocumentForm({
  action,
  title = "",
  content = "",
  contentType = "markdown",
  submitLabel,
  maxDocumentCharacters,
  errorMessage,
  successMessage,
}: DocumentFormProps) {
  const [currentContent, setCurrentContent] = useState(content);
  const remainingCharacters = useMemo(
    () => maxDocumentCharacters - currentContent.length,
    [currentContent, maxDocumentCharacters],
  );
  const isOverLimit = remainingCharacters < 0;

  return (
    <form action={action} className="space-y-6">
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

      <div>
        <label htmlFor="title" className="text-sm font-semibold text-slate-900">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={title}
          required
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div>
        <label
          htmlFor="content_type"
          className="text-sm font-semibold text-slate-900"
        >
          Content type
        </label>
        <select
          id="content_type"
          name="content_type"
          defaultValue={contentType}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="markdown">Markdown</option>
          <option value="text">Plain text</option>
        </select>
      </div>

      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <label
            htmlFor="content"
            className="text-sm font-semibold text-slate-900"
          >
            Content
          </label>
          <p
            className={`text-sm ${isOverLimit ? "font-semibold text-red-700" : "text-slate-500"}`}
          >
            {currentContent.length.toLocaleString()} /{" "}
            {maxDocumentCharacters.toLocaleString()} characters
          </p>
        </div>
        <textarea
          id="content"
          name="content"
          defaultValue={content}
          required
          rows={18}
          onChange={(event) => setCurrentContent(event.target.value)}
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm leading-6 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        {isOverLimit ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            Remove {Math.abs(remainingCharacters).toLocaleString()} characters
            before saving.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/documents"
          className="inline-flex justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
        >
          Back to documents
        </Link>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
