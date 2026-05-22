export type UsageEventType =
  | "rag_message"
  | "vectorize_job"
  | "embedding_tokens"
  | "llm_output_tokens"
  | "document_created"
  | "chunk_created";

export type UsageCounts = Record<UsageEventType, number>;

export type UsageEventQuantity = {
  event_type: UsageEventType;
  quantity: number;
};

export const usageEventTypes: UsageEventType[] = [
  "rag_message",
  "vectorize_job",
  "embedding_tokens",
  "llm_output_tokens",
  "document_created",
  "chunk_created",
];

export function getCurrentMonthPeriodStartUtc(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `${year}-${month}-01`;
}

export function checkDocumentCountLimit(
  documentCount: number,
  maxSavedDocuments: number,
) {
  return documentCount < maxSavedDocuments;
}

export function checkMaxDocumentLength(
  characterCount: number,
  maxDocumentCharacters: number,
) {
  return characterCount <= maxDocumentCharacters;
}

export function createEmptyUsageCounts(): UsageCounts {
  return usageEventTypes.reduce((counts, eventType) => {
    counts[eventType] = 0;
    return counts;
  }, {} as UsageCounts);
}

export function summarizeUsageEvents(events: UsageEventQuantity[]) {
  const counts = createEmptyUsageCounts();

  events.forEach((event) => {
    counts[event.event_type] += event.quantity;
  });

  return counts;
}
