"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { InputField } from "@/components/ui/InputField";

type HeroMediaKind = "image" | "video";

type HeroAsset = {
  id: string;
  name: string;
  url: string;
  file: File;
  kind: HeroMediaKind;
};

type HeroDraft = {
  media: HeroAsset[];
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonUrl: string;
  button2Label: string;
  button2Url: string;
};

const MAX_HERO_MEDIA = 3;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const IMAGE_EXTENSIONS = ["jpeg", "jpg", "png", "webp", "gif", "jfif", "avif", "heic", "heif"] as const;
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov"] as const;

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
const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const HERO_ACCEPT = [
  ...IMAGE_EXTENSIONS.map((ext) => `.${ext}`),
  ...VIDEO_EXTENSIONS.map((ext) => `.${ext}`),
  ...IMAGE_MIME_TYPES,
  ...VIDEO_MIME_TYPES,
].join(",");

function fileExtension(file: File) {
  const match = /\.([^.]+)$/.exec(file.name.trim());
  return match?.[1]?.toLowerCase() ?? "";
}

function getMediaKind(file: File): HeroMediaKind | null {
  const ext = fileExtension(file);
  if ((IMAGE_EXTENSIONS as readonly string[]).includes(ext)) return "image";
  if ((VIDEO_EXTENSIONS as readonly string[]).includes(ext)) return "video";

  const mime = file.type.toLowerCase();
  if (IMAGE_MIME_TYPES.has(mime)) return "image";
  if (VIDEO_MIME_TYPES.has(mime)) return "video";
  return null;
}

function isValidCtaUrl(value: string) {
  const destination = value.trim();
  if (!destination) return false;
  if (destination.startsWith("/")) return !destination.startsWith("//");
  try {
    const parsed = new URL(destination);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function usePreviewList(assets: HeroAsset[]) {
  const assetsRef = useRef(assets);
  assetsRef.current = assets;
  useEffect(() => {
    return () => {
      for (const asset of assetsRef.current) URL.revokeObjectURL(asset.url);
    };
  }, []);
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

function ChevronLeft() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
      <path
        d="M8.5 1.25 1.75 8l6.75 6.75"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
      <path
        d="M1.5 1.25 8.25 8 1.5 14.75"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function cloneAsset(asset: HeroAsset): HeroAsset {
  return {
    id: crypto.randomUUID(),
    name: asset.name,
    file: asset.file,
    kind: asset.kind,
    url: URL.createObjectURL(asset.file),
  };
}

function MediaPreview({ asset, className }: { asset: HeroAsset; className?: string }) {
  if (asset.kind === "video") {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        key={asset.id}
        src={asset.url}
        className={className}
        controls
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img key={asset.id} src={asset.url} alt={asset.name || "Hero banner preview"} className={className} />
  );
}

function MediaThumb({ asset }: { asset: HeroAsset }) {
  if (asset.kind === "video") {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video src={asset.url} muted playsInline preload="metadata" />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={asset.url} alt="" />;
}

export default function HeroSectionTab() {
  const [media, setMedia] = useState<HeroAsset[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [buttonLabel, setButtonLabel] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [button2Label, setButton2Label] = useState("");
  const [button2Url, setButton2Url] = useState("");
  const [saved, setSaved] = useState<HeroDraft>({
    media: [],
    title: "",
    subtitle: "",
    buttonLabel: "",
    buttonUrl: "",
    button2Label: "",
    button2Url: "",
  });
  const [errors, setErrors] = useState({ media: "", form: "" });
  const [notice, setNotice] = useState("");

  usePreviewList(media);

  const activeMedia = media[activeIndex] ?? null;
  const canAddMore = media.length < MAX_HERO_MEDIA;

  function revokeAsset(asset: HeroAsset | null | undefined) {
    if (asset?.url) URL.revokeObjectURL(asset.url);
  }

  async function validateAndBuildAsset(file: File): Promise<HeroAsset | null> {
    const kind = getMediaKind(file);

    if (!kind) {
      setErrors((current) => ({
        ...current,
        media:
          "Allowed images: JPEG, JPG, PNG, WEBP, GIF, JFIF, AVIF, HEIC, HEIF. Allowed videos: MP4, WEBM, MOV.",
      }));
      return null;
    }

    if (kind === "image" && file.size > MAX_IMAGE_BYTES) {
      setErrors((current) => ({
        ...current,
        media: "Each image must be 10 MB or smaller.",
      }));
      return null;
    }

    if (kind === "video" && file.size > MAX_VIDEO_BYTES) {
      setErrors((current) => ({
        ...current,
        media: "Each video must be 100 MB or smaller.",
      }));
      return null;
    }

    const url = URL.createObjectURL(file);

    if (kind === "video") {
      await new Promise<void>((resolve) => {
        const element = document.createElement("video");
        element.preload = "metadata";
        element.onloadedmetadata = () => resolve();
        element.onerror = () => resolve();
        element.src = url;
      });
      return { id: crypto.randomUUID(), name: file.name, url, file, kind };
    }

    const decoded = await new Promise<boolean>((resolve) => {
      const element = new Image();
      element.onload = () => resolve(true);
      element.onerror = () => resolve(false);
      element.src = url;
    });
    if (!decoded && !/\.(heic|heif)$/i.test(file.name) && !/image\/hei/i.test(file.type)) {
      URL.revokeObjectURL(url);
      setErrors((current) => ({
        ...current,
        media: "An image could not be read.",
      }));
      return null;
    }

    return { id: crypto.randomUUID(), name: file.name, url, file, kind };
  }

  function handleMediaUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    const remaining = MAX_HERO_MEDIA - media.length;
    if (remaining <= 0) {
      setErrors((current) => ({
        ...current,
        media: `You can upload up to ${MAX_HERO_MEDIA} banner files.`,
      }));
      return;
    }

    const selected = files.slice(0, remaining);
    if (files.length > remaining) {
      setErrors((current) => ({
        ...current,
        media: `Only ${MAX_HERO_MEDIA} files are allowed. Extra files were skipped.`,
      }));
    } else {
      setErrors((current) => ({ ...current, media: "" }));
    }

    void (async () => {
      const accepted: HeroAsset[] = [];
      for (const file of selected) {
        const asset = await validateAndBuildAsset(file);
        if (asset) accepted.push(asset);
      }

      if (!accepted.length) return;
      setMedia((current) => {
        const next = [...current, ...accepted].slice(0, MAX_HERO_MEDIA);
        setActiveIndex(Math.max(0, next.length - accepted.length));
        return next;
      });
      setNotice("");
    })();
  }

  function removeMedia(index: number) {
    setMedia((current) => {
      const target = current[index];
      revokeAsset(target);
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      setActiveIndex((active) => {
        if (!next.length) return 0;
        if (active > index) return active - 1;
        if (active >= next.length) return next.length - 1;
        return active;
      });
      return next;
    });
    setErrors((current) => ({ ...current, media: "" }));
  }

  function saveHero(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!media.length) {
      setErrors((current) => ({
        ...current,
        media: "Upload at least one banner image or video.",
      }));
      return;
    }

    const destination = buttonUrl.trim();
    if (!isValidCtaUrl(destination)) {
      setErrors((current) => ({
        ...current,
        form: "Enter a valid CTA button 1 URL, such as /events or https://example.com.",
      }));
      return;
    }

    const secondaryLabel = button2Label.trim();
    const secondaryUrl = button2Url.trim();
    if (secondaryLabel || secondaryUrl) {
      if (!secondaryLabel) {
        setErrors((current) => ({
          ...current,
          form: "Enter a CTA button 2 label, or clear the CTA button 2 URL.",
        }));
        return;
      }
      if (!isValidCtaUrl(secondaryUrl)) {
        setErrors((current) => ({
          ...current,
          form: "Enter a valid CTA button 2 URL, such as /events or https://example.com.",
        }));
        return;
      }
    }

    const next: HeroDraft = {
      media: media.map((asset) => ({ ...asset })),
      title: title.trim(),
      subtitle: subtitle.trim(),
      buttonLabel: buttonLabel.trim(),
      buttonUrl: destination,
      button2Label: secondaryLabel,
      button2Url: secondaryUrl,
    };
    setSaved(next);
    setTitle(next.title);
    setSubtitle(next.subtitle);
    setButtonLabel(next.buttonLabel);
    setButtonUrl(next.buttonUrl);
    setButton2Label(next.button2Label);
    setButton2Url(next.button2Url);
    setErrors({ media: "", form: "" });
    setNotice("Hero section saved.");
  }

  function cancelChanges() {
    media.forEach(revokeAsset);
    const restored = saved.media.map(cloneAsset);
    setMedia(restored);
    setActiveIndex(0);
    setTitle(saved.title);
    setSubtitle(saved.subtitle);
    setButtonLabel(saved.buttonLabel);
    setButtonUrl(saved.buttonUrl);
    setButton2Label(saved.button2Label);
    setButton2Url(saved.button2Url);
    setErrors({ media: "", form: "" });
    setNotice("");
  }

  return (
    <form onSubmit={saveHero} className="site-tab site-hero-tab">
      <header className="site-hero-header">
        <h3 className="site-tab-title">Hero</h3>
        <p className="site-tab-subtitle">
          Add banner media, headline, and up to two call-to-action buttons.
        </p>
      </header>

      <section className="site-hero-media" aria-label="Banner media">
        <div className="site-hero-media-heading">
          <h4 className="site-hero-section-label">Banner media</h4>
          <p className="site-hero-section-hint">
            Up to {MAX_HERO_MEDIA} files · images 10MB · videos 100MB · 1440 × 720 preferred
          </p>
        </div>

        {media.length > 0 ? (
          <div className="site-hero-image-slider" aria-label="Hero banner media">
            <div className="site-hero-video-stage">
              <button
                type="button"
                className="site-hero-video-arrow"
                aria-label="Previous media"
                disabled={media.length < 2}
                onClick={() =>
                  setActiveIndex((index) => (index - 1 + media.length) % media.length)
                }
              >
                <ChevronLeft />
              </button>

              <div className="site-hero-video-frame">
                {activeMedia ? (
                  <MediaPreview
                    asset={activeMedia}
                    className={
                      activeMedia.kind === "video"
                        ? "site-hero-video-preview"
                        : "site-hero-image-preview"
                    }
                  />
                ) : null}
                <p className="site-hero-video-caption">
                  {activeIndex + 1} / {media.length}
                  {activeMedia ? ` · ${activeMedia.name}` : ""}
                </p>
              </div>

              <button
                type="button"
                className="site-hero-video-arrow"
                aria-label="Next media"
                disabled={media.length < 2}
                onClick={() => setActiveIndex((index) => (index + 1) % media.length)}
              >
                <ChevronRight />
              </button>
            </div>

            <div className="site-hero-media-toolbar">
              <div className="site-hero-video-thumbs" role="list">
                {media.map((item, index) => (
                  <div key={item.id} className="site-hero-video-thumb" role="listitem">
                    <button
                      type="button"
                      className={[
                        "site-hero-video-thumb-btn",
                        index === activeIndex ? "is-active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Show media ${index + 1}`}
                      aria-current={index === activeIndex ? "true" : undefined}
                    >
                      <MediaThumb asset={item} />
                      <span>{index + 1}</span>
                    </button>
                    <button
                      type="button"
                      className="site-hero-video-remove"
                      aria-label={`Remove media ${index + 1}`}
                      onClick={() => removeMedia(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {canAddMore ? (
                <label htmlFor="hero-media-upload" className="site-hero-add-more">
                  <span>+ Add media</span>
                  <span className="site-hero-add-more-meta">
                    {media.length}/{MAX_HERO_MEDIA}
                  </span>
                  <input
                    id="hero-media-upload"
                    type="file"
                    accept={HERO_ACCEPT}
                    className="sr-only"
                    multiple
                    onChange={handleMediaUpload}
                  />
                </label>
              ) : (
                <p className="site-hero-media-limit">{MAX_HERO_MEDIA}/{MAX_HERO_MEDIA} files</p>
              )}
            </div>
          </div>
        ) : (
          <label htmlFor="hero-media-upload" className="site-upload-box site-hero-upload-empty">
            <ImagePlaceholder />
            <span className="site-upload-title">Add banner images or videos</span>
            <span className="site-upload-hint form-upload-hint">
              Images: JPEG, JPG, PNG, WEBP, GIF, JFIF, AVIF, HEIC, HEIF
              <br />
              Videos: MP4, WEBM, MOV
            </span>
            <input
              id="hero-media-upload"
              type="file"
              accept={HERO_ACCEPT}
              className="sr-only"
              multiple
              onChange={handleMediaUpload}
            />
          </label>
        )}

        {errors.media ? (
          <p role="alert" className="site-error">
            {errors.media}
          </p>
        ) : null}
      </section>

      <section className="site-hero-fields" aria-label="Hero content">
        <div className="site-form-grid-2">
          <InputField
            label="Hero title *"
            labelClassName="input-heading"
            id="hero-title"
            required
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setNotice("");
            }}
            placeholder="Enter headline"
          />
          <InputField
            label="Hero subtitle *"
            labelClassName="input-heading"
            id="hero-subtitle"
            required
            value={subtitle}
            onChange={(event) => {
              setSubtitle(event.target.value);
              setNotice("");
            }}
            placeholder="Supporting text..."
          />
        </div>

        <div className="site-hero-cta-block">
          <h4 className="site-hero-section-label">Call to action</h4>
          <div className="site-form-grid-2">
            <InputField
              label="CTA button 1 label *"
              labelClassName="input-heading"
              id="hero-cta-label"
              required
              value={buttonLabel}
              onChange={(event) => {
                setButtonLabel(event.target.value);
                setNotice("");
              }}
              placeholder="Primary button label"
            />
            <InputField
              label="CTA button 1 URL *"
              labelClassName="input-heading"
              id="hero-cta-url"
              required
              value={buttonUrl}
              onChange={(event) => {
                setButtonUrl(event.target.value);
                setErrors((current) => ({ ...current, form: "" }));
                setNotice("");
              }}
              placeholder="/events or https://example.com"
            />
            <InputField
              label="CTA button 2 label"
              labelClassName="input-heading"
              id="hero-cta-2-label"
              value={button2Label}
              onChange={(event) => {
                setButton2Label(event.target.value);
                setErrors((current) => ({ ...current, form: "" }));
                setNotice("");
              }}
              placeholder="Secondary button label"
            />
            <InputField
              label="CTA button 2 URL"
              labelClassName="input-heading"
              id="hero-cta-2-url"
              value={button2Url}
              onChange={(event) => {
                setButton2Url(event.target.value);
                setErrors((current) => ({ ...current, form: "" }));
                setNotice("");
              }}
              placeholder="/about or https://example.com"
            />
          </div>
        </div>

        {errors.form ? (
          <p role="alert" className="site-error">
            {errors.form}
          </p>
        ) : null}
      </section>

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
