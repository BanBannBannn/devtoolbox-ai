import Link from "next/link";
import { RagSessionActions } from "./rag-session-actions";

type RagSessionListItem = {
  id: string;
  title: string;
  updatedAt: string;
};

export function RagSessionList({
  sessions,
  activeSessionId,
}: {
  sessions: RagSessionListItem[];
  activeSessionId?: string;
}) {
  return (
    <aside className="flex max-h-64 min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:h-full lg:max-h-none">
      <div className="shrink-0 border-b border-slate-200 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">
            Recent chats
          </h2>
          <Link
            href="/dashboard/rag-chat"
            className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            New chat
          </Link>
        </div>
      </div>

      {sessions.length === 0 ? (
        <p className="m-5 rounded-md bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          No RAG chat sessions yet. Ask a question to create your first saved
          session.
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid gap-2">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;

              return (
                <article
                  key={session.id}
                  className={`rounded-md border px-3 py-3 transition ${
                    isActive
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-200 hover:bg-emerald-50"
                  }`}
                >
                  <Link href={`/dashboard/rag-chat/${session.id}`}>
                    <p className="line-clamp-2 text-sm font-semibold text-slate-950">
                      {session.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Updated {formatDateTime(session.updatedAt)}
                    </p>
                  </Link>
                  <RagSessionActions
                    sessionId={session.id}
                    currentTitle={session.title}
                    isActive={isActive}
                  />
                </article>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

function formatDateTime(value: string) {
  if (!value) {
    return "recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
