"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type CopyValueProps = {
  /** Text written to the clipboard. */
  value: string;
  /** Visible label; defaults to `value`. */
  children?: ReactNode;
  /** Optional accessible name override. */
  ariaLabel?: string;
  className?: string;
};

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 15.5V5.5A1.5 1.5 0 0 1 7 4h10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5 10 17.5 19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Copies `value` to the clipboard and briefly shows a check icon.
 */
export function CopyValue({
  value,
  children,
  ariaLabel,
  className = "",
}: CopyValueProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    const text = value.trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className={["copy-value", className].filter(Boolean).join(" ")}
      onClick={() => void handleCopy()}
      aria-label={ariaLabel ?? `Copy ${value}`}
      data-copied={copied ? "true" : undefined}
    >
      <span className="copy-value__text">{children ?? value}</span>
      <span className="copy-value__icon" aria-live="polite">
        {copied ? <CheckIcon /> : <CopyIcon />}
      </span>
    </button>
  );
}
