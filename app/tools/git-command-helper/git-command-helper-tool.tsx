"use client";

import { useState } from "react";
import {
  type GitCommandHelpResult,
  type GitGoal,
  getGitCommandHelp,
} from "@/lib/git-command-helper";

const goals: Array<{ label: string; value: GitGoal }> = [
  { label: "Check status", value: "check status" },
  { label: "Create a new branch", value: "create a new branch" },
  { label: "Switch branch", value: "switch branch" },
  { label: "Add all changes", value: "add all changes" },
  { label: "Commit changes", value: "commit changes" },
  { label: "Push branch", value: "push branch" },
  { label: "Pull latest changes", value: "pull latest changes" },
  { label: "See commit history", value: "see commit history" },
  {
    label: "Undo last commit but keep changes",
    value: "undo last commit but keep changes",
  },
  { label: "Discard local file changes", value: "discard local file changes" },
];

const initialGoal: GitGoal = "check status";

function goalUsesBranchName(goal: GitGoal) {
  return (
    goal === "create a new branch" ||
    goal === "switch branch" ||
    goal === "push branch"
  );
}

function goalUsesCommitMessage(goal: GitGoal) {
  return goal === "commit changes";
}

function goalUsesFilePath(goal: GitGoal) {
  return goal === "discard local file changes";
}

export function GitCommandHelperTool() {
  const [goal, setGoal] = useState<GitGoal>(initialGoal);
  const [branchName, setBranchName] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [filePath, setFilePath] = useState("");
  const [result, setResult] = useState<GitCommandHelpResult | null>(null);
  const [status, setStatus] = useState("");

  function handleGenerate() {
    setResult(
      getGitCommandHelp({
        goal,
        branchName,
        commitMessage,
        filePath,
      }),
    );
    setStatus("Command generated. Review it before running anything.");
  }

  async function handleCopy() {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.command);
      setStatus("Command copied.");
    } catch {
      setStatus("Copy failed. Select the command and copy it manually.");
    }
  }

  function handleClear() {
    setGoal(initialGoal);
    setBranchName("");
    setCommitMessage("");
    setFilePath("");
    setResult(null);
    setStatus("");
  }

  return (
    <section
      aria-labelledby="git-command-helper-tool-heading"
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="git-command-helper-tool-heading"
            className="text-2xl font-semibold tracking-tight text-slate-950"
          >
            Generate a Git command
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Select a beginner Git goal and review the suggested command. This
            tool never runs commands.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Generate Command
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!result}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copy Command
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
              htmlFor="git-goal"
              className="text-sm font-semibold text-slate-900"
            >
              Goal
            </label>
            <select
              id="git-goal"
              value={goal}
              onChange={(event) => {
                setGoal(event.target.value as GitGoal);
                setStatus("");
              }}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              {goals.map((goalOption) => (
                <option key={goalOption.value} value={goalOption.value}>
                  {goalOption.label}
                </option>
              ))}
            </select>
          </div>

          {goalUsesBranchName(goal) ? (
            <div>
              <label
                htmlFor="branch-name"
                className="text-sm font-semibold text-slate-900"
              >
                Branch name
              </label>
              <input
                id="branch-name"
                value={branchName}
                onChange={(event) => {
                  setBranchName(event.target.value);
                  setStatus("");
                }}
                placeholder="feature/json-formatter"
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                spellCheck={false}
              />
            </div>
          ) : null}

          {goalUsesCommitMessage(goal) ? (
            <div>
              <label
                htmlFor="commit-message"
                className="text-sm font-semibold text-slate-900"
              >
                Commit message
              </label>
              <input
                id="commit-message"
                value={commitMessage}
                onChange={(event) => {
                  setCommitMessage(event.target.value);
                  setStatus("");
                }}
                placeholder="Add JSON formatter"
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          ) : null}

          {goalUsesFilePath(goal) ? (
            <div>
              <label
                htmlFor="file-path"
                className="text-sm font-semibold text-slate-900"
              >
                File path
              </label>
              <input
                id="file-path"
                value={filePath}
                onChange={(event) => {
                  setFilePath(event.target.value);
                  setStatus("");
                }}
                placeholder="app/page.tsx"
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                spellCheck={false}
              />
            </div>
          ) : null}

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <p className="font-semibold text-slate-950">Safety reminder</p>
            <p className="mt-2">
              This helper only displays command suggestions. Read the command
              and explanation before running anything in your terminal.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="git-command-output"
              className="text-sm font-semibold text-slate-900"
            >
              Suggested command
            </label>
            <textarea
              id="git-command-output"
              value={result?.command ?? ""}
              readOnly
              placeholder="Suggested Git command will appear here."
              className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
              spellCheck={false}
            />
          </div>

          {result ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-950">
                Explanation
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {result.explanation}
              </p>
            </div>
          ) : null}

          {result?.warning ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="text-sm font-semibold text-red-800">Warning</h3>
              <p className="mt-2 text-sm leading-6 text-red-700">
                {result.warning}
              </p>
            </div>
          ) : null}
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
