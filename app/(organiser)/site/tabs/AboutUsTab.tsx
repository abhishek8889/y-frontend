"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { InputField } from "@/components/ui/InputField";

type AboutImage = {
  name: string;
  url: string;
};

function useAboutImagePreview(image: AboutImage | null) {
  useEffect(() => {
    if (!image) return;
    return () => URL.revokeObjectURL(image.url);
  }, [image]);
}

function ImagePlaceholder() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="site-upload-preview-icon">
      <rect x="3" y="3" width="42" height="42" rx="4" fill="currentColor" />
      <path d="m9 34 9-10 6 6 5-5 10 9H9Z" fill="white" />
      <circle cx="17" cy="16" r="3" fill="white" />
    </svg>
  );
}

export default function AboutUsTab() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<AboutImage | null>(null);
  const [saved, setSaved] = useState({ title: "", description: "" });
  const [imageError, setImageError] = useState("");
  const [notice, setNotice] = useState("");

  useAboutImagePreview(image);

  function uploadImage(event: ChangeEvent<HTMLInputElement>) {
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

    const url = URL.createObjectURL(file);
    const preview = new Image();
    preview.onload = () => {
      setImage({ name: file.name, url });
      setImageError("");
      setNotice("");
    };
    preview.onerror = () => {
      URL.revokeObjectURL(url);
      setImageError("This image could not be read. Choose a valid JPG or PNG.");
    };
    preview.src = url;
  }

  function saveAbout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved({ title: title.trim(), description: description.trim() });
    setTitle(title.trim());
    setDescription(description.trim());
    setNotice("About page saved.");
  }

  function cancelChanges() {
    setTitle(saved.title);
    setDescription(saved.description);
    setImage(null);
    setImageError("");
    setNotice("");
  }

  return (
    <form onSubmit={saveAbout} className="site-tab">
      <div className="site-about-grid">
        <div className="site-about-fields">
          <InputField
            id="about-title"
            label="Title"
            labelClassName="input-heading"
            required
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setNotice("");
            }}
            placeholder="Enter headline"
          />
          <InputField
            as="textarea"
            label="Description"
            labelClassName="input-heading"
            id="about-description"
            required
            rows={6}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setNotice("");
            }}
            placeholder="Supporting text..."
          />
        </div>

        <div>
          <label htmlFor="about-image" className="site-upload-box site-upload-box-sm">
            {image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt="About page preview"
                  className="site-upload-thumb site-upload-thumb-lg"
                />
                <span className="site-upload-filename">{image.name}</span>
                <span className="site-upload-replace">Click to replace image</span>
              </>
            ) : (
              <>
                <ImagePlaceholder />
                <span className="site-upload-title">Add Image</span>
                <span className="site-upload-hint form-upload-hint">
                  Upload a nice image that represent your brand. JPG or
                  <br className="hidden sm:block" />
                  PNG, under 5MB.
                </span>
              </>
            )}
            <input
              id="about-image"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="sr-only"
              onChange={uploadImage}
            />
          </label>
          {imageError ? (
            <p role="alert" className="site-error">
              {imageError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="site-form-actions">
        {notice ? (
          <p role="status" className="site-notice">
            {notice}
          </p>
        ) : null}
        <button type="button" onClick={cancelChanges} className="form-footer-btn form-footer-btn-secondary">
          Cancel
        </button>
        <button type="submit" className="form-footer-btn form-footer-btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}
