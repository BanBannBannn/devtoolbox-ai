import Link from "next/link";
import type { ReactNode } from "react";
import {
  isSafeHttpUrl,
  isSafeImageUrl,
  type EditorJsonNode,
  type EditorJsonValue,
} from "@/lib/blog/post-utils";

type EditorJsonRendererProps = {
  content: EditorJsonValue;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function getNodeProps(node: EditorJsonNode) {
  return asRecord(node.props ?? node.attrs);
}

function getTextAlignClass(node: EditorJsonNode) {
  const textAlignment = getNodeProps(node).textAlignment ?? getNodeProps(node).textAlign;

  switch (textAlignment) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    default:
      return "text-left";
  }
}

function getInlineContentText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map(getInlineContentText).join("");
  }

  if (!content || typeof content !== "object") {
    return "";
  }

  const node = content as EditorJsonNode;

  if (typeof node.text === "string") {
    return node.text;
  }

  return getInlineContentText(node.content);
}

function renderStyledText(node: EditorJsonNode, key: string) {
  let content: ReactNode = node.text ?? "";
  const styles = asRecord(node.styles);

  if (styles.bold) {
    content = <strong>{content}</strong>;
  }

  if (styles.italic) {
    content = <em>{content}</em>;
  }

  if (styles.underline) {
    content = <span className="underline">{content}</span>;
  }

  if (styles.strike) {
    content = <s>{content}</s>;
  }

  if (styles.code) {
    content = (
      <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-900">
        {content}
      </code>
    );
  }

  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") {
      content = <strong>{content}</strong>;
    }

    if (mark.type === "italic") {
      content = <em>{content}</em>;
    }

    if (mark.type === "underline") {
      content = <span className="underline">{content}</span>;
    }

    if (mark.type === "strike") {
      content = <s>{content}</s>;
    }

    if (mark.type === "code") {
      content = (
        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-900">
          {content}
        </code>
      );
    }

    if (mark.type === "link") {
      const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "";

      if (isSafeHttpUrl(href)) {
        content = renderSafeLink(href, content, `${key}-link`);
      }
    }
  }

  return <span key={key}>{content}</span>;
}

function renderSafeLink(href: string, content: ReactNode, key: string) {
  return (
    <Link
      key={key}
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="font-semibold text-emerald-700 underline hover:text-emerald-800"
    >
      {content}
    </Link>
  );
}

function renderInlineContent(content: unknown, keyPrefix: string): ReactNode {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return null;
  }

  return content.map((child, index) => {
    if (typeof child === "string") {
      return <span key={`${keyPrefix}-${index}`}>{child}</span>;
    }

    if (!child || typeof child !== "object") {
      return null;
    }

    const node = child as EditorJsonNode;

    if (node.type === "link") {
      const href = typeof node.href === "string" ? node.href : "";
      const linkContent = renderInlineContent(node.content, `${keyPrefix}-${index}`);

      return isSafeHttpUrl(href)
        ? renderSafeLink(href, linkContent, `${keyPrefix}-${index}`)
        : linkContent;
    }

    return renderStyledText(node, `${keyPrefix}-${index}`);
  });
}

function renderChildren(node: EditorJsonNode, keyPrefix: string) {
  const children = Array.isArray(node.children) ? node.children : [];
  const tiptapChildren = Array.isArray(node.content)
    ? node.content.filter(
        (child): child is EditorJsonNode =>
          Boolean(child) &&
          typeof child === "object" &&
          typeof (child as EditorJsonNode).type === "string" &&
          (child as EditorJsonNode).type !== "text" &&
          (child as EditorJsonNode).type !== "link",
      )
    : [];

  return [...children, ...tiptapChildren].map((child, index) =>
    renderBlock(child, `${keyPrefix}-${index}`),
  );
}

function renderListItem(node: EditorJsonNode, key: string) {
  const checkbox =
    node.type === "checkListItem" ? (
      <input
        type="checkbox"
        checked={Boolean(getNodeProps(node).checked)}
        readOnly
        className="mt-1 size-4 rounded border-slate-300 text-emerald-600"
      />
    ) : null;

  return (
    <li key={key} className={checkbox ? "flex gap-3" : undefined}>
      {checkbox}
      <span>
        {renderInlineContent(node.content, `${key}-content`)}
        {renderChildren(node, `${key}-children`)}
      </span>
    </li>
  );
}

function renderTable(node: EditorJsonNode, key: string) {
  const content = asRecord(node.content);
  const rows = Array.isArray(content.rows) ? content.rows : [];

  if (rows.length === 0) {
    return null;
  }

  return (
    <div key={key} className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <tbody className="divide-y divide-slate-200">
          {rows.map((row, rowIndex) => {
            const cells = Array.isArray(asRecord(row).cells)
              ? (asRecord(row).cells as unknown[])
              : [];

            return (
              <tr key={`${key}-row-${rowIndex}`}>
                {cells.map((cell, cellIndex) => (
                  <td
                    key={`${key}-cell-${rowIndex}-${cellIndex}`}
                    className="border-r border-slate-200 px-3 py-2 align-top last:border-r-0"
                  >
                    {renderInlineContent(
                      asRecord(cell).content ?? cell,
                      `${key}-cell-${rowIndex}-${cellIndex}`,
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function renderBlock(node: EditorJsonNode, key: string): ReactNode {
  if (node.type === "text") {
    return renderStyledText(node, key);
  }

  if (node.type === "hardBreak") {
    return <br key={key} />;
  }

  if (node.type === "heading") {
    const level = getNodeProps(node).level === 1 ? 1 : getNodeProps(node).level === 3 ? 3 : 2;
    const className = `${getTextAlignClass(node)} font-semibold tracking-tight text-slate-950`;
    const content = renderInlineContent(node.content, `${key}-content`);

    if (level === 1) {
      return (
        <h1 key={key} className={`${className} text-4xl`}>
          {content}
        </h1>
      );
    }

    if (level === 3) {
      return (
        <h3 key={key} className={`${className} text-xl`}>
          {content}
        </h3>
      );
    }

    return (
      <h2 key={key} className={`${className} text-2xl`}>
        {content}
      </h2>
    );
  }

  if (node.type === "bulletListItem") {
    return (
      <ul key={key} className="list-disc space-y-2 pl-6 leading-7 text-slate-600">
        {renderListItem(node, `${key}-item`)}
      </ul>
    );
  }

  if (node.type === "numberedListItem") {
    return (
      <ol key={key} className="list-decimal space-y-2 pl-6 leading-7 text-slate-600">
        {renderListItem(node, `${key}-item`)}
      </ol>
    );
  }

  if (node.type === "checkListItem") {
    return (
      <ul key={key} className="space-y-2 leading-7 text-slate-600">
        {renderListItem(node, `${key}-item`)}
      </ul>
    );
  }

  if (node.type === "bulletList") {
    return (
      <ul key={key} className="list-disc space-y-2 pl-6 leading-7 text-slate-600">
        {renderChildren(node, key)}
      </ul>
    );
  }

  if (node.type === "orderedList") {
    return (
      <ol key={key} className="list-decimal space-y-2 pl-6 leading-7 text-slate-600">
        {renderChildren(node, key)}
      </ol>
    );
  }

  if (node.type === "listItem") {
    return <li key={key}>{renderChildren(node, key)}</li>;
  }

  if (node.type === "quote" || node.type === "blockquote") {
    return (
      <blockquote
        key={key}
        className="border-l-4 border-emerald-300 pl-4 text-slate-600"
      >
        {renderInlineContent(node.content, `${key}-content`)}
        {renderChildren(node, `${key}-children`)}
      </blockquote>
    );
  }

  if (node.type === "codeBlock") {
    return (
      <pre
        key={key}
        className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-emerald-100"
      >
        <code>{getInlineContentText(node.content)}</code>
      </pre>
    );
  }

  if (node.type === "image") {
    const props = getNodeProps(node);
    const src =
      typeof props.url === "string"
        ? props.url
        : typeof props.src === "string"
          ? props.src
          : "";
    const alt =
      typeof props.caption === "string" && props.caption.trim()
        ? props.caption
        : typeof props.alt === "string" && props.alt.trim()
          ? props.alt
          : typeof props.name === "string"
            ? props.name
            : "";

    if (!isSafeImageUrl(src) || !src) {
      return null;
    }

    return (
      <figure key={key} className="overflow-hidden rounded-lg border border-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="max-h-[720px] w-full object-contain"
        />
        {alt ? (
          <figcaption className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
            {alt}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (node.type === "divider") {
    return <hr key={key} className="border-slate-200" />;
  }

  if (node.type === "table") {
    return renderTable(node, key);
  }

  return (
    <p key={key} className={`leading-7 text-slate-600 ${getTextAlignClass(node)}`}>
      {renderInlineContent(node.content, `${key}-content`)}
      {renderChildren(node, `${key}-children`)}
    </p>
  );
}

export function EditorJsonRenderer({ content }: EditorJsonRendererProps) {
  const root = content as EditorJsonNode;
  const blocks =
    !Array.isArray(content) && root.type === "doc" && Array.isArray(root.content)
      ? (root.content as EditorJsonNode[])
      : Array.isArray(content)
        ? content
        : [content];

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => renderBlock(block, `root-${index}`))}
    </div>
  );
}
