"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteChatSessionAction,
  renameChatSessionAction,
} from "@/app/dashboard/rag-chat/actions";

const chatSessionTitleMaxLength = 120;

export function RagSessionActions({
  sessionId,
  currentTitle,
  isActive = false,
}: {
  sessionId: string;
  currentTitle: string;
  isActive?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function cancelRename() {
    setTitle(currentTitle);
    setIsEditing(false);
    setError(null);
    setMessage(null);
  }

  function renameSession() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await renameChatSessionAction({
        sessionId,
        title,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setTitle(result.title ?? title.trim());
      setIsEditing(false);
      setMessage("Renamed.");
      router.refresh();
    });
  }

  function deleteSession() {
    setError(null);
    setMessage(null);

    const confirmed = window.confirm(
      "Delete this RAG chat session? This also removes its saved messages.",
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteChatSessionAction({
        sessionId,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (isActive) {
        router.push("/dashboard/rag-chat");
        return;
      }

      setMessage("Deleted.");
      router.refresh();
    });
  }

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      {isEditing ? (
        <div className="space-y-2">
          <label className="sr-only" htmlFor={`rename-${sessionId}`}>
            Rename chat session
          </label>
          <input
            id={`rename-${sessionId}`}
            value={title}
            maxLength={chatSessionTitleMaxLength + 20}
            disabled={isPending}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={renameSession}
              className="rounded-md bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={cancelRename}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setIsEditing(true);
              setError(null);
              setMessage(null);
            }}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Rename
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={deleteSession}
            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Working..." : "Delete"}
          </button>
        </div>
      )}

      {error ? (
        <p className="mt-2 text-xs font-medium text-red-700">{error}</p>
      ) : null}
      {message ? (
        <p className="mt-2 text-xs font-medium text-emerald-700">{message}</p>
      ) : null}
    </div>
  );
}
