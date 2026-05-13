"use client";

import { useState } from "react";
import { generateAiCodingPrompt } from "@/lib/ai-coding-prompt-generator";

const initialForm = {
  taskType: "Build feature",
  techStack: "",
  featureDescription: "",
  constraints: "",
  expectedOutput: "",
};

const taskTypes = [
  "Build feature",
  "Fix bug",
  "Refactor code",
  "Write tests",
  "Review code",
  "Improve UI",
];

type FormState = typeof initialForm;

export function AiCodingPromptGeneratorTool() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("");

  function updateField(field: keyof FormState, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setStatus("");
  }

  function handleGenerate() {
    setPrompt(generateAiCodingPrompt(form));
    setStatus("Prompt generated.");
  }

  async function handleCopy() {
    if (!prompt) {
      return;
    }

    try {
      await navigator.clipboard.writeText(prompt);
      setStatus("Prompt copied.");
    } catch {
      setStatus("Copy failed. Select the prompt and copy it manually.");
    }
  }

  function handleClear() {
    setForm(initialForm);
    setPrompt("");
    setStatus("");
  }

  return (
    <section
      aria-labelledby="ai-prompt-generator-tool-heading"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="ai-prompt-generator-tool-heading"
            className="text-2xl font-semibold tracking-tight text-slate-950"
          >
            Generate an AI coding prompt
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Turn task notes into a structured prompt without calling any AI API.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Generate Prompt
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!prompt}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copy Prompt
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
              htmlFor="task-type"
              className="text-sm font-semibold text-slate-900"
            >
              Task type
            </label>
            <select
              id="task-type"
              value={form.taskType}
              onChange={(event) => updateField("taskType", event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              {taskTypes.map((taskType) => (
                <option key={taskType} value={taskType}>
                  {taskType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="tech-stack"
              className="text-sm font-semibold text-slate-900"
            >
              Tech stack
            </label>
            <input
              id="tech-stack"
              value={form.techStack}
              onChange={(event) => updateField("techStack", event.target.value)}
              placeholder="Next.js, TypeScript, Tailwind CSS"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label
              htmlFor="feature-description"
              className="text-sm font-semibold text-slate-900"
            >
              Feature description
            </label>
            <textarea
              id="feature-description"
              value={form.featureDescription}
              onChange={(event) =>
                updateField("featureDescription", event.target.value)
              }
              placeholder="Build a JSON Formatter page with textarea input, validation, copy, and clear actions."
              className="mt-2 min-h-32 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label
              htmlFor="constraints"
              className="text-sm font-semibold text-slate-900"
            >
              Constraints
            </label>
            <textarea
              id="constraints"
              value={form.constraints}
              onChange={(event) => updateField("constraints", event.target.value)}
              placeholder="No backend. Client-side only. Do not add auth or database."
              className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label
              htmlFor="expected-output"
              className="text-sm font-semibold text-slate-900"
            >
              Expected output
            </label>
            <textarea
              id="expected-output"
              value={form.expectedOutput}
              onChange={(event) =>
                updateField("expectedOutput", event.target.value)
              }
              placeholder="Changed files, test results, and a brief explanation."
              className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="generated-prompt"
            className="text-sm font-semibold text-slate-900"
          >
            Generated prompt
          </label>
          <textarea
            id="generated-prompt"
            value={prompt}
            readOnly
            placeholder="Generated AI coding prompt will appear here."
            className="mt-2 min-h-[38rem] w-full resize-y rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
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
