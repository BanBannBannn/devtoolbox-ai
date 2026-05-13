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
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Tools
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Developer tools
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          DevToolBox AI will provide small, focused utilities that run in the
          browser where possible. Individual tools are intentionally not built
          in this phase.
        </p>
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
                  <article
                    key={tool.slug}
                    className="rounded-lg border border-slate-200 bg-white p-6"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="text-lg font-semibold text-slate-950">
                        {tool.title}
                      </h3>
                      <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                        Planned
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {tool.description}
                    </p>
                    <p className="mt-5 text-sm text-slate-500">
                      Target URL: <span className="font-mono">{tool.href}</span>
                    </p>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
