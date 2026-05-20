"use client";

import { useState } from "react";
import {
  generateNextjsFileTree,
  type GenerateNextjsFileTreeResult,
  type NextjsRouteType,
} from "@/lib/nextjs-file-tree-visualizer";

const routeTypeOptions: Array<{
  label: string;
  value: NextjsRouteType;
}> = [
  { label: "Page route", value: "page" },
  { label: "Layout route", value: "layout" },
  { label: "Loading UI", value: "loading" },
  { label: "Error UI", value: "error" },
  { label: "API Route Handler", value: "route-handler" },
];

const quickExamples = [
  "/about",
  "/blog/[slug]",
  "/api/health",
  "/dashboard/settings",
];

const initialRoutePath = "/about";
const initialRouteType: NextjsRouteType = "page";

export function NextjsFileTreeVisualizerTool() {
  const [routePath, setRoutePath] = useState(initialRoutePath);
  const [routeType, setRouteType] = useState<NextjsRouteType>(initialRouteType);
  const [result, setResult] = useState<GenerateNextjsFileTreeResult | null>(
    null,
  );
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  function handleGenerate() {
    try {
      const nextResult = generateNextjsFileTree({
        routePath,
        routeType,
      });

      setResult(nextResult);
      setError("");
      setStatus("File tree generated.");
    } catch (generateError) {
      setResult(null);
      setStatus("");
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Could not generate a file tree.",
      );
    }
  }

  async function handleCopyFileTree() {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.fileTree);
      setStatus("File tree copied.");
      setError("");
    } catch {
      setStatus("");
      setError("Copy failed. Select the file tree and copy it manually.");
    }
  }

  function handleClear() {
    setRoutePath(initialRoutePath);
    setRouteType(initialRouteType);
    setResult(null);
    setError("");
    setStatus("");
  }

  function handleQuickExample(example: string) {
    setRoutePath(example);
    setRouteType(example.startsWith("/api/") ? "route-handler" : "page");
    setResult(null);
    setError("");
    setStatus("");
  }

  return (
    <section
      aria-labelledby="nextjs-file-tree-tool-heading"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="nextjs-file-tree-tool-heading"
            className="text-2xl font-semibold tracking-tight text-slate-950"
          >
            Generate a file tree
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter a route and choose what kind of App Router file you want to
            visualize. This guide does not execute code or create files.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Generate File Tree
          </button>
          <button
            type="button"
            onClick={handleCopyFileTree}
            disabled={!result}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copy File Tree
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_1fr]">
        <div className="space-y-5">
          <div>
            <label
              htmlFor="nextjs-route-path"
              className="text-sm font-semibold text-slate-900"
            >
              Route path
            </label>
            <input
              id="nextjs-route-path"
              type="text"
              value={routePath}
              onChange={(event) => {
                setRoutePath(event.target.value);
                setError("");
                setStatus("");
              }}
              placeholder="/blog/[slug]"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Start with a slash. Dynamic segments like{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5">[slug]</code>{" "}
              are supported.
            </p>
          </div>

          <div>
            <label
              htmlFor="nextjs-route-type"
              className="text-sm font-semibold text-slate-900"
            >
              Route type
            </label>
            <select
              id="nextjs-route-type"
              value={routeType}
              onChange={(event) => {
                setRouteType(event.target.value as NextjsRouteType);
                setError("");
                setStatus("");
              }}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              {routeTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              Quick examples
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {quickExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleQuickExample(example)}
                  className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Normalized route
            </h3>
            <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800">
              {result?.normalizedRoute ?? "Generate a file tree to see this."}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Generated file tree
            </h3>
            <pre className="mt-2 min-h-24 overflow-x-auto rounded-md border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-emerald-100">
              <code>{result?.fileTree ?? "app/..."}</code>
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Explanation
            </h3>
            {result ? (
              <ul className="mt-2 list-disc space-y-2 rounded-md border border-slate-200 bg-slate-50 p-4 pl-8 text-sm leading-6 text-slate-700">
                {result.explanation.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Explanations will appear after generation.
              </p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Output preview
            </h3>
            <p className="mt-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
              {result?.preview ?? "Preview text will appear here."}
            </p>
          </div>
        </div>
      </div>

      <div aria-live="polite" className="mt-5 space-y-3">
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}
        {status ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {status}
          </p>
        ) : null}
      </div>
    </section>
  );
}
