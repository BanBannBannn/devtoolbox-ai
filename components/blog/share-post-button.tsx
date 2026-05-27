"use client";

import { useState } from "react";

type SharePostButtonProps = {
  title: string;
};

export function SharePostButton({ title }: SharePostButtonProps) {
  const [message, setMessage] = useState("");

  async function handleShare() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url,
        });
        setMessage("Shared");
        return;
      }

      await navigator.clipboard.writeText(url);
      setMessage("Link copied");
    } catch {
      setMessage("Share was cancelled");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleShare}
        className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
      >
        Share article
      </button>
      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}
