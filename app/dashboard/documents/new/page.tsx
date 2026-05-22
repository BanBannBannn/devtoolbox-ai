import Link from "next/link";
import { DocumentForm } from "@/components/documents/document-form";
import { createDocumentAction } from "@/app/dashboard/documents/actions";
import { getDocumentErrorMessage, requireAuthenticatedSupabase } from "@/lib/documents";
import { createMetadata } from "@/lib/seo";

type NewDocumentPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export const metadata = createMetadata({
  title: "New Document",
  description: "Create a private text or Markdown document.",
  path: "/dashboard/documents/new",
});

export default async function NewDocumentPage({
  searchParams,
}: NewDocumentPageProps) {
  await requireAuthenticatedSupabase();

  const params = await searchParams;
  const errorMessage = getDocumentErrorMessage(params.error);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/dashboard/documents"
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        Back to documents
      </Link>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
          New document
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Save text or Markdown notes now. Vectorization is intentionally
          disabled until a later phase.
        </p>
        <div className="mt-8">
          <DocumentForm
            action={createDocumentAction}
            submitLabel="Create document"
            errorMessage={errorMessage}
          />
        </div>
      </div>
    </div>
  );
}
