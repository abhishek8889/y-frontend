"use client";

import { useEffect, useState, type FormEvent } from "react";
import { OrganiserModal } from "@/components/organiser/OrganiserModal";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import type { SiteKind } from "../siteTypes";

const DOMAIN_PATTERN =
  /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

function normalizeDomain(value: string) {
  return value.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

type CreateMicrositeDialogProps = {
  open: boolean;
  kind: SiteKind;
  onClose: () => void;
  onCreate: (name: string, domain: string) => void | Promise<void>;
  creating?: boolean;
};

export function CreateMicrositeDialog({
  open,
  kind,
  onClose,
  onCreate,
  creating = false,
}: CreateMicrositeDialogProps) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const isMain = kind === "main";

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
    const trimmedDomain = normalizeDomain(domain);

    if (trimmedName.length < 2) {
      setError(
        isMain
          ? "Enter a clubsite name with at least 2 characters."
          : "Enter a microsite name with at least 2 characters.",
      );
      return;
    }

    if (!trimmedDomain || !DOMAIN_PATTERN.test(trimmedDomain)) {
      setError("Enter a valid domain name, such as www.yourclub.com.");
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
            <p className="site-create-modal-eyebrow">
              {isMain ? "Clubsite" : "White label microsite"}
            </p>
            <h2 id="create-microsite-title" className="site-create-modal-title">
              {isMain ? "Setup your clubsite" : "Add white label site"}
            </h2>
            <p className="site-create-modal-subtitle">
              {isMain
                ? "Name your clubsite and domain. You can configure branding and content next."
                : "Name your microsite and domain — then branding, hero, and pages."}
            </p>
          </div>
        </header>

        <form onSubmit={submit} className="site-create-modal-body">
          <InputField
            id="microsite-name"
            label={isMain ? "Clubsite name *" : "Microsite name *"}
            labelClassName="input-heading"
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            placeholder="e.g. Hednesford Town"
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
            placeholder="e.g. www.yourclub.com"
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
              {creating
                ? "Creating…"
                : isMain
                  ? "Create clubsite"
                  : "Create white label"}
            </Button>
          </div>
        </form>
      </div>
    </OrganiserModal>
  );
}
