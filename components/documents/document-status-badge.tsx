import type { DocumentVectorStatus } from "@/lib/document-types";

const statusLabels: Record<DocumentVectorStatus, string> = {
  not_vectorized: "Not vectorized",
  vectorizing: "Vectorizing",
  vectorized: "Vectorized",
  failed: "Failed",
};

const statusClassNames: Record<DocumentVectorStatus, string> = {
  not_vectorized: "bg-slate-100 text-slate-700",
  vectorizing: "bg-amber-100 text-amber-800",
  vectorized: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

type DocumentStatusBadgeProps = {
  status: DocumentVectorStatus;
};

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClassNames[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
