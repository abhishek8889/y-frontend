"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { SelectField } from "@/components/ui/SelectField";

export type RichTextEditorProps = {
  id: string;
  label: string;
  valueHtml: string;
  placeholder?: string;
  onChangeHtml: (html: string) => void;
  minHeightClassName?: string;
  labelClassName?: string;
  className?: string;
};

function EditorButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="flex h-8 min-w-8 items-center justify-center px-2 text-[12px] text-[#333] hover:bg-black/5"
    >
      {children}
    </button>
  );
}

function selectionInside(editor: HTMLElement) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  return editor.contains(selection.getRangeAt(0).commonAncestorContainer);
}

function placeCaretAtEnd(editor: HTMLElement) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function ensureEditableSelection(editor: HTMLElement) {
  editor.focus();

  if (!editor.innerHTML.trim()) {
    editor.innerHTML = "<p><br></p>";
  }

  if (!selectionInside(editor)) {
    placeCaretAtEnd(editor);
  }
}

function saveSelection(editor: HTMLElement): Range | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return null;
  return range.cloneRange();
}

function restoreSelection(range: Range | null) {
  if (!range) return;
  const selection = window.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
}

export function RichTextEditor({
  id,
  label,
  valueHtml,
  placeholder = "Write content…",
  onChangeHtml,
  minHeightClassName = "min-h-[160px]",
  labelClassName = "input-heading mb-1 block",
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    // Keep typing smooth: only sync from props when the editor is not focused.
    if (document.activeElement === editor) return;
    const next = valueHtml || "";
    if (editor.innerHTML === next) return;
    editor.innerHTML = next;
  }, [valueHtml]);

  function emitChange() {
    const editor = editorRef.current;
    if (!editor) return;
    onChangeHtml(editor.innerHTML);
  }

  function rememberSelection() {
    const editor = editorRef.current;
    if (!editor) return;
    savedSelectionRef.current = saveSelection(editor);
  }

  function runCommand(command: string, value?: string) {
    const editor = editorRef.current;
    if (!editor) return;

    ensureEditableSelection(editor);
    if (savedSelectionRef.current) {
      restoreSelection(savedSelectionRef.current);
      savedSelectionRef.current = null;
    }

    document.execCommand(command, false, value);
    emitChange();
  }

  function applyBlock(tag: "p" | "h2" | "blockquote") {
    runCommand("formatBlock", `<${tag}>`);
  }

  function toggleList(ordered: boolean) {
    runCommand(ordered ? "insertOrderedList" : "insertUnorderedList");
  }

  function addLink() {
    const editor = editorRef.current;
    if (!editor) return;

    rememberSelection();
    ensureEditableSelection(editor);

    const enteredUrl = window.prompt("Enter link URL");
    if (!enteredUrl) return;

    let href = enteredUrl.trim();
    if (!/^https?:\/\//i.test(href)) {
      href = `https://${href}`;
    }

    try {
      const parsed = new URL(href);
      if (!["http:", "https:"].includes(parsed.protocol)) return;
      href = parsed.toString();
    } catch {
      return;
    }

    ensureEditableSelection(editor);
    restoreSelection(savedSelectionRef.current);
    savedSelectionRef.current = null;

    const selection = window.getSelection();
    const collapsed = !selection || selection.isCollapsed;

    if (collapsed) {
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${href}" target="_blank" rel="noopener noreferrer">${href}</a>&nbsp;`,
      );
    } else {
      document.execCommand("createLink", false, href);
      editor.querySelectorAll("a[href]").forEach((anchor) => {
        if (anchor.getAttribute("href") === href) {
          anchor.setAttribute("target", "_blank");
          anchor.setAttribute("rel", "noopener noreferrer");
        }
      });
    }

    emitChange();
  }

  return (
    <div className={className}>
      <label className={labelClassName} htmlFor={id}>
        {label}
      </label>
      <div className="overflow-hidden rounded-[4px] border border-black">
        <div
          className="flex min-h-10 flex-wrap items-center border-b border-black/20 px-2"
          onMouseDown={() => rememberSelection()}
        >
          <SelectField
            aria-label={`${label} text style`}
            defaultValue="paragraph"
            onChange={(event) => {
              applyBlock(event.target.value === "heading" ? "h2" : "p");
            }}
            options={[
              { value: "paragraph", label: "Paragraph" },
              { value: "heading", label: "Heading" },
            ]}
            density="compact"
            containerClassName="!h-8 !w-[156px] shrink-0"
            className="!rounded-none !border-0 !text-[12px] [&>span:first-of-type]:!pr-1 [&>span:last-child]:!w-8"
          />
          <span className="mx-1 h-5 border-l border-black/15" />
          <EditorButton label="Bold" onClick={() => runCommand("bold")}>
            <strong>B</strong>
          </EditorButton>
          <EditorButton label="Italic" onClick={() => runCommand("italic")}>
            <em>I</em>
          </EditorButton>
          <EditorButton label="Underline" onClick={() => runCommand("underline")}>
            <span className="underline">U</span>
          </EditorButton>
          <span className="mx-1 h-5 border-l border-black/15" />
          <EditorButton label="Bulleted list" onClick={() => toggleList(false)}>
            •
          </EditorButton>
          <EditorButton label="Numbered list" onClick={() => toggleList(true)}>
            1.
          </EditorButton>
          <EditorButton label="Add link" onClick={addLink}>
            ↗
          </EditorButton>
          <EditorButton label="Block quote" onClick={() => applyBlock("blockquote")}>
            ❝
          </EditorButton>
        </div>
        <div
          id={id}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label={label}
          aria-multiline="true"
          onInput={emitChange}
          onBlur={rememberSelection}
          data-placeholder={placeholder}
          className={[
            minHeightClassName,
            "max-h-[360px] overflow-y-auto px-3 py-3 text-[14px] outline-none",
            "empty:before:text-[#999] empty:before:content-[attr(data-placeholder)]",
            "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
            "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
            "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-black/30 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-black/80",
            "[&_a]:underline [&_h2]:mb-2 [&_h2]:text-[18px] [&_h2]:font-bold",
          ].join(" ")}
        />
      </div>
    </div>
  );
}
