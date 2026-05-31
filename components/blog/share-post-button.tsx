"use client";

import { useState } from "react";
import { Copy, Share2 } from "lucide-react";

type SharePostButtonProps = {
  title: string;
  url: string;
};

export function SharePostButton({ title, url }: SharePostButtonProps) {
  const [message, setMessage] = useState("");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied");
    } catch {
      setMessage("Could not copy the link");
    }
  }

  async function handleNativeShare() {
    if (typeof navigator.share !== "function") {
      setMessage("Browser sharing is not available");
      return;
    }

    try {
      await navigator.share({ title, url });
      setMessage("Shared");
    } catch {
      setMessage("Share was cancelled");
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!url}
          title="Copy public article link"
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Copy aria-hidden="true" className="size-4" />
          Copy link
        </button>
        <button
          type="button"
          onClick={handleNativeShare}
          disabled={!url}
          title="Share article"
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Share2 aria-hidden="true" className="size-4" />
          Share
        </button>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
        >
          X
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
        >
          LinkedIn
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
        >
          Facebook
        </a>
      </div>
      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}
