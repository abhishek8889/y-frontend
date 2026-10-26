"use client";

import { useState, type FormEvent } from "react";
import { InputField } from "@/components/ui/InputField";

type AddNavigationModalProps = {
  defaultPriority: string;
  onClose: () => void;
  onSave: (item: { name: string; url: string; priority: string }) => void;
};

function isValidNavUrl(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export default function AddNavigationModal({
  defaultPriority,
  onClose,
  onSave,
}: AddNavigationModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [priority, setPriority] = useState(defaultPriority);
  const [error, setError] = useState("");

  function submitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedUrl = url.trim();
    if (!isValidNavUrl(normalizedUrl)) {
      setError("Enter a path like /about or a full URL starting with http:// or https://.");
      return;
    }
    if (!Number.isInteger(Number(priority)) || Number(priority) < 1) {
      setError("Priority must be a whole number greater than zero.");
      return;
    }
    onSave({ name: name.trim(), url: normalizedUrl, priority });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-navigation-title"
        className="flex h-full w-full max-w-[420px] flex-col border-l border-black/70 bg-white shadow-xl"
      >
        <header className="flex min-h-[86px] items-center gap-3 border-b border-black/70 px-[18px]">
          <span aria-hidden="true" className="h-[45px] w-[45px] shrink-0 rounded-[5px] bg-black" />
          <div className="min-w-0 flex-1">
            <h2 id="add-navigation-title" className="text-[17px] font-black uppercase leading-6">
              Add Navigation Menu
            </h2>
            <p className="text-[13px] leading-5 text-[#777]">Add item in navigation menu in header.</p>
          </div>
          <button
            type="button"
            aria-label="Close add navigation menu"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-[22px] leading-none hover:bg-black/5"
          >
            ×
          </button>
        </header>

        <form onSubmit={submitItem} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-[18px] py-5">
            <InputField
              id="navigation-label-name"
              required
              label="Label name *"
              labelClassName="!text-[14px] !mb-[6px] !leading-[18px]"
              autoFocus
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder="Enter name"
              density="compact"
            />

            <InputField
              id="navigation-url-link"
              required
              value={url}
              label="URL link *"
              labelClassName="!text-[14px] !mb-[6px] !leading-[18px]"
              onChange={(event) => {
                setUrl(event.target.value);
                setError("");
              }}
              placeholder="/about or https://example.com"
              density="compact"
            />

            <InputField
              id="navigation-priority"
              type="number"
              min="1"
              step="1"
              required
              label="Priority"
              labelClassName="!text-[14px] !mb-[6px] !leading-[18px]"
              value={priority}
              onChange={(event) => {
                setPriority(event.target.value);
                setError("");
              }}
              placeholder="6"
              density="compact"
            />

            {error ? (
              <p role="alert" className="text-[12px] text-red-600">
                {error}
              </p>
            ) : null}
          </div>

          <footer className="grid grid-cols-2 gap-3 border-t border-black/70 px-[18px] py-[24px]">
            <button
              type="button"
              onClick={onClose}
              className="h-[41px] cursor-pointer rounded-[4px] border border-black px-4 text-[14px] uppercase hover:bg-black hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-[41px] cursor-pointer rounded-[4px] border border-black bg-black px-4 text-[14px] uppercase text-white hover:bg-white hover:text-black"
            >
              Save
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
