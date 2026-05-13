"use client";

import { useState } from "react";
import { formatJson } from "@/lib/json-formatter";

export function JsonFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  function handleFormat() {
    const result = formatJson(input);
    setCopyStatus("");

    if (result.success) {
      setOutput(result.output);
      setError("");
      return;
    }

    setOutput("");
    setError(result.error);
  }

  async function handleCopy() {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopyStatus("Output copied.");
    } catch {
      setCopyStatus("Copy failed. Select the output and copy it manually.");
    }
  }

  function handleClear() {
    setInput("");
    setOutput("");
    setError("");
    setCopyStatus("");
  }

  return (
    <section
      aria-labelledby="json-formatter-tool-heading"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="json-formatter-tool-heading"
            className="text-2xl font-semibold tracking-tight text-slate-950"
          >
            Format JSON
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Paste JSON below. Formatting happens in your browser.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleFormat}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Format JSON
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!output}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copy Output
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

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <label
            htmlFor="json-input"
            className="text-sm font-semibold text-slate-900"
          >
            JSON input
          </label>
          <textarea
            id="json-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder='{"name":"DevToolBox AI"}'
            className="mt-2 min-h-72 w-full resize-y rounded-md border border-slate-300 bg-white p-3 font-mono text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            spellCheck={false}
          />
        </div>

        <div>
          <label
            htmlFor="json-output"
            className="text-sm font-semibold text-slate-900"
          >
            Formatted output
          </label>
          <textarea
            id="json-output"
            value={output}
            readOnly
            placeholder="Formatted JSON will appear here."
            className="mt-2 min-h-72 w-full resize-y rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
            spellCheck={false}
          />
        </div>
      </div>

      <div aria-live="polite" className="mt-4 space-y-2">
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}
        {copyStatus ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {copyStatus}
          </p>
        ) : null}
      </div>
    </section>
  );
}
