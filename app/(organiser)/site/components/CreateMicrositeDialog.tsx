"use client";

import { useEffect, useState, type FormEvent } from "react";
import { OrganiserModal } from "@/components/organiser/OrganiserModal";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";

/** Matches backend StoreSiteRequest hostname regex. */
const HOSTNAME_PATTERN =
  /^(?=.{1,255}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

function normalizeHostname(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/[/?#].*$/, "")
    .replace(/\/+$/, "");
}

function validateHostname(value: string): string | null {
  if (!value) {
    return "Enter a domain name, e.g. club.example.com.";
  }
  if (/^https?:\/\//i.test(value.trim()) || /[/?#]/.test(value.trim())) {
    return "Use a domain name only (e.g. club.example.com), not a full URL.";
  }
  if (!HOSTNAME_PATTERN.test(value)) {
    return "Enter a valid domain name, e.g. club.example.com.";
  }
  return null;
}

type CreateMicrositeDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, domain: string) => void | Promise<void>;
  creating?: boolean;
};

export function CreateMicrositeDialog({
  open,
  onClose,
  onCreate,
  creating = false,
}: CreateMicrositeDialogProps) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setDomain("");
    setError("");
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (creating) return;

    const trimmedName = name.trim();
    const trimmedDomain = normalizeHostname(domain);

    if (!trimmedName) {
      setError("Enter a microsite name.");
      return;
    }

    if (trimmedName.length > 255) {
      setError("Microsite name must be 255 characters or fewer.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Enter a microsite name with at least 2 characters.");
      return;
    }

    const domainError = validateHostname(trimmedDomain);
    if (domainError) {
      setError(domainError);
      return;
    }

    await onCreate(trimmedName, trimmedDomain);
  }

  return (
    <OrganiserModal
      open={open}
      onClose={onClose}
      showClose
      titleId="create-microsite-title"
      panelClassName="max-w-[560px]"
    >
      <div className="site-create-modal">
        <header className="site-create-modal-header">
          <div>
            <p className="site-create-modal-eyebrow">Microsite</p>
            <h2 id="create-microsite-title" className="site-create-modal-title">
              Create microsite
            </h2>
            <p className="site-create-modal-subtitle">
              Name your microsite and domain. You can configure branding and content next.
            </p>
          </div>
        </header>

        <form onSubmit={submit} className="site-create-modal-body">
          <InputField
            id="microsite-name"
            label="Microsite name *"
            labelClassName="input-heading"
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            placeholder="e.g. Calm International"
            disabled={creating}
          />

          <InputField
            id="microsite-domain"
            label="Domain name *"
            labelClassName="input-heading"
            required
            value={domain}
            onChange={(event) => {
              setDomain(event.target.value);
              setError("");
            }}
            placeholder="e.g. club.example.com"
            disabled={creating}
          />

          {error ? (
            <p role="alert" className="site-error">
              {error}
            </p>
          ) : null}

          <div className="site-create-modal-footer">
            <Button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="form-footer-btn form-footer-btn-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating}
              className="form-footer-btn form-footer-btn-primary"
            >
              {creating ? "Creating…" : "Create microsite"}
            </Button>
          </div>
        </form>
      </div>
    </OrganiserModal>
  );
}
