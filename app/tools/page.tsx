import { ToolCard } from "@/components/tool-card";
import { createMetadata } from "@/lib/seo";
import { getToolsByCategory } from "@/lib/tools";

export const metadata = createMetadata({
  title: "Developer Tools",
  description:
    "Browse free developer tools for formatting JSON, generating READMEs, writing AI prompts, reviewing Git commands, and creating QA checklists.",
  path: "/tools",
});

export default function ToolsPage() {
  const groupedTools = getToolsByCategory();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-950 p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:28px_28px]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl"
        />
        <div className="relative max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
            Tools
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
            Developer tools
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            DevToolBox AI provides small, focused utilities that run in the
            browser where possible. Available tools are linked below, and planned
            tools are clearly marked.
          </p>
        </div>
      </div>

      <div className="mt-12 space-y-10">
        {Object.entries(groupedTools).map(([category, categoryTools]) => {
          if (categoryTools.length === 0) {
            return null;
          }

          return (
            <section key={category} aria-labelledby={`${category}-heading`}>
              <h2
                id={`${category}-heading`}
                className="text-2xl font-semibold tracking-tight text-slate-950"
              >
                {category}
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {categoryTools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
