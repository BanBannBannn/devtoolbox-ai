"use client";

import { useState } from "react";
import { CodeDemoPreview } from "@/components/code-demo-preview";
import {
  getAllCodeDemoLessons,
  getCodeDemoLessonById,
  getDefaultCodeDemoLesson,
  type CodeDemoLessonId,
} from "@/lib/nextjs-code-demo-lab";

const lessons = getAllCodeDemoLessons();

export function NextjsCodeDemoLabTool() {
  const [selectedLessonId, setSelectedLessonId] = useState<CodeDemoLessonId>(
    getDefaultCodeDemoLesson().id,
  );
  const [status, setStatus] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const selectedLesson =
    getCodeDemoLessonById(selectedLessonId) ?? getDefaultCodeDemoLesson();
  const previewLabel =
    selectedLesson.previewType === "live" ? "Live preview" : "Simulated preview";

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(selectedLesson.code);
      setStatus("Code copied.");
    } catch {
      setStatus("Copy failed. Select the code and copy it manually.");
    }
  }

  function handleResetDemo() {
    setResetKey((currentKey) => currentKey + 1);
    setStatus("Demo reset.");
  }

  return (
    <section
      aria-labelledby="code-demo-lab-heading"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2
            id="code-demo-lab-heading"
            className="text-2xl font-semibold tracking-tight text-slate-950"
          >
            Explore a fixed demo
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Choose a predefined lesson. The preview is built into this page and
            never runs user-provided code.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopyCode}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Copy Code
          </button>
          <button
            type="button"
            onClick={handleResetDemo}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Reset Demo
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_1fr]">
        <div className="space-y-5">
          <div>
            <label
              htmlFor="code-demo-lesson"
              className="text-sm font-semibold text-slate-900"
            >
              Lesson
            </label>
            <select
              id="code-demo-lesson"
              value={selectedLessonId}
              onChange={(event) => {
                setSelectedLessonId(event.target.value as CodeDemoLessonId);
                setResetKey((currentKey) => currentKey + 1);
                setStatus("");
              }}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                {selectedLesson.difficulty}
              </span>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                {previewLabel}
              </span>
            </div>
            <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
              {selectedLesson.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {selectedLesson.concept}
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h3 className="text-sm font-semibold text-amber-950">
              Common mistake
            </h3>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              {selectedLesson.commonMistake}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Code snippet
            </h3>
            <pre className="mt-2 max-h-[28rem] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-emerald-100">
              <code>{selectedLesson.code}</code>
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Preview
            </h3>
            <div className="mt-2">
              <CodeDemoPreview lesson={selectedLesson} resetKey={resetKey} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-950">
                Explanation
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {selectedLesson.explanation}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-950">
                What changes
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {selectedLesson.changeExplanation}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div aria-live="polite" className="mt-5">
        {status ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {status}
          </p>
        ) : null}
      </div>
    </section>
  );
}
