export const blogPostStatuses = [
  "draft",
  "pending_review",
  "published",
  "rejected",
  "archived",
] as const;

export type BlogPostStatus = (typeof blogPostStatuses)[number];

export type BlogPostFormIntent = "save_draft" | "submit_review";

export type EditorJsonNode = {
  id?: string;
  type?: string;
  text?: string;
  href?: string;
  styles?: Record<string, boolean | string | number | null | undefined>;
  attrs?: Record<string, unknown>;
  props?: Record<string, unknown>;
  marks?: Array<{
    type?: string;
    attrs?: Record<string, unknown>;
  }>;
  content?: unknown;
  children?: EditorJsonNode[];
};

export type EditorJsonValue = EditorJsonNode | EditorJsonNode[];

export type TipTapJsonNode = EditorJsonNode;

export type WriterBlogPostInput = {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  contentJson: EditorJsonValue;
  contentText: string;
  intent: BlogPostFormIntent;
};

export const emptyEditorDocument: EditorJsonNode[] = [
  {
    type: "paragraph",
    content: [],
    children: [],
  },
];

export const emptyTiptapDocument: TipTapJsonNode = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

export function parseBlogPostStatus(value: unknown): BlogPostStatus {
  return typeof value === "string" &&
    blogPostStatuses.includes(value as BlogPostStatus)
    ? (value as BlogPostStatus)
    : "draft";
}

export function slugifyTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

export function isValidSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function normalizeBlogSlug(slug: string, title: string) {
  return slugifyTitle(slug || title);
}

export function isSafeHttpUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return false;
  }

  try {
    const url = new URL(trimmedValue);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSafeImageUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return true;
  }

  return isSafeHttpUrl(trimmedValue);
}

function extractTextFromInlineContent(value: unknown, textParts: string[]) {
  if (typeof value === "string") {
    textParts.push(value);
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      extractTextFromInlineContent(item, textParts);
    }

    return;
  }

  const currentNode = value as EditorJsonNode;

  if (typeof currentNode.text === "string") {
    textParts.push(currentNode.text);
  }

  if (Array.isArray(currentNode.content)) {
    extractTextFromInlineContent(currentNode.content, textParts);
  }
}

function isInlineContentArray(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "string" ||
        (Boolean(item) &&
          typeof item === "object" &&
          (typeof (item as EditorJsonNode).text === "string" ||
            (item as EditorJsonNode).type === "link")),
    )
  );
}

export function extractPlainTextFromEditorJson(value: unknown): string {
  const textParts: string[] = [];

  function visit(node: unknown) {
    if (!node || typeof node !== "object") {
      return;
    }

    if (Array.isArray(node)) {
      for (const child of node) {
        visit(child);
      }

      return;
    }

    const currentNode = node as EditorJsonNode;

    if (typeof currentNode.content === "string") {
      textParts.push(currentNode.content);
    }

    if (isInlineContentArray(currentNode.content)) {
      extractTextFromInlineContent(currentNode.content, textParts);
    }

    if (typeof currentNode.text === "string") {
      textParts.push(currentNode.text);
    }

    if (Array.isArray(currentNode.content) && !isInlineContentArray(currentNode.content)) {
      for (const child of currentNode.content) {
        visit(child);
      }
    }

    if (Array.isArray(currentNode.children)) {
      for (const child of currentNode.children) {
        visit(child);
      }
    }

    if (
      currentNode.type === "paragraph" ||
      currentNode.type === "heading" ||
      currentNode.type === "blockquote" ||
      currentNode.type === "listItem" ||
      currentNode.type === "bulletListItem" ||
      currentNode.type === "numberedListItem" ||
      currentNode.type === "checkListItem" ||
      currentNode.type === "quote" ||
      currentNode.type === "codeBlock"
    ) {
      textParts.push("\n");
    }
  }

  visit(value);

  return textParts
    .join(" ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function extractPlainTextFromTiptapJson(value: unknown): string {
  return extractPlainTextFromEditorJson(value);
}

export function getInitialEditorBlocks(value: unknown): EditorJsonNode[] {
  if (Array.isArray(value) && value.length > 0) {
    return value.filter(
      (block): block is EditorJsonNode =>
        Boolean(block) && typeof block === "object",
    );
  }

  return emptyEditorDocument;
}

export function parseEditorJson(value: FormDataEntryValue | null): EditorJsonValue {
  if (typeof value !== "string" || !value.trim()) {
    return emptyEditorDocument;
  }

  try {
    const parsed = JSON.parse(value) as EditorJsonValue;

    if (!parsed || typeof parsed !== "object") {
      return emptyEditorDocument;
    }

    return parsed;
  } catch {
    return emptyEditorDocument;
  }
}

export function parseTiptapJson(value: FormDataEntryValue | null): EditorJsonValue {
  return parseEditorJson(value);
}

export function getBlogPostInputFromFormData(
  formData: FormData,
): WriterBlogPostInput {
  const contentJson = parseEditorJson(formData.get("content_json"));
  const extractedContentText = extractPlainTextFromEditorJson(contentJson);
  const submittedContentText = String(formData.get("content_text") ?? "").trim();
  const rawIntent = String(formData.get("intent") ?? "save_draft");

  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    coverImageUrl: String(formData.get("cover_image_url") ?? ""),
    contentJson,
    contentText: extractedContentText || submittedContentText,
    intent: rawIntent === "submit_review" ? "submit_review" : "save_draft",
  };
}

export function canEditWriterPostStatus(status: BlogPostStatus) {
  return status === "draft" || status === "rejected";
}

export function canSubmitPostForReview(status: BlogPostStatus) {
  return status === "draft" || status === "rejected";
}
