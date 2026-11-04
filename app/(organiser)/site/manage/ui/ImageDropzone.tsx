"use client";

import { useState } from "react";
import { CloseIcon, UploadIcon } from "./icons";

type ImageDropzoneProps = {
  id: string;
  previewUrl?: string;
  emptyTitle: string;
  filledTitle: string;
  hint: string;
  previewAlt: string;
  onFiles: (files: FileList | null) => void;
  /** When set with a preview, show image only + clear control (no dropzone chrome). */
  onClear?: () => void;
  /** Filled preview shape — banner uses a fixed rectangle so large images don't break layout. */
  previewShape?: "square" | "banner";
};

export function ImageDropzone({
  id,
  previewUrl,
  emptyTitle,
  filledTitle,
  hint,
  previewAlt,
  onFiles,
  onClear,
  previewShape = "square",
}: ImageDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const showFilledPreview = Boolean(previewUrl && onClear);

  if (showFilledPreview && previewUrl) {
    return (
      <div
        className={[
          "csp-image-upload",
          "csp-image-upload--filled",
          previewShape === "banner" ? "csp-image-upload--banner" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="csp-image-upload-thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt={previewAlt} className="csp-image-upload-preview" />
          <button
            type="button"
            className="csp-image-upload-clear"
            aria-label="Remove image"
            onClick={onClear}
          >
            {CloseIcon}
          </button>
        </div>
      </div>
    );
  }

  return (
    <label
      className={["csp-image-upload", "csp-dropzone", dragging ? "is-dragging" : ""]
        .filter(Boolean)
        .join(" ")}
      htmlFor={id}
      onDragEnter={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragging(false);
        onFiles(event.dataTransfer.files);
      }}
    >
      {previewUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt={previewAlt} className="csp-image-upload-preview" />
          <span className="csp-image-upload-copy">
            <strong>{filledTitle}</strong>
            <span>{hint}</span>
          </span>
        </>
      ) : (
        <>
          <span className="csp-dropzone-icon" aria-hidden="true">
            {UploadIcon}
          </span>
          <span className="csp-image-upload-copy">
            <strong>{emptyTitle}</strong>
            <span>{hint}</span>
            <span className="csp-dropzone-hint">Drop an image here, or click to browse</span>
          </span>
        </>
      )}
      <input
        id={id}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="csp-image-upload-input"
        onChange={(event) => {
          onFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </label>
  );
}
