"use client";

import toast from "react-hot-toast";

export type AppToastVariant = "success" | "error" | "warning" | "info";

type AppToastProps = {
  id: string;
  message: string;
  variant: AppToastVariant;
  visible: boolean;
};

function ToastIcon({ variant }: { variant: AppToastVariant }) {
  if (variant === "success") {
    return (
      <svg className="app-toast-icon-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9" fill="currentColor" />
        <path
          d="M6 10.2 8.7 12.8 14 7.4"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === "error") {
    return (
      <svg className="app-toast-icon-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9" fill="currentColor" />
        <path
          d="M7 7 13 13M13 7 7 13"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === "warning") {
    return (
      <svg className="app-toast-icon-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M8.7 3.6 2.2 15.1A1.5 1.5 0 0 0 3.5 17.3h13a1.5 1.5 0 0 0 1.3-2.2L11.3 3.6a1.5 1.5 0 0 0-2.6 0Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M10 7.5v4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="10" cy="14.2" r="0.9" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg className="app-toast-icon-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function AppToast({ id, message, variant, visible }: AppToastProps) {
  return (
    <div
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
      data-variant={variant}
      className={["app-toast", `app-toast--${variant}`, visible ? "app-toast--visible" : "app-toast--hidden"]
        .join(" ")
        .trim()}
    >
      <span className="app-toast-icon">
        <ToastIcon variant={variant} />
      </span>
      <p className="app-toast-message">{message}</p>
      <button
        type="button"
        className="app-toast-close"
        aria-label="Dismiss notification"
        onClick={() => toast.dismiss(id)}
      >
        ×
      </button>
    </div>
  );
}
