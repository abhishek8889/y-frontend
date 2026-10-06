"use client";

import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import type { NewsRecord } from "./types";

type NewsFormProps = {
  initialNews: NewsRecord | null;
  onSave: (item: NewsRecord) => void;
  onCancel: () => void;
};

type NewsDraft = Omit<NewsRecord, "id">;

function getInitialDraft(item: NewsRecord | null): NewsDraft {
  if (item) {
    return {
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      imageDataUrl: item.imageDataUrl,
      publishDate: item.publishDate,
      publishTime: item.publishTime,
      author: item.author,
    };
  }

  const now = new Date();
  return {
    title: "",
    excerpt: "",
    content: "",
    imageDataUrl: "",
    publishDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
    publishTime: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    author: "",
  };
}

function ImagePlaceholder() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-8 w-8 text-[#d7d7d7]">
      <rect x="3" y="3" width="42" height="42" rx="4" fill="currentColor" />
      <path d="m9 34 9-10 6 6 5-5 10 9H9Z" fill="white" />
      <circle cx="17" cy="16" r="3" fill="white" />
    </svg>
  );
}

function EditorButton({
  label,
  command,
  children,
  onFormat,
}: {
  label: string;
  command: string;
  children: ReactNode;
  onFormat: (command: string) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onFormat(command)}
      className="flex h-8 min-w-8 items-center justify-center px-2 text-[12px] text-[#333] hover:bg-black/5"
    >
      {children}
    </button>
  );
}

export default function NewsForm({ initialNews, onSave, onCancel }: NewsFormProps) {
  const [draft, setDraft] = useState<NewsDraft>(() => getInitialDraft(initialNews));
  const [imageError, setImageError] = useState("");
  const [formError, setFormError] = useState("");
  const [blockStyle, setBlockStyle] = useState("paragraph");
  const editorRef = useRef<HTMLDivElement>(null);

  function updateDraft(field: keyof NewsDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setFormError("");
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validFormat = ["image/jpeg", "image/png"].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (!validFormat) {
      setImageError("Upload a JPG or PNG image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be 5 MB or smaller.");
      return;
    }

    try {
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result !== "string") {
            reject(new Error("The uploaded image could not be read."));
            return;
          }
          resolve(reader.result);
        };
        reader.onerror = () => reject(new Error("The uploaded image could not be read."));
        reader.readAsDataURL(file);
      });
      setDraft((current) => ({ ...current, imageDataUrl }));
      setImageError("");
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "The uploaded image could not be read.");
    }
  }

  function formatContent(command: string, value?: string) {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    let commandValue = value;
    if (command === "createLink") {
      const enteredUrl = window.prompt("Enter link URL");
      if (!enteredUrl) return;
      try {
        const parsedUrl = new URL(enteredUrl);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          setFormError("Links must use http:// or https://.");
          return;
        }
      } catch {
        setFormError("Enter a valid link URL.");
        return;
      }
      commandValue = enteredUrl;
    }
    document.execCommand(command, false, commandValue);
    updateDraft("content", editor.innerText);
  }

  function saveForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = editorRef.current?.innerText.trim() ?? draft.content.trim();
    if (!draft.title.trim() || !draft.excerpt.trim() || !draft.publishDate || !draft.publishTime || !draft.author.trim()) {
      setFormError("Complete all required news fields before saving.");
      return;
    }
    onSave({
      ...draft,
      id: initialNews?.id ?? crypto.randomUUID(),
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim(),
      content,
      author: draft.author.trim(),
    });
  }

  return (
    <form onSubmit={saveForm} className="mt-4">
      <div className="mb-4">
        <h3 className="text-[18px] font-black uppercase leading-6">News</h3>
        <p className="mt-1 text-[12px] text-[#777]">
          Create and manage news, announcements and updates for your website.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.96fr)]">
        <div className="space-y-3">
          <div>
            <label htmlFor="news-title" className="block text-[10px] font-bold uppercase">News title *</label>
            <InputField
              id="news-title"
              required
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
              placeholder="Enter headline"
              density="compact"
              containerClassName="mt-1 !h-[34px] !rounded-[3px] !border-black/65 focus-within:!ring-0"
              className="!px-3 !text-[11px] normal-case placeholder:!text-[#777]"
            />
          </div>

          <div>
            <label htmlFor="news-excerpt" className="block text-[10px] font-bold uppercase">Short description / excerpt *</label>
            <InputField
              as="textarea"
              id="news-excerpt"
              required
              rows={4}
              value={draft.excerpt}
              onChange={(event) => updateDraft("excerpt", event.target.value)}
              placeholder="Supporting text..."
              containerClassName="mt-1 !min-h-[102px] !rounded-[3px] !border-black/65 focus-within:!ring-0"
              className="!min-h-[100px] !resize-y !px-3 !py-2 !text-[11px] normal-case placeholder:!text-[#777]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="news-publish-date" className="block text-[10px] font-bold uppercase">Publish date *</label>
              <InputField
                id="news-publish-date"
                type="date"
                required
                value={draft.publishDate}
                onChange={(event) => updateDraft("publishDate", event.target.value)}
                density="compact"
                containerClassName="mt-1 !h-[34px] !rounded-[3px] !border-black/65 focus-within:!ring-0"
                className="!px-3 !text-[11px]"
              />
            </div>
            <div>
              <label htmlFor="news-publish-time" className="block text-[10px] font-bold uppercase">Publish time *</label>
              <InputField
                id="news-publish-time"
                type="time"
                required
                value={draft.publishTime}
                onChange={(event) => updateDraft("publishTime", event.target.value)}
                density="compact"
                containerClassName="mt-1 !h-[34px] !rounded-[3px] !border-black/65 focus-within:!ring-0"
                className="!px-3 !text-[11px]"
              />
            </div>
          </div>

          <div className="sm:w-1/2 sm:pr-1.5">
            <label htmlFor="news-author" className="block text-[10px] font-bold uppercase">Author *</label>
            <InputField
              id="news-author"
              required
              value={draft.author}
              onChange={(event) => updateDraft("author", event.target.value)}
              placeholder="Enter name"
              density="compact"
              containerClassName="mt-1 !h-[34px] !rounded-[3px] !border-black/65 focus-within:!ring-0"
              className="!px-3 !text-[11px] normal-case placeholder:!text-[#777]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="news-image"
            className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center border border-dashed border-black/65 px-5 py-6 text-center transition hover:bg-black/[0.025]"
          >
            {draft.imageDataUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.imageDataUrl} alt="News image preview" className="mb-2 max-h-[112px] max-w-full object-contain" />
                <span className="text-[11px] font-bold">Change image</span>
              </>
            ) : (
              <>
                <ImagePlaceholder />
                <span className="mt-2 text-[12px] font-bold text-black">Add Image</span>
                <span className="mt-2 max-w-[280px] text-[10px] leading-[15px] text-[#999]">
                  Upload a nice image that represents your brand. JPG or PNG, under 5MB.
                </span>
              </>
            )}
            <input
              id="news-image"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="sr-only"
              onChange={uploadImage}
            />
          </label>
          {imageError ? <p role="alert" className="mt-1 text-[11px] text-red-600">{imageError}</p> : null}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-[10px] font-bold uppercase" htmlFor="news-content-editor">News content</label>
        <div className="overflow-hidden rounded-[3px] border border-black/65">
          <div className="flex min-h-10 flex-wrap items-center border-b border-black/20 px-2">
            <SelectField
              aria-label="Text style"
              value={blockStyle}
              onChange={(event) => {
                const nextStyle = event.target.value;
                setBlockStyle(nextStyle);
                formatContent("formatBlock", nextStyle === "heading" ? "h2" : "p");
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
            <EditorButton label="Bold" command="bold" onFormat={formatContent}><strong>B</strong></EditorButton>
            <EditorButton label="Italic" command="italic" onFormat={formatContent}><em>I</em></EditorButton>
            <EditorButton label="Underline" command="underline" onFormat={formatContent}><span className="underline">U</span></EditorButton>
            <span className="mx-1 h-5 border-l border-black/15" />
            <EditorButton label="Bulleted list" command="insertUnorderedList" onFormat={formatContent}>☷</EditorButton>
            <EditorButton label="Numbered list" command="insertOrderedList" onFormat={formatContent}>☷</EditorButton>
            <EditorButton label="Add link" command="createLink" onFormat={formatContent}>↗</EditorButton>
            <EditorButton label="Block quote" command="formatBlock" onFormat={(command) => formatContent(command, "blockquote")}>❝</EditorButton>
            <span className="ml-auto text-[10px] text-[#888]">Formatting</span>
          </div>
          <div
            id="news-content-editor"
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-label="News content"
            aria-multiline="true"
            onInput={(event) => updateDraft("content", event.currentTarget.innerText)}
            className="min-h-[190px] max-h-[360px] overflow-y-auto px-3 py-3 text-[12px] outline-none empty:before:text-[#999] empty:before:content-['Write_your_news_content...']"
          >
            {initialNews?.content ?? ""}
          </div>
        </div>
      </div>

      {formError ? <p role="alert" className="mt-3 text-[11px] text-red-600">{formError}</p> : null}

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-[35px] min-w-[90px] rounded-[3px] border border-black/70 px-4 text-[10px] uppercase hover:bg-black hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-[35px] min-w-[78px] rounded-[3px] border border-black bg-black px-4 text-[10px] uppercase text-white hover:bg-white hover:text-black"
        >
          Save
        </button>
      </div>
    </form>
  );
}
