"use client";

import { useState } from "react";
import { generateTestCaseChecklist } from "@/lib/test-case-checklist-generator";

const initialForm = {
  featureName: "",
  mainUserFlow: "",
  edgeCases: "",
  platform: "Web",
};

const platformOptions = ["Web", "Mobile web", "iOS", "Android", "Desktop"];

type FormState = typeof initialForm;

export function TestCaseChecklistGeneratorTool() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [checklist, setChecklist] = useState("");
  const [status, setStatus] = useState("");

  function updateField(field: keyof FormState, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setStatus("");
  }

  function handleGenerate() {
    setChecklist(generateTestCaseChecklist(form));
    setStatus("Checklist generated.");
  }

  async function handleCopy() {
    if (!checklist) {
      return;
    }

    try {
      await navigator.clipboard.writeText(checklist);
      setStatus("Checklist copied.");
    } catch {
      setStatus("Copy failed. Select the checklist and copy it manually.");
    }
  }

  function handleDownload() {
    if (!checklist) {
      return;
    }

    const blob = new Blob([checklist], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qa-checklist.md";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Checklist downloaded.");
  }

  function handleClear() {
    setForm(initialForm);
    setChecklist("");
    setStatus("");
  }

  return (
    <section
      aria-labelledby="test-case-checklist-tool-heading"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="test-case-checklist-tool-heading"
            className="text-2xl font-semibold tracking-tight text-slate-950"
          >
            Generate a QA checklist
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Describe a feature and create a manual test checklist in Markdown.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Generate Checklist
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!checklist}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copy Markdown
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!checklist}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download .md
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
        <div className="space-y-4">
          <div>
            <label
              htmlFor="feature-name"
              className="text-sm font-semibold text-slate-900"
            >
              Feature name
            </label>
            <input
              id="feature-name"
              value={form.featureName}
              onChange={(event) => updateField("featureName", event.target.value)}
              placeholder="JSON Formatter"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label
              htmlFor="main-user-flow"
              className="text-sm font-semibold text-slate-900"
            >
              Main user flow
            </label>
            <textarea
              id="main-user-flow"
              value={form.mainUserFlow}
              onChange={(event) =>
                updateField("mainUserFlow", event.target.value)
              }
              placeholder="User pastes JSON, clicks format, and sees formatted output."
              className="mt-2 min-h-32 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label
              htmlFor="edge-cases"
              className="text-sm font-semibold text-slate-900"
            >
              Edge cases
            </label>
            <textarea
              id="edge-cases"
              value={form.edgeCases}
              onChange={(event) => updateField("edgeCases", event.target.value)}
              placeholder={"Empty input\nInvalid JSON\nLarge JSON"}
              className="mt-2 min-h-36 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Add one edge case per line. Generic edge cases are used if this is
              empty.
            </p>
          </div>

          <div>
            <label
              htmlFor="platform"
              className="text-sm font-semibold text-slate-900"
            >
              Platform
            </label>
            <select
              id="platform"
              value={form.platform}
              onChange={(event) => updateField("platform", event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              {platformOptions.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="checklist-output"
            className="text-sm font-semibold text-slate-900"
          >
            Generated checklist
          </label>
          <textarea
            id="checklist-output"
            value={checklist}
            readOnly
            placeholder="Generated QA checklist will appear here."
            className="mt-2 min-h-[36rem] w-full resize-y rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
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
