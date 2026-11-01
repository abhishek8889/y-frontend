"use client";

import { useEffect, useState, type FormEvent } from "react";
import { OrganiserModal } from "@/components/organiser/OrganiserModal";
import { InputField } from "@/components/ui/InputField";

type AddNavigationModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (item: { name: string; url: string }) => void;
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
  open,
  onClose,
  onSave,
}: AddNavigationModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setUrl("");
    setError("");
  }, [open]);

  function submitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const normalizedUrl = url.trim();
    if (trimmedName.length < 1) {
      setError("Enter a label name.");
      return;
    }
    if (!isValidNavUrl(normalizedUrl)) {
      setError("Enter a path like /about or a full URL starting with http:// or https://.");
      return;
    }
    onSave({ name: trimmedName, url: normalizedUrl });
  }

  return (
    <OrganiserModal
      open={open}
      onClose={onClose}
      showClose
      titleId="add-navigation-title"
      panelClassName="max-w-[420px]"
    >
      <form onSubmit={submitItem} className="site-nav-modal">
        <header className="site-nav-modal-header">
          <span aria-hidden="true" className="site-nav-modal-icon" />
          <div>
            <h2 id="add-navigation-title" className="site-nav-modal-title">
              Add Navigation Menu
            </h2>
            <p className="site-nav-modal-subtitle">Add item in navigation menu in header.</p>
          </div>
        </header>

        <div className="site-nav-modal-body">
          <InputField
            id="navigation-label-name"
            required
            label="Label name *"
            labelClassName="input-heading"
            autoFocus
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            placeholder="Enter name"
          />

          <InputField
            id="navigation-url-link"
            required
            value={url}
            label="URL link *"
            labelClassName="input-heading"
            onChange={(event) => {
              setUrl(event.target.value);
              setError("");
            }}
            placeholder="/about or https://example.com"
          />

          {error ? (
            <p role="alert" className="site-error">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="site-nav-modal-footer">
          <button type="button" onClick={onClose} className="form-footer-btn form-footer-btn-secondary">
            Cancel
          </button>
          <button type="submit" className="form-footer-btn form-footer-btn-primary">
            Save
          </button>
        </footer>
      </form>
    </OrganiserModal>
  );
}
