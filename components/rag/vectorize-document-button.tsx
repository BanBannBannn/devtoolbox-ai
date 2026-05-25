"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DocumentVectorStatus } from "@/lib/document-types";

type VectorizeDocumentButtonProps = {
  documentId: string;
  initialStatus: DocumentVectorStatus;
};

type VectorizeSuccessResponse = {
  success: true;
  status: DocumentVectorStatus;
  chunkCount: number;
  usage: {
    embeddingModel: string;
  };
};

type VectorizeFailureResponse = {
  success: false;
  status?: DocumentVectorStatus;
  error?: string;
};

type VectorizeResponse = VectorizeSuccessResponse | VectorizeFailureResponse;

const freeEmbeddingModel = "nvidia/llama-nemotron-embed-vl-1b-v2:free";

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

function getButtonLabel(status: DocumentVectorStatus, isLoading: boolean) {
  if (isLoading || status === "vectorizing") {
    return "Vectorizing...";
  }

  if (status === "vectorized") {
    return "Re-vectorize document";
  }

  if (status === "failed") {
    return "Try vectorization again";
  }

  return "Vectorize document";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDocumentVectorStatus(value: unknown): value is DocumentVectorStatus {
  return (
    value === "not_vectorized" ||
    value === "vectorizing" ||
    value === "vectorized" ||
    value === "failed"
  );
}

function parseVectorizeResponse(value: unknown): VectorizeResponse | null {
  if (!isObject(value) || typeof value.success !== "boolean") {
    return null;
  }

  if (value.success === true) {
    if (
      !isDocumentVectorStatus(value.status) ||
      typeof value.chunkCount !== "number" ||
      !isObject(value.usage) ||
      typeof value.usage.embeddingModel !== "string"
    ) {
      return null;
    }

    return {
      success: true,
      status: value.status,
      chunkCount: value.chunkCount,
      usage: {
        embeddingModel: value.usage.embeddingModel,
      },
    };
  }

  return {
    success: false,
    status: isDocumentVectorStatus(value.status) ? value.status : undefined,
    error: typeof value.error === "string" ? value.error : undefined,
  };
}

export function VectorizeDocumentButton({
  documentId,
  initialStatus,
}: VectorizeDocumentButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState<DocumentVectorStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function vectorizeDocument() {
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/documents/${documentId}/vectorize`, {
        method: "POST",
      });
      const rawData: unknown = await response.json().catch(() => null);
      const data = parseVectorizeResponse(rawData);

      if (!data) {
        throw new Error("Document vectorization failed. Please try again.");
      }

      if (!data.success) {
        if (data.status) {
          setStatus(data.status);
          router.refresh();
        }
        throw new Error(
          data.error ?? "Document vectorization failed. Please try again.",
        );
      }

      if (!response.ok) {
        throw new Error("Document vectorization failed. Please try again.");
      }

      setStatus(data.status);
      setSuccessMessage(
        `Document vectorized into ${data.chunkCount.toLocaleString()} chunks with ${data.usage.embeddingModel}.`,
      );
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Document vectorization failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const isDisabled = isLoading || status === "vectorizing";

  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Document vectorization
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Convert this saved document into searchable chunks for a later
            personal RAG chat experience.
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClassNames[status]}`}
        >
          {statusLabels[status]}
        </span>
      </div>

      <div className="mt-4 rounded-md border border-amber-300 bg-white px-4 py-3 text-sm leading-6 text-amber-950">
        <p className="font-semibold">Privacy warning</p>
        <p className="mt-1">
          This sends document chunks to the configured embedding provider. The
          current OpenRouter free model,
          {" "}
          <span className="font-mono text-xs">{freeEmbeddingModel}</span>, may
          log prompts or outputs for provider improvement. Do not vectorize
          personal, confidential, private, or business-critical documents with
          this free model.
        </p>
      </div>

      {successMessage ? (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {successMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="button"
        disabled={isDisabled}
        onClick={vectorizeDocument}
        className="mt-5 inline-flex w-full justify-center rounded-md bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
      >
        {getButtonLabel(status, isLoading)}
      </button>
    </section>
  );
}
