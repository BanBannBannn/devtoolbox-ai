"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type RagSource = {
  documentId: string;
  chunkIndex: number;
  sourceTitle: string;
  sourceAnchor: string;
  snippet: string;
};

type RagRetrievalChunk = RagSource & {
  similarity: number;
};

type RagChatSuccessResponse = {
  success: true;
  answer: string;
  sources: RagSource[];
  usage: {
    ragMessagesUsed: number;
    ragMessagesLimit: number;
    retrievedChunks: number;
    maxRetrievedChunks: number;
  };
  retrievalDetails: {
    queryEmbedded: boolean;
    matchedChunkCount: number;
    similarityMetric: "cosine";
    retrievedChunks: RagRetrievalChunk[];
  };
};

type RagChatFailureResponse = {
  success: false;
  error?: string;
};

type RagChatResponse = RagChatSuccessResponse | RagChatFailureResponse;

const maxMessageLength = 2000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSource(value: unknown): value is RagSource {
  return (
    isRecord(value) &&
    typeof value.documentId === "string" &&
    typeof value.chunkIndex === "number" &&
    typeof value.sourceTitle === "string" &&
    typeof value.sourceAnchor === "string" &&
    typeof value.snippet === "string"
  );
}

function isRetrievalChunk(value: unknown): value is RagRetrievalChunk {
  if (!isRecord(value)) {
    return false;
  }

  const record = value;
  const hasSimilarity = typeof record["similarity"] === "number";

  return hasSimilarity && isSource(record);
}

function parseRagChatResponse(value: unknown): RagChatResponse | null {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return null;
  }

  if (!value.success) {
    return {
      success: false,
      error: typeof value.error === "string" ? value.error : undefined,
    };
  }

  if (
    typeof value.answer !== "string" ||
    !Array.isArray(value.sources) ||
    !isRecord(value.usage) ||
    typeof value.usage.ragMessagesUsed !== "number" ||
    typeof value.usage.ragMessagesLimit !== "number" ||
    typeof value.usage.retrievedChunks !== "number" ||
    typeof value.usage.maxRetrievedChunks !== "number" ||
    !isRecord(value.retrievalDetails) ||
    typeof value.retrievalDetails.queryEmbedded !== "boolean" ||
    typeof value.retrievalDetails.matchedChunkCount !== "number" ||
    value.retrievalDetails.similarityMetric !== "cosine" ||
    !Array.isArray(value.retrievalDetails.retrievedChunks)
  ) {
    return null;
  }

  if (
    !value.sources.every(isSource) ||
    !value.retrievalDetails.retrievedChunks.every(isRetrievalChunk)
  ) {
    return null;
  }

  return {
    success: true,
    answer: value.answer,
    sources: value.sources,
    usage: {
      ragMessagesUsed: value.usage.ragMessagesUsed,
      ragMessagesLimit: value.usage.ragMessagesLimit,
      retrievedChunks: value.usage.retrievedChunks,
      maxRetrievedChunks: value.usage.maxRetrievedChunks,
    },
    retrievalDetails: {
      queryEmbedded: value.retrievalDetails.queryEmbedded,
      matchedChunkCount: value.retrievalDetails.matchedChunkCount,
      similarityMetric: value.retrievalDetails.similarityMetric,
      retrievedChunks: value.retrievalDetails.retrievedChunks,
    },
  };
}

function formatSimilarity(value: number) {
  if (!Number.isFinite(value)) {
    return "n/a";
  }

  return value.toFixed(3);
}

export function RagChatPanel() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<RagChatSuccessResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const remainingCharacters = useMemo(
    () => maxMessageLength - message.length,
    [message],
  );
  const isOverLimit = remainingCharacters < 0;

  async function submitQuestion() {
    const trimmedMessage = message.trim();

    setErrorMessage(null);

    if (!trimmedMessage) {
      setErrorMessage("Enter a question before asking your documents.");
      return;
    }

    if (trimmedMessage.length > maxMessageLength) {
      setErrorMessage(
        `Question must be ${maxMessageLength.toLocaleString()} characters or fewer.`,
      );
      return;
    }

    setIsLoading(true);

    try {
      const fetchResponse = await fetch("/api/rag/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedMessage }),
      });
      const rawData: unknown = await fetchResponse.json().catch(() => null);
      const data = parseRagChatResponse(rawData);

      if (!data) {
        throw new Error("RAG chat returned an unexpected response.");
      }

      if (!data.success) {
        throw new Error(
          data.error ?? "Could not answer from your documents right now.",
        );
      }

      setResponse(data);
      setDetailsOpen(false);
    } catch (error) {
      setResponse(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not answer from your documents right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function clearChat() {
    setMessage("");
    setResponse(null);
    setErrorMessage(null);
    setDetailsOpen(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <label
          htmlFor="rag-question"
          className="text-sm font-semibold text-slate-950"
        >
          Ask your vectorized documents
        </label>
        <textarea
          id="rag-question"
          value={message}
          rows={6}
          maxLength={maxMessageLength + 200}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask a question about your saved and vectorized documents..."
          className="mt-3 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            className={`text-sm ${isOverLimit ? "font-semibold text-red-700" : "text-slate-500"}`}
          >
            {message.length.toLocaleString()} /{" "}
            {maxMessageLength.toLocaleString()} characters
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={clearChat}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={isLoading || isOverLimit}
              onClick={submitQuestion}
              className="rounded-md bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? "Asking..." : "Ask documents"}
            </button>
          </div>
        </div>
        {errorMessage ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {errorMessage}
          </p>
        ) : null}
      </section>

      {isLoading ? (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Searching your vectorized document chunks...
          </p>
        </section>
      ) : null}

      {response ? (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Answer</h2>
          <MarkdownAnswer content={response.answer} />

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <UsagePill
              label="RAG messages"
              value={`${response.usage.ragMessagesUsed.toLocaleString()} / ${response.usage.ragMessagesLimit.toLocaleString()}`}
            />
            <UsagePill
              label="Retrieved chunks"
              value={`${response.usage.retrievedChunks.toLocaleString()} / ${response.usage.maxRetrievedChunks.toLocaleString()}`}
            />
            <UsagePill
              label="Query embedded"
              value={response.retrievalDetails.queryEmbedded ? "Yes" : "No"}
            />
            <UsagePill
              label="Similarity"
              value={response.retrievalDetails.similarityMetric}
            />
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-950">Sources</h3>
            {response.sources.length === 0 ? (
              <p className="mt-3 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
                No source chunks were returned for this answer.
              </p>
            ) : (
              <div className="mt-3 grid gap-3">
                {response.sources.map((source) => (
                  <SourceCard
                    key={`${source.documentId}-${source.chunkIndex}-${source.sourceAnchor}`}
                    source={source}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setDetailsOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
            >
              <span>How this answer was retrieved</span>
              <span className="text-slate-500">
                {detailsOpen ? "Hide" : "Show"}
              </span>
            </button>
            {detailsOpen ? (
              <div className="border-t border-slate-200 p-4">
                <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
                  <DetailRow
                    label="Query embedded"
                    value={
                      response.retrievalDetails.queryEmbedded ? "Yes" : "No"
                    }
                  />
                  <DetailRow
                    label="Matched chunks"
                    value={response.retrievalDetails.matchedChunkCount.toLocaleString()}
                  />
                  <DetailRow
                    label="Similarity metric"
                    value={response.retrievalDetails.similarityMetric}
                  />
                </div>
                <div className="mt-4 grid gap-3">
                  {response.retrievalDetails.retrievedChunks.map((chunk) => (
                    <article
                      key={`${chunk.documentId}-${chunk.chunkIndex}-${chunk.sourceAnchor}`}
                      className="rounded-md bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h4 className="font-semibold text-slate-950">
                          {chunk.sourceTitle}
                        </h4>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Similarity {formatSimilarity(chunk.similarity)}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Chunk {chunk.chunkIndex} · {chunk.sourceAnchor}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {chunk.snippet}
                      </p>
                    </article>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Retrieval details are search diagnostics, not AI thinking.
                  They do not include prompts, full document chunks, raw
                  embeddings, model names, or API keys.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function UsagePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function MarkdownAnswer({ content }: { content: string }) {
  return (
    <div className="mt-4 rounded-md bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          h1: ({ children }) => (
            <h3 className="mb-3 mt-5 text-xl font-semibold text-slate-950 first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="mb-3 mt-5 text-lg font-semibold text-slate-950 first:mt-0">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-base font-semibold text-slate-950 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="my-3 first:mt-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1 pl-5">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-950">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children, className }) => (
            <code
              className={
                className
                  ? `${className} font-mono text-sm text-slate-100`
                  : "rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-950"
              }
            >
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded-md bg-slate-950 p-4 text-sm leading-6 text-slate-100">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function SourceCard({ source }: { source: RagSource }) {
  return (
    <article className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <h4 className="font-semibold text-slate-950">{source.sourceTitle}</h4>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Chunk {source.chunkIndex}
        </p>
      </div>
      <p className="mt-2 text-xs text-slate-500">{source.sourceAnchor}</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        {source.snippet}
      </p>
    </article>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}
