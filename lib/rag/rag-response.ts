export type RagUsageSummary = {
  ragMessagesUsed: number;
  ragMessagesLimit: number;
  retrievedChunks: number;
  maxRetrievedChunks: number;
};

export function createRagUsageSummary({
  ragMessagesUsed,
  ragMessagesLimit,
  retrievedChunks,
  maxRetrievedChunks,
}: RagUsageSummary): RagUsageSummary {
  return {
    ragMessagesUsed,
    ragMessagesLimit,
    retrievedChunks,
    maxRetrievedChunks,
  };
}
