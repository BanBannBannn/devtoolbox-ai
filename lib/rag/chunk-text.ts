export type ChunkTextInput = {
  text: string;
  sourceTitle: string;
  chunkSize?: number;
  chunkOverlap?: number;
  maxChunks?: number;
};

export type TextChunk = {
  chunkIndex: number;
  content: string;
  characterCount: number;
  tokenEstimate: number;
  sourceTitle: string;
  sourceAnchor: string;
};

export type ChunkTextResult =
  | {
      success: true;
      chunks: TextChunk[];
    }
  | {
      success: false;
      error: string;
    };

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 150;

export function chunkTextForEmbedding(
  input: ChunkTextInput,
): ChunkTextResult {
  const chunkSize = input.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunkOverlap = input.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP;
  const sourceTitle = input.sourceTitle.trim();
  const normalizedText = normalizeLineEndings(input.text).trim();

  if (!normalizedText) {
    return {
      success: false,
      error: "Text is required before chunking.",
    };
  }

  if (!sourceTitle) {
    return {
      success: false,
      error: "Source title is required before chunking.",
    };
  }

  if (!isPositiveInteger(chunkSize)) {
    return {
      success: false,
      error: "Chunk size must be a positive integer.",
    };
  }

  if (!Number.isInteger(chunkOverlap) || chunkOverlap < 0) {
    return {
      success: false,
      error: "Chunk overlap must be zero or a positive integer.",
    };
  }

  if (chunkOverlap >= chunkSize) {
    return {
      success: false,
      error: "Chunk overlap must be smaller than chunk size.",
    };
  }

  if (input.maxChunks !== undefined && !isPositiveInteger(input.maxChunks)) {
    return {
      success: false,
      error: "Max chunks must be a positive integer.",
    };
  }

  const chunks: TextChunk[] = [];
  const stepSize = chunkSize - chunkOverlap;

  for (let start = 0; start < normalizedText.length; start += stepSize) {
    const chunkContent = normalizedText
      .slice(start, Math.min(start + chunkSize, normalizedText.length))
      .trim();

    if (!chunkContent) {
      continue;
    }

    const chunkIndex = chunks.length;

    chunks.push({
      chunkIndex,
      content: chunkContent,
      characterCount: chunkContent.length,
      tokenEstimate: Math.ceil(chunkContent.length / 4),
      sourceTitle,
      sourceAnchor: `chunk-${chunkIndex}`,
    });

    if (input.maxChunks !== undefined && chunks.length > input.maxChunks) {
      return {
        success: false,
        error: `Text would create more than ${input.maxChunks.toLocaleString()} chunks.`,
      };
    }

    if (start + chunkSize >= normalizedText.length) {
      break;
    }
  }

  if (chunks.length === 0) {
    return {
      success: false,
      error: "Text did not produce any non-empty chunks.",
    };
  }

  return {
    success: true,
    chunks,
  };
}

function normalizeLineEndings(value: string) {
  return value.replace(/\r\n?/g, "\n");
}

function isPositiveInteger(value: number) {
  return Number.isInteger(value) && value > 0;
}
