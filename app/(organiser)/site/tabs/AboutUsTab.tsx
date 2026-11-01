"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { InputField } from "@/components/ui/InputField";
import RichTextEditor from "./RichTextEditor";

type AboutBanner = {
  name: string;
  url: string;
  file: File;
};

type AboutDraft = {
  title: string;
  descriptionHtml: string;
  banner: AboutBanner | null;
};

const IMAGE_EXTENSIONS = ["jpeg", "jpg", "png", "webp", "gif", "jfif", "avif", "heic", "heif"] as const;
const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/pjpeg",
  "image/avif",
  "image/heic",
  "image/heif",
]);
const BANNER_ACCEPT = [
  ...IMAGE_EXTENSIONS.map((ext) => `.${ext}`),
  ...IMAGE_MIME_TYPES,
].join(",");
const MAX_BANNER_BYTES = 10 * 1024 * 1024;

function fileExtension(file: File) {
  const match = /\.([^.]+)$/.exec(file.name.trim());
  return match?.[1]?.toLowerCase() ?? "";
}

function isAllowedBanner(file: File) {
  const ext = fileExtension(file);
  return (
    (IMAGE_EXTENSIONS as readonly string[]).includes(ext) ||
    IMAGE_MIME_TYPES.has(file.type.toLowerCase())
  );
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function useBannerPreview(banner: AboutBanner | null) {
  useEffect(() => {
    if (!banner) return;
    return () => URL.revokeObjectURL(banner.url);
  }, [banner]);
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
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [banner, setBanner] = useState<AboutBanner | null>(null);
  const [saved, setSaved] = useState<AboutDraft>({
    title: "",
    descriptionHtml: "",
    banner: null,
  });
  const [bannerError, setBannerError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  useBannerPreview(banner);

  function revokeBanner(asset: AboutBanner | null) {
    if (asset?.url) URL.revokeObjectURL(asset.url);
  }

  async function uploadBanner(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!isAllowedBanner(file)) {
      setBannerError(
        "Allowed banner images: JPEG, JPG, PNG, WEBP, GIF, JFIF, AVIF, HEIC, HEIF.",
      );
      return;
    }
    if (file.size > MAX_BANNER_BYTES) {
      setBannerError("Banner image must be 10 MB or smaller.");
      return;
    }

    const url = URL.createObjectURL(file);
    const decoded = await new Promise<boolean>((resolve) => {
      const element = new Image();
      element.onload = () => resolve(true);
      element.onerror = () => resolve(false);
      element.src = url;
    });

    if (!decoded && !/\.(heic|heif)$/i.test(file.name) && !/image\/hei/i.test(file.type)) {
      URL.revokeObjectURL(url);
      setBannerError("This banner image could not be read.");
      return;
    }

    setBanner((current) => {
      revokeBanner(current);
      return { name: file.name, url, file };
    });
    setBannerError("");
    setFormError("");
    setNotice("");
  }

  function removeBanner() {
    setBanner((current) => {
      revokeBanner(current);
      return null;
    });
    setBannerError("");
    setNotice("");
  }

  function saveAbout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextTitle = title.trim();
    if (!nextTitle) {
      setFormError("Enter an About title.");
      return;
    }
    if (!banner) {
      setBannerError("Upload a banner image.");
      return;
    }
    if (!stripHtml(descriptionHtml)) {
      setFormError("Enter an About description.");
      return;
    }

    setSaved({
      title: nextTitle,
      descriptionHtml,
      banner,
    });
    setTitle(nextTitle);
    setFormError("");
    setBannerError("");
    setNotice("About page saved.");
  }

  function cancelChanges() {
    setBanner((current) => {
      if (!saved.banner) {
        if (current) revokeBanner(current);
        return null;
      }
      if (current?.file === saved.banner.file) return current;
      if (current) revokeBanner(current);
      return {
        name: saved.banner.name,
        file: saved.banner.file,
        url: URL.createObjectURL(saved.banner.file),
      };
    });
    setTitle(saved.title);
    setDescriptionHtml(saved.descriptionHtml);
    setBannerError("");
    setFormError("");
    setNotice("");
  }

  return (
    <form onSubmit={saveAbout} className="site-tab site-about-tab">
      <header className="site-about-header">
        <h3 className="site-tab-title">About Us</h3>
        <p className="site-tab-subtitle">
          Set the page title, banner, and rich-text description.
        </p>
      </header>

      <div className="site-about-stack">
        <InputField
          id="about-title"
          label="Title *"
          labelClassName="input-heading"
          required
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setFormError("");
            setNotice("");
          }}
          placeholder="Enter headline"
        />

        <div className="site-about-banner">
          <div className="site-about-banner-heading">
            <label htmlFor="about-banner" className="input-heading">
              Banner *
            </label>
            <p className="site-about-banner-hint">
              JPEG, JPG, PNG, WEBP, GIF, JFIF, AVIF, HEIC, HEIF · up to 10MB · 1440 × 720 preferred
            </p>
          </div>

          {banner ? (
            <div className="site-about-banner-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner.url} alt={banner.name || "About banner preview"} />
              <div className="site-about-banner-actions">
                <p className="site-about-banner-filename">{banner.name}</p>
                <div className="site-about-banner-buttons">
                  <label htmlFor="about-banner" className="site-about-banner-replace">
                    Replace
                    <input
                      id="about-banner"
                      type="file"
                      accept={BANNER_ACCEPT}
                      className="sr-only"
                      onChange={uploadBanner}
                    />
                  </label>
                  <button type="button" className="site-about-banner-remove" onClick={removeBanner}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <label htmlFor="about-banner" className="site-upload-box site-about-banner-empty">
              <ImagePlaceholder />
              <span className="site-upload-title">Add banner image</span>
              <span className="site-upload-hint form-upload-hint">
                Upload a wide banner that represents your club.
              </span>
              <input
                id="about-banner"
                type="file"
                accept={BANNER_ACCEPT}
                className="sr-only"
                onChange={uploadBanner}
              />
            </label>
          )}

          {bannerError ? (
            <p role="alert" className="site-error">
              {bannerError}
            </p>
          ) : null}
        </div>

        <RichTextEditor
          id="about-description"
          label="Description *"
          labelClassName="input-heading"
          valueHtml={descriptionHtml}
          placeholder="Write your About Us story…"
          onChangeHtml={(html) => {
            setDescriptionHtml(html);
            setFormError("");
            setNotice("");
          }}
          minHeightClassName="min-h-[220px]"
        />
      </div>

      {formError ? (
        <p role="alert" className="site-error">
          {formError}
        </p>
      ) : null}

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
