import { FileText, MessageSquareText, Search, Terminal } from "lucide-react";

export function HeroVisual() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-950 p-5 shadow-sm">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:24px_24px]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white">
          <Terminal aria-hidden="true" className="h-4 w-4 text-emerald-300" />
          devtoolbox-ai
        </div>

        <div className="mt-5 grid gap-3">
          <div className="rounded-md border border-white/10 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Knowledge workspace
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  Project Notes
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <FileText aria-hidden="true" className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <p>Vectorized: onboarding notes, API docs, launch checklist</p>
              <p className="font-medium text-emerald-700">
                Ready for document chat.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-white/10 p-4 text-white">
              <MessageSquareText
                aria-hidden="true"
                className="h-5 w-5 text-amber-300"
              />
              <p className="mt-3 text-sm font-semibold">Ask documents</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">
                Answers grounded in your saved context.
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/10 p-4 text-white">
              <Search aria-hidden="true" className="h-5 w-5 text-cyan-300" />
              <p className="mt-3 text-sm font-semibold">Search knowledge</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">
                Find project details when you need them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
