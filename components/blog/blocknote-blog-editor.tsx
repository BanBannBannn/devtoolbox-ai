"use client";

import { useRef, useState } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import type { Block, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import {
  extractPlainTextFromEditorJson,
  isSafeHttpUrl,
  type EditorJsonNode,
  type EditorJsonValue,
} from "@/lib/blog/post-utils";
import { validateBlogImageFile } from "@/lib/blog/image-upload";

type BlockNoteBlogEditorProps = {
  initialBlocks: EditorJsonNode[];
  postId?: string;
  onChange: (contentJson: string, contentText: string) => void;
  onUploadStart: (message: string) => void;
  onUploadComplete: (message: string) => void;
  onUploadError: (message: string) => void;
};

type ToolbarState = {
  blockType: string;
  headingLevel: number | null;
  styles: Record<string, boolean>;
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
  const validation = validateBlogImageFile(file);

  if (!validation.success) {
    throw new Error(validation.error);
  }

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

function getToolbarState(editor: ReturnType<typeof useCreateBlockNote>): ToolbarState {
  const activeStyles = editor.getActiveStyles() as Record<string, boolean>;
  const currentBlock = editor.getTextCursorPosition().block as Block;
  const props = currentBlock.props as Record<string, unknown>;

  return {
    blockType: currentBlock.type,
    headingLevel: typeof props.level === "number" ? props.level : null,
    styles: activeStyles,
  };
}

function runHistoryAction(
  editor: ReturnType<typeof useCreateBlockNote>,
  action: "undo" | "redo",
) {
  const historyAction = editor[action];

  // TODO: Add enabled/disabled toolbar state if BlockNote exposes a supported
  // history capability API. Keyboard undo/redo remains handled by BlockNote.
  if (typeof historyAction === "function") {
    historyAction.call(editor);
  }
}

function getCurrentBlock(editor: ReturnType<typeof useCreateBlockNote>) {
  return editor.getTextCursorPosition().block as Block;
}

type ToolbarButtonProps = {
  active?: boolean;
  disabled?: boolean;
  children: string;
  title: string;
  onClick: () => void;
};

function ToolbarButton({
  active,
  disabled,
  children,
  title,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 shrink-0 items-center justify-center rounded-md border px-2.5 text-xs font-semibold transition ${
        active
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      } disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300`}
    >
      {children}
    </button>
  );
}

export function BlockNoteBlogEditor({
  initialBlocks,
  postId,
  onChange,
  onUploadStart,
  onUploadComplete,
  onUploadError,
}: BlockNoteBlogEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
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
  const [toolbarState, setToolbarState] = useState(() => getToolbarState(editor));

  function refreshToolbarState() {
    setToolbarState(getToolbarState(editor));
  }

  function focusEditor() {
    editor.focus();
  }

  function updateCurrentBlock(update: PartialBlock) {
    const block = getCurrentBlock(editor);
    editor.updateBlock(block, update);
    focusEditor();
    refreshToolbarState();
  }

  function toggleStyle(style: "bold" | "italic" | "underline" | "strike" | "code") {
    editor.toggleStyles({ [style]: true });
    focusEditor();
    refreshToolbarState();
  }

  function updateLink() {
    const selectedText = editor.getSelectedText();
    const previousUrl = editor.getSelectedLinkUrl() ?? "https://";
    const url = window.prompt("Link URL", previousUrl);

    if (url === null) {
      focusEditor();
      return;
    }

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      editor.deleteLink();
      focusEditor();
      refreshToolbarState();
      return;
    }

    if (!isSafeHttpUrl(trimmedUrl)) {
      onUploadError("Links must use http or https.");
      focusEditor();
      return;
    }

    const linkText =
      selectedText ||
      window.prompt("Link text", trimmedUrl)?.trim() ||
      trimmedUrl;

    editor.createLink(trimmedUrl, linkText);
    focusEditor();
    refreshToolbarState();
  }

  async function handleToolbarImageUpload(file: File) {
    if (!postId) {
      onUploadError("Save the draft once before uploading inline images.");
      return;
    }

    onUploadStart("Uploading image...");

    try {
      const url = await uploadInlineBlogImage({ file, postId });
      const currentBlock = getCurrentBlock(editor);
      editor.insertBlocks(
        [
          {
            type: "image",
            props: {
              url,
              name: file.name,
              caption: "",
            },
          },
        ],
        currentBlock,
        "after",
      );
      onUploadComplete("Image uploaded.");
      focusEditor();
      refreshToolbarState();
    } catch (error) {
      onUploadError(
        error instanceof Error ? error.message : "Could not upload image.",
      );
    }
  }

  function clearFormatting() {
    editor.removeStyles({
      bold: true,
      italic: true,
      underline: true,
      strike: true,
      code: true,
    });
    updateCurrentBlock({ type: "paragraph" });
  }

  const isHeading =
    toolbarState.blockType === "heading" ? toolbarState.headingLevel : null;

  return (
    <>
      <div className="border-b border-slate-200 bg-slate-50/95 px-3 py-2 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto">
          <ToolbarButton
            title="Undo"
            onClick={() => {
              runHistoryAction(editor, "undo");
              focusEditor();
              refreshToolbarState();
            }}
          >
            Undo
          </ToolbarButton>
          <ToolbarButton
            title="Redo"
            onClick={() => {
              runHistoryAction(editor, "redo");
              focusEditor();
              refreshToolbarState();
            }}
          >
            Redo
          </ToolbarButton>
          <ToolbarButton
            title="Paragraph"
            active={toolbarState.blockType === "paragraph"}
            onClick={() => updateCurrentBlock({ type: "paragraph" })}
          >
            Paragraph
          </ToolbarButton>
          <ToolbarButton
            title="Heading 1"
            active={isHeading === 1}
            onClick={() => updateCurrentBlock({ type: "heading", props: { level: 1 } })}
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            title="Heading 2"
            active={isHeading === 2}
            onClick={() => updateCurrentBlock({ type: "heading", props: { level: 2 } })}
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            title="Heading 3"
            active={isHeading === 3}
            onClick={() => updateCurrentBlock({ type: "heading", props: { level: 3 } })}
          >
            H3
          </ToolbarButton>
          <ToolbarButton
            title="Bold"
            active={Boolean(toolbarState.styles.bold)}
            onClick={() => toggleStyle("bold")}
          >
            B
          </ToolbarButton>
          <ToolbarButton
            title="Italic"
            active={Boolean(toolbarState.styles.italic)}
            onClick={() => toggleStyle("italic")}
          >
            I
          </ToolbarButton>
          <ToolbarButton
            title="Underline"
            active={Boolean(toolbarState.styles.underline)}
            onClick={() => toggleStyle("underline")}
          >
            U
          </ToolbarButton>
          <ToolbarButton
            title="Strike"
            active={Boolean(toolbarState.styles.strike)}
            onClick={() => toggleStyle("strike")}
          >
            S
          </ToolbarButton>
          <ToolbarButton
            title="Inline code"
            active={Boolean(toolbarState.styles.code)}
            onClick={() => toggleStyle("code")}
          >
            Code
          </ToolbarButton>
          <ToolbarButton
            title="Bullet list"
            active={toolbarState.blockType === "bulletListItem"}
            onClick={() => updateCurrentBlock({ type: "bulletListItem" })}
          >
            Bullets
          </ToolbarButton>
          <ToolbarButton
            title="Numbered list"
            active={toolbarState.blockType === "numberedListItem"}
            onClick={() => updateCurrentBlock({ type: "numberedListItem" })}
          >
            Numbers
          </ToolbarButton>
          <ToolbarButton
            title="Quote"
            active={toolbarState.blockType === "quote"}
            onClick={() => updateCurrentBlock({ type: "quote" })}
          >
            Quote
          </ToolbarButton>
          <ToolbarButton
            title="Code block"
            active={toolbarState.blockType === "codeBlock"}
            onClick={() => updateCurrentBlock({ type: "codeBlock" })}
          >
            Block
          </ToolbarButton>
          <ToolbarButton title="Link" onClick={updateLink}>
            Link
          </ToolbarButton>
          <ToolbarButton
            title="Upload image"
            disabled={!postId}
            onClick={() => imageInputRef.current?.click()}
          >
            Image
          </ToolbarButton>
          <ToolbarButton title="Clear formatting" onClick={clearFormatting}>
            Clear
          </ToolbarButton>
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";

            if (file) {
              void handleToolbarImageUpload(file);
            }
          }}
        />
      </div>
      <BlockNoteView
        editor={editor}
        theme="light"
        className="min-h-[620px]"
        onSelectionChange={refreshToolbarState}
        onChange={(updatedEditor) => {
          const document = updatedEditor.document as EditorJsonValue;
          onChange(
            JSON.stringify(document),
            extractPlainTextFromEditorJson(document),
          );
          refreshToolbarState();
        }}
      />
    </>
  );
}
