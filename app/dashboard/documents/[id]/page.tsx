import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteDocumentForm } from "@/components/documents/delete-document-form";
import { DocumentForm } from "@/components/documents/document-form";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { VectorizeDocumentButton } from "@/components/rag/vectorize-document-button";
import {
  deleteDocumentAction,
  updateDocumentAction,
} from "@/app/dashboard/documents/actions";
import { getDocumentErrorMessage, getDocumentForCurrentUser } from "@/lib/documents";
import { createMetadata } from "@/lib/seo";
import { getCurrentUserProfileAndPlan } from "@/lib/usage/plan-limits";

type EditDocumentPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

const messages: Record<string, string> = {
  created: "Document created.",
  saved: "Document saved.",
};

export async function generateMetadata({ params }: EditDocumentPageProps) {
  const { id } = await params;
  const document = await getDocumentForCurrentUser(id);

  return createMetadata({
    title: document ? document.title : "Document Not Found",
    description: "View and edit a private DevToolBox AI document.",
    path: `/dashboard/documents/${id}`,
  });
}

export default async function EditDocumentPage({
  params,
  searchParams,
}: EditDocumentPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [document, usageResult] = await Promise.all([
    getDocumentForCurrentUser(id),
    getCurrentUserProfileAndPlan(),
  ]);

  if (!document) {
    notFound();
  }

  if (!usageResult.success) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/documents"
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Back to documents
        </Link>
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-800">
          {usageResult.error}
        </div>
      </div>
    );
  }

  const updateAction = updateDocumentAction.bind(null, document.id);
  const deleteAction = deleteDocumentAction.bind(null, document.id);
  const errorMessage = getDocumentErrorMessage(
    query.error,
    usageResult.planLimits.max_document_characters,
  );
  const successMessage = query.message ? messages[query.message] : undefined;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/dashboard/documents"
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        Back to documents
      </Link>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
              Edit document
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Update your private text or Markdown document. Changing content
              resets vector metadata for the later vectorization phase.
            </p>
          </div>
          <DocumentStatusBadge status={document.vector_status} />
        </div>

        <div className="mt-8">
          <DocumentForm
            action={updateAction}
            title={document.title}
            content={document.content}
            contentType={document.content_type}
            submitLabel="Save document"
            maxDocumentCharacters={usageResult.planLimits.max_document_characters}
            errorMessage={errorMessage}
            successMessage={successMessage}
          />
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <VectorizeDocumentButton
            documentId={document.id}
            initialStatus={document.vector_status}
          />
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-950">Danger zone</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Delete this document from your private dashboard. This does not
            affect public tools or future RAG settings.
          </p>
          <div className="mt-4">
            <DeleteDocumentForm action={deleteAction} />
          </div>
        </div>
      </div>
    </div>
  );
}
