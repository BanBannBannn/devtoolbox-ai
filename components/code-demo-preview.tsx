"use client";

import { useState } from "react";
import type { CodeDemoLesson } from "@/lib/nextjs-code-demo-lab";

type CodeDemoPreviewProps = {
  lesson: CodeDemoLesson;
  resetKey: number;
};

function PreviewShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">{label}</p>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          Safe preview
        </span>
      </div>
      {children}
    </div>
  );
}

function CounterPreview({ resetKey }: { resetKey: number }) {
  const [count, setCount] = useState(0);

  return (
    <PreviewShell label="Live counter">
      <button
        key={resetKey}
        type="button"
        onClick={() => setCount((currentCount) => currentCount + 1)}
        className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Count: {count}
      </button>
    </PreviewShell>
  );
}

function PropsPreview() {
  return (
    <PreviewShell label="Live props output">
      <p className="rounded-md bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm">
        Hello, Ada!
      </p>
    </PreviewShell>
  );
}

function ConditionalPreview() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <PreviewShell label="Live conditional output">
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsLoggedIn((currentValue) => !currentValue)}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          Toggle login state
        </button>
        <p className="rounded-md bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm">
          {isLoggedIn ? "Welcome back." : "Please sign in."}
        </p>
      </div>
    </PreviewShell>
  );
}

function ListPreview() {
  const tools = ["JSON Formatter", "README Generator", "Git Helper"];

  return (
    <PreviewShell label="Live list output">
      <ul className="space-y-2 rounded-md bg-white p-4 text-sm text-slate-800 shadow-sm">
        {tools.map((tool) => (
          <li key={tool} className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            {tool}
          </li>
        ))}
      </ul>
    </PreviewShell>
  );
}

function SimulatedPreview({ lesson }: { lesson: CodeDemoLesson }) {
  const previewTextByLessonId: Record<string, string> = {
    "client-vs-server-component":
      "Server content renders first. A small Client Component handles browser-only interaction.",
    "page-tsx-route": "Visiting /about renders the About page.",
    "layout-tsx-wrapper":
      "Dashboard pages render inside a shared layout with dashboard navigation.",
    "route-handler-get-response":
      '{ "ok": true, "service": "DevToolBox AI" }',
    "environment-variable-safety":
      "Public value: Site URL configured. Server-only secret: hidden.",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-950">
          Simulated preview
        </p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          No execution
        </span>
      </div>
      <p className="rounded-md bg-slate-50 px-4 py-3 font-mono text-sm leading-6 text-slate-800">
        {previewTextByLessonId[lesson.id] ??
          "This lesson uses a simulated output preview."}
      </p>
    </div>
  );
}

export function CodeDemoPreview({ lesson, resetKey }: CodeDemoPreviewProps) {
  switch (lesson.livePreviewId) {
    case "counter":
      return <CounterPreview key={resetKey} resetKey={resetKey} />;
    case "props-card":
      return <PropsPreview />;
    case "conditional-toggle":
      return <ConditionalPreview key={resetKey} />;
    case "tool-list":
      return <ListPreview />;
  }

  switch (lesson.id) {
    case "client-vs-server-component":
    case "page-tsx-route":
    case "layout-tsx-wrapper":
    case "route-handler-get-response":
    case "environment-variable-safety":
      return <SimulatedPreview lesson={lesson} />;
  }
}
