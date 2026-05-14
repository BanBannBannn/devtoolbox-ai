import Link from "next/link";
import { GitCommandHelperTool } from "./git-command-helper-tool";
import { createMetadata } from "@/lib/seo";

const examples = [
  {
    goal: "Check status",
    command: "git status",
    description: "See changed, staged, and untracked files.",
  },
  {
    goal: "Create a branch",
    command: "git checkout -b feature/my-change",
    description: "Create a new branch and switch to it.",
  },
  {
    goal: "Undo last commit but keep changes",
    command: "git reset --soft HEAD~1",
    description: "Move the last commit back into staged changes.",
  },
];

export const metadata = createMetadata({
  title: "Git Command Helper",
  description:
    "Choose a beginner Git goal and review a suggested command, explanation, and warning when needed.",
  path: "/tools/git-command-helper",
});

export default function GitCommandHelperPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Browser-based developer tool
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Git Command Helper
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Pick a common Git goal and review a suggested command with a
          beginner-friendly explanation. The helper never executes commands and
          highlights risky actions before you copy anything.
        </p>
      </div>

      <div className="mt-10">
        <GitCommandHelperTool />
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-10">
          <section aria-labelledby="what-it-does">
            <h2
              id="what-it-does"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              What this Git helper does
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              This tool maps beginner Git goals to common command suggestions.
              It explains what each command does and shows warnings for risky
              commands that can rewrite history or discard uncommitted work.
            </p>
          </section>

          <section aria-labelledby="how-to-use">
            <h2
              id="how-to-use"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              How to use it
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-slate-600">
              <li>Select the Git goal that matches what you want to do.</li>
              <li>Fill in a branch name, commit message, or file path if shown.</li>
              <li>Click Generate Command.</li>
              <li>Read the explanation and warning before copying.</li>
              <li>Run commands manually only when you understand the effect.</li>
            </ol>
          </section>

          <section aria-labelledby="examples">
            <h2
              id="examples"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Common Git examples
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {examples.map((example) => (
                <article
                  key={example.goal}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <h3 className="font-semibold text-slate-950">
                    {example.goal}
                  </h3>
                  <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-sm text-white">
                    <code>{example.command}</code>
                  </pre>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {example.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="safety-tips">
            <h2
              id="safety-tips"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              Safety tips for risky commands
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-slate-600">
              <li>Run `git status` before changing branches or discarding files.</li>
              <li>Commit or stash important work before commands that remove changes.</li>
              <li>Be careful with reset commands after pushing commits.</li>
              <li>Ask a teammate before rewriting shared branch history.</li>
              <li>Copy from this helper, but always run commands manually.</li>
            </ul>
          </section>

          <section aria-labelledby="faq">
            <h2
              id="faq"
              className="text-2xl font-semibold tracking-tight text-slate-950"
            >
              FAQ
            </h2>
            <div className="mt-4 space-y-5">
              <div>
                <h3 className="font-semibold text-slate-950">
                  Does this tool run Git commands?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  No. It only shows command suggestions and explanations. You
                  decide whether to run a command in your own terminal.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Why do some commands show warnings?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  Commands that can rewrite commits or discard local work are
                  risky. The warning is there so you pause before copying.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  What should I do if I am unsure?
                </h3>
                <p className="mt-2 leading-7 text-slate-600">
                  Start with `git status`, read Git output carefully, and ask
                  for help before running commands that mention reset, checkout,
                  or discard.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside
          aria-labelledby="related-tools"
          className="h-fit rounded-lg border border-slate-200 bg-white p-5"
        >
          <h2
            id="related-tools"
            className="text-lg font-semibold tracking-tight text-slate-950"
          >
            Related tools
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6">
            <li>
              <Link
                href="/tools/ai-coding-prompt-generator"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                AI Coding Prompt Generator
              </Link>
              <p className="text-slate-600">Structure implementation prompts.</p>
            </li>
            <li>
              <Link
                href="/tools/readme-generator"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                README Generator
              </Link>
              <p className="text-slate-600">Draft project documentation.</p>
            </li>
            <li>
              <Link
                href="/tools"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Test Case Checklist Generator
              </Link>
              <p className="text-slate-600">Plan manual QA coverage.</p>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
