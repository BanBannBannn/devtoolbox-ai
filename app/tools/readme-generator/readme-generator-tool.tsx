"use client";

import { useState } from "react";
import { generateReadme } from "@/lib/readme-generator";

const initialForm = {
  projectName: "",
  description: "",
  techStack: "",
  installCommand: "",
  runCommand: "",
  features: "",
};

type FormState = typeof initialForm;

export function ReadmeGeneratorTool() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [markdown, setMarkdown] = useState("");
  const [status, setStatus] = useState("");

  function updateField(field: keyof FormState, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setStatus("");
  }

  function handleGenerate() {
    setMarkdown(generateReadme(form));
    setStatus("README markdown generated.");
  }

  async function handleCopy() {
    if (!markdown) {
      return;
    }

    try {
      await navigator.clipboard.writeText(markdown);
      setStatus("Markdown copied.");
    } catch {
      setStatus("Copy failed. Select the markdown and copy it manually.");
    }
  }

  function handleDownload() {
    if (!markdown) {
      return;
    }

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "README.md";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("README.md downloaded.");
  }

  function handleClear() {
    setForm(initialForm);
    setMarkdown("");
    setStatus("");
  }

  return (
    <section
      aria-labelledby="readme-generator-tool-heading"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="readme-generator-tool-heading"
            className="text-2xl font-semibold tracking-tight text-slate-950"
          >
            Generate README markdown
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Fill in the project details and generate a starter README in your
            browser.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Generate README
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!markdown}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copy Markdown
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!markdown}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download README.md
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
              htmlFor="project-name"
              className="text-sm font-semibold text-slate-900"
            >
              Project name
            </label>
            <input
              id="project-name"
              value={form.projectName}
              onChange={(event) => updateField("projectName", event.target.value)}
              placeholder="DevToolBox AI"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label
              htmlFor="project-description"
              className="text-sm font-semibold text-slate-900"
            >
              Description
            </label>
            <textarea
              id="project-description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Free developer tools for students and software engineers."
              className="mt-2 min-h-24 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
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
              htmlFor="install-command"
              className="text-sm font-semibold text-slate-900"
            >
              Installation command
            </label>
            <input
              id="install-command"
              value={form.installCommand}
              onChange={(event) =>
                updateField("installCommand", event.target.value)
              }
              placeholder="npm install"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              spellCheck={false}
            />
          </div>

          <div>
            <label
              htmlFor="run-command"
              className="text-sm font-semibold text-slate-900"
            >
              Run command
            </label>
            <input
              id="run-command"
              value={form.runCommand}
              onChange={(event) => updateField("runCommand", event.target.value)}
              placeholder="npm run dev"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              spellCheck={false}
            />
          </div>

          <div>
            <label
              htmlFor="features"
              className="text-sm font-semibold text-slate-900"
            >
              Features
            </label>
            <textarea
              id="features"
              value={form.features}
              onChange={(event) => updateField("features", event.target.value)}
              placeholder={"JSON Formatter\nREADME Generator"}
              className="mt-2 min-h-32 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Add one feature per line.
            </p>
          </div>
        </div>

        <div>
          <label
            htmlFor="readme-output"
            className="text-sm font-semibold text-slate-900"
          >
            Generated markdown
          </label>
          <textarea
            id="readme-output"
            value={markdown}
            readOnly
            placeholder="Generated README markdown will appear here."
            className="mt-2 min-h-[42rem] w-full resize-y rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
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
