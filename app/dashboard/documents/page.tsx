import Link from "next/link";
import { Plus } from "lucide-react";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { listDocumentsForCurrentUser } from "@/lib/documents";
import { createMetadata } from "@/lib/seo";

type DocumentsPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

const messages: Record<string, string> = {
  deleted: "Document deleted.",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export const metadata = createMetadata({
  title: "Documents",
  description: "Manage your private DevToolBox AI text and Markdown documents.",
  path: "/dashboard/documents",
});

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const [documents, params] = await Promise.all([
    listDocumentsForCurrentUser(),
    searchParams,
  ]);
  const message = params.message ? messages[params.message] : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Back to dashboard
          </Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Documents
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Create and manage private text or Markdown documents. Vectorization
            and RAG chat arrive in later phases.
          </p>
        </div>
        <Link
          href="/dashboard/documents/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          New document
        </Link>
      </div>

      {message ? (
        <p className="mt-8 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {message}
        </p>
      ) : null}

      {documents.length === 0 ? (
        <section className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-950">
            No documents yet
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Add your first Markdown or text document now. Later phases will let
            you vectorize these documents and chat with them.
          </p>
          <Link
            href="/dashboard/documents/new"
            className="mt-6 inline-flex rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Create document
          </Link>
        </section>
      ) : (
        <section className="mt-8 grid gap-4">
          {documents.map((document) => (
            <Link
              key={document.id}
              href={`/dashboard/documents/${document.id}`}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    {document.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Updated {formatDate(document.updated_at)}
                  </p>
                </div>
                <DocumentStatusBadge status={document.vector_status} />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">
                {document.character_count.toLocaleString()} characters
              </p>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
