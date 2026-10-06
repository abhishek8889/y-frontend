"use client";

import { useState, type FormEvent } from "react";
import { InputField } from "@/components/ui/InputField";

type AddNavigationModalProps = {
  defaultPriority: string;
  onClose: () => void;
  onSave: (item: { name: string; url: string; priority: string }) => void;
};

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
    try {
      const parsedUrl = new URL(normalizedUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        setError("Enter a URL that starts with http:// or https://.");
        return;
      }
    } catch {
      setError("Enter a valid URL.");
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 sm:p-5"
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
        className="flex h-full max-h-[780px] w-full max-w-[643px] flex-col bg-white shadow-xl sm:h-[min(780px,calc(100vh-40px))]"
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
            className="flex h-8 w-8 shrink-0 items-center justify-center text-[22px] leading-none hover:bg-black/5"
          >
            ×
          </button>
        </header>

        <form onSubmit={submitItem} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-[18px] py-5">
            <div>
              <label htmlFor="navigation-label-name" className="block text-[12px] font-bold uppercase">Label name *</label>
              <InputField
                id="navigation-label-name"
                required
                autoFocus
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                placeholder="Enter name"
                density="compact"
                containerClassName="mt-1.5 !h-[34px] !rounded-[4px] !border-black/80 focus-within:!ring-0"
                className="!px-2.5 !text-[13px] normal-case placeholder:!text-[#777]"
              />
            </div>

            <div>
              <label htmlFor="navigation-url-link" className="block text-[12px] font-bold uppercase">URL link *</label>
              <InputField
                id="navigation-url-link"
                type="url"
                required
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setError("");
                }}
                placeholder="https://yourlist.com"
                density="compact"
                containerClassName="mt-1.5 !h-[34px] !rounded-[4px] !border-black/80 focus-within:!ring-0"
                className="!px-2.5 !text-[13px] normal-case placeholder:!text-[#777]"
              />
            </div>

            <div>
              <label htmlFor="navigation-priority" className="block text-[12px] font-bold uppercase">Set priority *</label>
              <InputField
                id="navigation-priority"
                type="number"
                min="1"
                step="1"
                required
                value={priority}
                onChange={(event) => {
                  setPriority(event.target.value);
                  setError("");
                }}
                placeholder="6"
                density="compact"
                containerClassName="mt-1.5 !h-[34px] !rounded-[4px] !border-black/80 focus-within:!ring-0"
                className="!px-2.5 !text-[13px]"
              />
            </div>

            {error ? <p role="alert" className="text-[12px] text-red-600">{error}</p> : null}
          </div>

          <footer className="grid grid-cols-[0.8fr_1fr] gap-3 border-t border-black/70 px-[18px] py-[34px]">
            <button
              type="button"
              onClick={onClose}
              className="h-[41px] rounded-[4px] border border-black px-4 text-[13px] uppercase hover:bg-black hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-[41px] rounded-[4px] border border-black bg-black px-4 text-[13px] uppercase text-white hover:bg-white hover:text-black"
            >
              Save
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
