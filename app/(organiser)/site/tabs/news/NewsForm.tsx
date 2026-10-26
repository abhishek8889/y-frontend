"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { InputField } from "@/components/ui/InputField";
import RichTextEditor from "../RichTextEditor";
import type { NewsRecord } from "./types";

type NewsFormProps = {
  initialNews: NewsRecord | null;
  onSave: (item: NewsRecord) => void;
  onCancel: () => void;
};

type NewsDraft = Omit<NewsRecord, "id">;

function toLocalDateTimeValue(isoOrLocal: string) {
  if (!isoOrLocal) {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60_000);
    return local.toISOString().slice(0, 16);
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(isoOrLocal)) {
    return isoOrLocal.slice(0, 16);
  }
  const date = new Date(isoOrLocal);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getInitialDraft(item: NewsRecord | null): NewsDraft {
  if (item) {
    return {
      title: item.title,
      excerptHtml: item.excerptHtml,
      contentHtml: item.contentHtml,
      imageDataUrl: item.imageDataUrl,
      publishAt: toLocalDateTimeValue(item.publishAt),
      author: item.author,
    };
  }

  return {
    title: "",
    excerptHtml: "",
    contentHtml: "",
    imageDataUrl: "",
    publishAt: toLocalDateTimeValue(""),
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

export default function NewsForm({ initialNews, onSave, onCancel }: NewsFormProps) {
  const [draft, setDraft] = useState<NewsDraft>(() => getInitialDraft(initialNews));
  const [imageError, setImageError] = useState("");
  const [formError, setFormError] = useState("");

  function updateDraft<K extends keyof NewsDraft>(field: K, value: NewsDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setFormError("");
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validFormat =
      ["image/jpeg", "image/png"].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name);
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

  function saveForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !draft.title.trim() ||
      !stripHtml(draft.excerptHtml) ||
      !stripHtml(draft.contentHtml) ||
      !draft.publishAt ||
      !draft.author.trim()
    ) {
      setFormError("Complete all required news fields before saving.");
      return;
    }

    onSave({
      id: initialNews?.id ?? crypto.randomUUID(),
      title: draft.title.trim(),
      excerptHtml: draft.excerptHtml,
      contentHtml: draft.contentHtml,
      imageDataUrl: draft.imageDataUrl,
      publishAt: draft.publishAt,
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
        <div className="space-y-4">
          <InputField
            id="news-title"
            label="News title *"
            labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
            required
            value={draft.title}
            onChange={(event) => updateDraft("title", event.target.value)}
            placeholder="Enter headline"
            density="compact"
            containerClassName="mt-1 !h-[40px] !rounded-[3px] !border-black/65 focus-within:!ring-0"
            className="!px-3 !text-[14px]"
          />
          <InputField
            id="news-publish-at"
            type="datetime-local"
            label="Publish date and time *"
            labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
            required
            value={draft.publishAt}
            onChange={(event) => updateDraft("publishAt", event.target.value)}
            density="compact"
            containerClassName="mt-1 !h-[40px] !rounded-[3px] !border-black/65 focus-within:!ring-0"
            className="!px-3 !text-[14px]"
          />
          <InputField
            id="news-author"
            label="Author *"
            labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
            required
            value={draft.author}
            onChange={(event) => updateDraft("author", event.target.value)}
            placeholder="Enter name"
            density="compact"
            containerClassName="mt-1 !h-[40px] !rounded-[3px] !border-black/65 focus-within:!ring-0"
            className="!px-3 !text-[14px]"
          />
        </div>

        <div>
          <label
            htmlFor="news-image"
            className="flex h-full min-h-[220px] cursor-pointer flex-col items-center justify-center border border-dashed border-black/65 px-5 py-6 text-center transition hover:bg-black/[0.025]"
          >
            {draft.imageDataUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={draft.imageDataUrl}
                  alt="News image preview"
                  className="mb-2 max-h-[112px] max-w-full object-contain"
                />
                <span className="text-[11px] font-bold">Change image</span>
              </>
            ) : (
              <>
                <ImagePlaceholder />
                <span className="mt-2 text-[16px] font-bold text-black">Add Image</span>
                <span className="mt-2 max-w-[280px] text-[14px] leading-[15px] text-[#999]">
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
          {imageError ? (
            <p role="alert" className="mt-1 text-[11px] text-red-600">
              {imageError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <RichTextEditor
          id="news-short-description"
          label="Short description *"
          valueHtml={draft.excerptHtml}
          placeholder="Write a short description…"
          onChangeHtml={(html) => updateDraft("excerptHtml", html)}
          minHeightClassName="min-h-[140px]"
        />
        <RichTextEditor
          id="news-detailed-description"
          label="Detailed description *"
          valueHtml={draft.contentHtml}
          placeholder="Write the full news article…"
          onChangeHtml={(html) => updateDraft("contentHtml", html)}
          minHeightClassName="min-h-[220px]"
        />
      </div>

      {formError ? (
        <p role="alert" className="mt-3 text-[11px] text-red-600">
          {formError}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-[40px] min-w-[90px] cursor-pointer rounded-[3px] border border-black/70 px-4 text-[12px] uppercase hover:bg-black hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-[40px] min-w-[78px] cursor-pointer rounded-[3px] border border-black bg-black px-4 text-[12px] uppercase text-white hover:bg-white hover:text-black"
        >
          Save
        </button>
      </div>
    </form>
  );
}
