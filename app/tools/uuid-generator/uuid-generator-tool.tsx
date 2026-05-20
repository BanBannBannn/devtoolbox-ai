"use client";

import { useState } from "react";
import { generateUuidV4List } from "@/lib/uuid-generator";

const initialCount = "1";

export function UuidGeneratorTool() {
  const [count, setCount] = useState(initialCount);
  const [uppercase, setUppercase] = useState(false);
  const [uuids, setUuids] = useState<string[]>([]);
  const [status, setStatus] = useState("");

  const output = uuids.join("\n");

  function handleGenerate() {
    const parsedCount = Number(count);
    const generatedUuids = generateUuidV4List(parsedCount, uppercase);
    const uuidLabel = generatedUuids.length === 1 ? "UUID" : "UUIDs";

    setUuids(generatedUuids);
    setStatus(`${generatedUuids.length} ${uuidLabel} generated.`);
  }

  async function handleCopy() {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setStatus("UUIDs copied.");
    } catch {
      setStatus("Copy failed. Select the UUIDs and copy them manually.");
    }
  }

  function handleClear() {
    setCount(initialCount);
    setUppercase(false);
    setUuids([]);
    setStatus("");
  }

  return (
    <section
      aria-labelledby="uuid-generator-tool-heading"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="uuid-generator-tool-heading"
            className="text-2xl font-semibold tracking-tight text-slate-950"
          >
            Generate UUIDs
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Choose a count from 1 to 100 and generate UUID v4 strings in your
            browser.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Generate UUIDs
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!output}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copy All
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

      <div className="mt-6 grid gap-5 lg:grid-cols-[20rem_1fr]">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="uuid-count"
              className="text-sm font-semibold text-slate-900"
            >
              Count
            </label>
            <input
              id="uuid-count"
              type="number"
              min="1"
              max="100"
              step="1"
              inputMode="numeric"
              value={count}
              onChange={(event) => {
                setCount(event.target.value);
                setStatus("");
              }}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Values below 1 generate one UUID. Values above 100 are capped at
              100.
            </p>
          </div>

          <label
            htmlFor="uuid-uppercase"
            className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3"
          >
            <input
              id="uuid-uppercase"
              type="checkbox"
              checked={uppercase}
              onChange={(event) => {
                setUppercase(event.target.checked);
                setStatus("");
              }}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-900">
                Uppercase output
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Convert generated UUIDs to uppercase hexadecimal characters.
              </span>
            </span>
          </label>
        </div>

        <div>
          <label
            htmlFor="uuid-output"
            className="text-sm font-semibold text-slate-900"
          >
            Generated UUIDs
          </label>
          <textarea
            id="uuid-output"
            value={output}
            readOnly
            placeholder="Generated UUIDs will appear here."
            className="mt-2 min-h-80 w-full resize-y rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
            spellCheck={false}
          />
        </div>
      </div>

      <div aria-live="polite" className="mt-4">
        {status ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {status}
          </p>
        ) : null}
      </div>
    </section>
  );
}
