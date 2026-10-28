"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

type RichTextHtmlProps = {
  html?: string | null;
  className?: string;
  emptyFallback?: string;
  /** Collapse long content behind Read more / Show less. */
  collapsible?: boolean;
  /** Visible lines when collapsed. Default 6. */
  maxLines?: number;
};

/** Renders organiser-authored rich text HTML (event/venue descriptions). */
export function RichTextHtml({
  html,
  className = "",
  emptyFallback,
  collapsible = false,
  maxLines = 6,
}: RichTextHtmlProps) {
  const contentId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);

  const content = String(html ?? "").trim();
  const textOnly = content
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, "")
    .trim();

  useEffect(() => {
    setExpanded(false);
  }, [content]);

  useEffect(() => {
    if (!collapsible) {
      setNeedsToggle(false);
      return;
    }

    const node = contentRef.current;
    if (!node) return;

    function measure() {
      if (!node) return;
      // Compare full scroll height against clamped client height.
      const wasCollapsed = node.classList.contains("rich-text-html--clamped");
      if (!wasCollapsed) node.classList.add("rich-text-html--clamped");
      const overflows = node.scrollHeight > node.clientHeight + 2;
      if (!wasCollapsed) node.classList.remove("rich-text-html--clamped");
      setNeedsToggle(overflows);
    }

    measure();
    const frame = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [collapsible, content, maxLines]);

  if (!textOnly) {
    return emptyFallback ? <p className={className}>{emptyFallback}</p> : null;
  }

  if (!collapsible) {
    return (
      <div
        className={`rich-text-html ${className}`.trim()}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  const clamped = needsToggle && !expanded;

  return (
    <div className={`rich-text-html-wrap ${className}`.trim()}>
      <div
        id={contentId}
        ref={contentRef}
        className={`rich-text-html${clamped ? " rich-text-html--clamped" : ""}`}
        style={clamped ? ({ "--rich-text-lines": maxLines } as CSSProperties) : undefined}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {needsToggle ? (
        <button
          type="button"
          className="rich-text-html__toggle"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}
