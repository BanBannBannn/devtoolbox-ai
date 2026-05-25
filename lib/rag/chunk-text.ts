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

const DEFAULT_CHUNK_SIZE = 1200;
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

  const logicalBlocks = groupHeadingsWithFollowingBlocks(
    splitIntoLogicalBlocks(normalizedText),
    chunkSize,
  );
  const chunkContents = addOverlapToChunks(
    buildChunkContents(logicalBlocks, chunkSize, chunkOverlap),
    chunkOverlap,
  );
  const chunks = createTextChunks(chunkContents, sourceTitle);

  if (input.maxChunks !== undefined && chunks.length > input.maxChunks) {
    return {
      success: false,
      error: `Text would create more than ${input.maxChunks.toLocaleString()} chunks.`,
    };
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

function splitIntoLogicalBlocks(text: string) {
  const blocks: string[] = [];
  const lines = text.split("\n");
  let paragraphLines: string[] = [];
  let listLines: string[] = [];
  let codeLines: string[] = [];
  let isInCodeFence = false;

  function flushParagraph() {
    if (paragraphLines.length === 0) {
      return;
    }

    blocks.push(paragraphLines.join("\n").trim());
    paragraphLines = [];
  }

  function flushList() {
    if (listLines.length === 0) {
      return;
    }

    blocks.push(listLines.join("\n").trim());
    listLines = [];
  }

  function flushCode() {
    if (codeLines.length === 0) {
      return;
    }

    blocks.push(codeLines.join("\n").trim());
    codeLines = [];
  }

  for (const line of lines) {
    if (isInCodeFence) {
      codeLines.push(line);

      if (isFenceLine(line)) {
        isInCodeFence = false;
        flushCode();
      }

      continue;
    }

    if (isFenceLine(line)) {
      flushParagraph();
      flushList();
      isInCodeFence = true;
      codeLines = [line];
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    if (isHeadingLine(line)) {
      flushParagraph();
      flushList();
      blocks.push(line.trim());
      continue;
    }

    if (isListItemLine(line)) {
      flushParagraph();
      listLines.push(line);
      continue;
    }

    if (listLines.length > 0 && isIndentedLine(line)) {
      listLines.push(line);
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();
  flushCode();

  return blocks.filter((block) => block.trim().length > 0);
}

function groupHeadingsWithFollowingBlocks(blocks: string[], chunkSize: number) {
  const groupedBlocks: string[] = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const currentBlock = blocks[index];
    const nextBlock = blocks[index + 1];

    if (
      nextBlock &&
      isHeadingLine(currentBlock) &&
      !isHeadingLine(nextBlock)
    ) {
      const groupedBlock = `${currentBlock}\n\n${nextBlock}`.trim();

      if (groupedBlock.length <= chunkSize) {
        groupedBlocks.push(groupedBlock);
        index += 1;
        continue;
      }
    }

    groupedBlocks.push(currentBlock);
  }

  return groupedBlocks;
}

function buildChunkContents(
  logicalBlocks: string[],
  chunkSize: number,
  chunkOverlap: number,
) {
  const chunks: string[] = [];
  let currentChunk = "";

  function flushCurrentChunk() {
    const trimmedChunk = currentChunk.trim();

    if (trimmedChunk) {
      chunks.push(trimmedChunk);
    }

    currentChunk = "";
  }

  for (const block of logicalBlocks) {
    const trimmedBlock = block.trim();

    if (!trimmedBlock) {
      continue;
    }

    if (trimmedBlock.length > chunkSize) {
      flushCurrentChunk();
      chunks.push(...splitLongBlock(trimmedBlock, chunkSize, chunkOverlap));
      continue;
    }

    if (!currentChunk) {
      currentChunk = trimmedBlock;
      continue;
    }

    const candidate = `${currentChunk}\n\n${trimmedBlock}`;

    if (candidate.length <= chunkSize) {
      currentChunk = candidate;
      continue;
    }

    flushCurrentChunk();
    currentChunk = trimmedBlock;
  }

  flushCurrentChunk();

  return chunks;
}

function splitLongBlock(block: string, chunkSize: number, chunkOverlap: number) {
  const chunks: string[] = [];
  const stepSize = chunkSize - chunkOverlap;

  for (let start = 0; start < block.length; start += stepSize) {
    const chunk = block.slice(start, start + chunkSize).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (start + chunkSize >= block.length) {
      break;
    }
  }

  return chunks;
}

function addOverlapToChunks(chunks: string[], chunkOverlap: number) {
  if (chunkOverlap === 0 || chunks.length <= 1) {
    return chunks;
  }

  return chunks.map((chunk, index) => {
    if (index === 0) {
      return chunk;
    }

    const previousChunk = chunks[index - 1];
    const overlap = previousChunk.slice(-chunkOverlap).trim();

    if (!overlap || overlap === previousChunk.trim() || chunk.startsWith(overlap)) {
      return chunk;
    }

    return `${overlap}\n\n${chunk}`.trim();
  });
}

function createTextChunks(chunkContents: string[], sourceTitle: string) {
  return chunkContents
    .map((content) => content.trim())
    .filter((content) => content.length > 0)
    .map((content, chunkIndex): TextChunk => ({
      chunkIndex,
      content,
      characterCount: content.length,
      tokenEstimate: Math.ceil(content.length / 4),
      sourceTitle,
      sourceAnchor: `chunk-${chunkIndex}`,
    }));
}

function isFenceLine(line: string) {
  return line.trimStart().startsWith("```");
}

function isHeadingLine(line: string) {
  return /^#{1,6}\s+\S/.test(line.trim());
}

function isListItemLine(line: string) {
  return /^(\s*)([-*+]\s+|\d+\.\s+)\S/.test(line);
}

function isIndentedLine(line: string) {
  return /^\s+\S/.test(line);
}
