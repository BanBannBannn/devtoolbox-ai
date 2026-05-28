"use client";

import { BlockNoteView } from "@blocknote/mantine";
import type { PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import {
  extractPlainTextFromEditorJson,
  isSafeHttpUrl,
  type EditorJsonNode,
  type EditorJsonValue,
} from "@/lib/blog/post-utils";

type BlockNoteBlogEditorProps = {
  initialBlocks: EditorJsonNode[];
  postId?: string;
  onChange: (contentJson: string, contentText: string) => void;
  onUploadStart: (message: string) => void;
  onUploadComplete: (message: string) => void;
  onUploadError: (message: string) => void;
};

type UploadResponse =
  | {
      success: true;
      url: string;
      storagePath: string;
    }
  | {
      success: false;
      error: string;
    };

async function uploadInlineBlogImage({
  file,
  postId,
}: {
  file: File;
  postId: string;
}) {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("postId", postId);
  formData.set("kind", "inline");
  formData.set("altText", file.name);

  const response = await fetch("/api/blog/images/upload", {
    method: "POST",
    body: formData,
  });
  const payload = (await response.json()) as UploadResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.success ? "Could not upload image." : payload.error);
  }

  return payload.url;
}

export function BlockNoteBlogEditor({
  initialBlocks,
  postId,
  onChange,
  onUploadStart,
  onUploadComplete,
  onUploadError,
}: BlockNoteBlogEditorProps) {
  const editor = useCreateBlockNote(
    {
      initialContent: initialBlocks as PartialBlock[],
      uploadFile: async (file) => {
        if (!postId) {
          const message = "Save the draft once before uploading inline images.";
          onUploadError(message);
          throw new Error(message);
        }

        onUploadStart("Uploading image...");

        try {
          const url = await uploadInlineBlogImage({ file, postId });
          onUploadComplete("Image uploaded.");

          return url;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Could not upload image.";
          onUploadError(message);
          throw error;
        }
      },
      links: {
        defaultProtocol: "https",
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
        isAllowedUri(url: string) {
          return isSafeHttpUrl(url);
        },
      },
      placeholders: {
        default:
          "Write your article. Use / for blocks, paste code, add images, and shape it like a real developer guide.",
        heading: "Section heading",
        bulletListItem: "List item",
        numberedListItem: "List item",
        checkListItem: "Todo item",
      },
    },
    [postId],
  );

  return (
    <BlockNoteView
      editor={editor}
      theme="light"
      className="min-h-[620px]"
      onChange={(updatedEditor) => {
        const document = updatedEditor.document as EditorJsonValue;
        onChange(
          JSON.stringify(document),
          extractPlainTextFromEditorJson(document),
        );
      }}
    />
  );
}
