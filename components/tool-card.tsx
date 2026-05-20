import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getToolVisual } from "@/lib/tool-visuals";
import type { Tool } from "@/lib/tools";

type ToolCardProps = {
  tool: Tool;
};

export function ToolCard({ tool }: ToolCardProps) {
  const visual = getToolVisual(tool.slug);
  const Icon = visual.icon;
  const isAvailable = tool.status === "available";
  const statusLabel = isAvailable ? "Available" : "Planned";
  const statusClassName = isAvailable
    ? "bg-emerald-100 text-emerald-800"
    : "bg-amber-100 text-amber-800";

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${visual.iconClassName}`}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClassName}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {tool.category}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">
          {tool.title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {tool.description}
        </p>
      </div>

      <p
        className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold ${
          isAvailable ? "text-emerald-700" : "text-slate-500"
        }`}
      >
        {isAvailable ? "Open tool" : "Coming soon"}
        {isAvailable ? <ArrowRight aria-hidden="true" className="h-4 w-4" /> : null}
      </p>
    </>
  );

  const className = `group relative overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br ${visual.accent} p-5 transition`;

  if (isAvailable) {
    return (
      <Link
        href={tool.href}
        className={`${className} block hover:border-emerald-300 hover:shadow-sm`}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <article className={`${className} opacity-90`}>
      {cardContent}
    </article>
  );
}
