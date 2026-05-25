export function calculateReplacementChunkTotal({
  currentTotalChunks,
  oldChunksForDocument,
  newChunkCount,
}: {
  currentTotalChunks: number;
  oldChunksForDocument: number;
  newChunkCount: number;
}) {
  return currentTotalChunks - oldChunksForDocument + newChunkCount;
}

export function isVectorizeQuotaAvailable({
  used,
  limit,
}: {
  used: number;
  limit: number;
}) {
  return used < limit;
}

export function isChunkTotalWithinLimit({
  newTotal,
  maxChunksTotal,
}: {
  newTotal: number;
  maxChunksTotal: number;
}) {
  return newTotal <= maxChunksTotal;
}

export function getVectorizationUserSafeError(error: unknown) {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Could not vectorize the document. Please try again later.";
}
