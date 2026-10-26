"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { SelectField } from "@/components/ui/SelectField";

type RichTextEditorProps = {
  id: string;
  label: string;
  valueHtml: string;
  placeholder?: string;
  onChangeHtml: (html: string) => void;
  minHeightClassName?: string;
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

export default function RichTextEditor({
  id,
  label,
  valueHtml,
  placeholder = "Write content…",
  onChangeHtml,
  minHeightClassName = "min-h-[160px]",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || seededRef.current) return;
    editor.innerHTML = valueHtml || "";
    seededRef.current = true;
  }, [valueHtml]);

  function emitChange() {
    const editor = editorRef.current;
    if (!editor) return;
    onChangeHtml(editor.innerHTML);
  }

  function runCommand(command: string, value?: string) {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false, value);
    emitChange();
  }

  function addLink() {
    const enteredUrl = window.prompt("Enter link URL");
    if (!enteredUrl) return;
    try {
      const parsed = new URL(enteredUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) return;
    } catch {
      return;
    }
    runCommand("createLink", enteredUrl);
  }

  return (
    <div>
      <label className="mb-1 block text-[14px] font-bold uppercase" htmlFor={id}>
        {label}
      </label>
      <div className="overflow-hidden rounded-[3px] border border-black/65">
        <div className="flex min-h-10 flex-wrap items-center border-b border-black/20 px-2">
          <SelectField
            aria-label={`${label} text style`}
            defaultValue="paragraph"
            onChange={(event) => {
              runCommand("formatBlock", event.target.value === "heading" ? "h2" : "p");
            }}
            options={[
              { value: "paragraph", label: "Paragraph" },
              { value: "heading", label: "Heading" },
            ]}
            density="compact"
            containerClassName="!h-8 !w-[112px]"
            className="!rounded-none !border-0 !px-2 !pr-7 !text-[10px]"
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
          <EditorButton label="Bulleted list" onClick={() => runCommand("insertUnorderedList")}>
            •
          </EditorButton>
          <EditorButton label="Numbered list" onClick={() => runCommand("insertOrderedList")}>
            1.
          </EditorButton>
          <EditorButton label="Add link" onClick={addLink}>
            ↗
          </EditorButton>
          <EditorButton label="Block quote" onClick={() => runCommand("formatBlock", "blockquote")}>
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
          data-placeholder={placeholder}
          className={`${minHeightClassName} max-h-[360px] overflow-y-auto px-3 py-3 text-[14px] outline-none empty:before:text-[#999] empty:before:content-[attr(data-placeholder)]`}
        />
      </div>
    </div>
  );
}
