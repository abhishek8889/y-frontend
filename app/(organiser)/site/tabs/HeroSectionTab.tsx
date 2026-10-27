"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";

type HeroAsset = {
  name: string;
  url: string;
  file: File;
};

type BannerType = "image" | "video";

function usePreview(asset: HeroAsset | null) {
  useEffect(() => {
    if (!asset) return;
    return () => URL.revokeObjectURL(asset.url);
  }, [asset]);
}

function PlayIcon() {
  return (
    <span className="site-play-icon">
      <svg viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M7 4.8a1 1 0 0 1 1.5-.86l11.2 6.2a2.1 2.1 0 0 1 0 3.72L8.5 20.06A1 1 0 0 1 7 19.2V4.8Z" />
      </svg>
    </span>
  );
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

export default function HeroSectionTab() {
  const [bannerType, setBannerType] = useState<BannerType>("image");
  const [video, setVideo] = useState<HeroAsset | null>(null);
  const [image, setImage] = useState<HeroAsset | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [buttonLabel, setButtonLabel] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [saved, setSaved] = useState({
    bannerType: "image" as BannerType,
    video: null as HeroAsset | null,
    image: null as HeroAsset | null,
    title: "",
    subtitle: "",
    buttonLabel: "",
    buttonUrl: "",
  });
  const [errors, setErrors] = useState({ media: "", form: "" });
  const [notice, setNotice] = useState("");

  usePreview(video);
  usePreview(image);

  function handleUpload(event: ChangeEvent<HTMLInputElement>, type: BannerType) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const isVideo = type === "video";
    const validFormat = isVideo
      ? ["video/mp4", "video/quicktime"].includes(file.type) || /\.(mp4|mov)$/i.test(file.name)
      : ["image/jpeg", "image/png"].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (!validFormat) {
      setErrors((current) => ({
        ...current,
        media: isVideo ? "Upload an MP4 or MOV video." : "Upload a JPG or PNG image.",
      }));
      return;
    }
    const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors((current) => ({
        ...current,
        media: `File must be ${isVideo ? "100" : "5"} MB or smaller.`,
      }));
      return;
    }

    const url = URL.createObjectURL(file);
    if (isVideo) {
      const element = document.createElement("video");
      element.preload = "metadata";
      element.onloadedmetadata = () => {
        if (!Number.isFinite(element.duration) || element.duration >= 60) {
          URL.revokeObjectURL(url);
          setErrors((current) => ({ ...current, media: "Video must be shorter than 60 seconds." }));
          return;
        }
        setVideo({ name: file.name, url, file });
        setErrors((current) => ({ ...current, media: "" }));
      };
      element.onerror = () => {
        URL.revokeObjectURL(url);
        setErrors((current) => ({ ...current, media: "This video could not be read." }));
      };
      element.src = url;
      return;
    }

    const element = new Image();
    element.onload = () => {
      setImage({ name: file.name, url, file });
      setErrors((current) => ({ ...current, media: "" }));
    };
    element.onerror = () => {
      URL.revokeObjectURL(url);
      setErrors((current) => ({ ...current, media: "This image could not be read." }));
    };
    element.src = url;
  }

  function saveHero(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const destination = buttonUrl.trim();
    const validDestination = destination.startsWith("/")
      ? !destination.startsWith("//")
      : (() => {
          try {
            const parsed = new URL(destination);
            return parsed.protocol === "https:" || parsed.protocol === "http:";
          } catch {
            return false;
          }
        })();
    if (!validDestination) {
      setErrors((current) => ({
        ...current,
        form: "Enter a valid CTA URL, such as /events or https://example.com.",
      }));
      return;
    }
    if (bannerType === "image" && !image) {
      setErrors((current) => ({ ...current, media: "Upload a banner image." }));
      return;
    }
    if (bannerType === "video" && !video) {
      setErrors((current) => ({ ...current, media: "Upload a banner video." }));
      return;
    }

    const next = {
      bannerType,
      video,
      image,
      title: title.trim(),
      subtitle: subtitle.trim(),
      buttonLabel: buttonLabel.trim(),
      buttonUrl: destination,
    };
    setSaved(next);
    setButtonUrl(destination);
    setErrors({ media: "", form: "" });
    setNotice("Hero section saved.");
  }

  function cancelChanges() {
    setBannerType(saved.bannerType);
    setVideo(saved.video ? { ...saved.video, url: URL.createObjectURL(saved.video.file) } : null);
    setImage(saved.image ? { ...saved.image, url: URL.createObjectURL(saved.image.file) } : null);
    setTitle(saved.title);
    setSubtitle(saved.subtitle);
    setButtonLabel(saved.buttonLabel);
    setButtonUrl(saved.buttonUrl);
    setErrors({ media: "", form: "" });
    setNotice("");
  }

  return (
    <form onSubmit={saveHero} className="site-tab">
      <div className="site-field-half">
        <SelectField
          id="hero-banner-type"
          label="Banner type *"
          labelClassName="input-heading"
          value={bannerType}
          onChange={(event) => {
            setBannerType(event.target.value as BannerType);
            setErrors((current) => ({ ...current, media: "" }));
            setNotice("");
          }}
          options={[
            { value: "image", label: "Image" },
            { value: "video", label: "Video" },
          ]}
        />
      </div>

      {bannerType === "video" ? (
        <div className="site-upload-section">
          <label htmlFor="hero-video-upload" className="site-upload-box">
            <PlayIcon />
            <span className="site-upload-title">{video ? video.name : "Add Banner Video"}</span>
            <span className="site-upload-hint form-upload-hint">
              Add a quick video highlight for your site. MP4 or MOV,
              <br className="hidden sm:block" />
              max 100MB. Keep it under 60 seconds.
              <br />
              1440 × 720 px preferred
            </span>
            <input
              id="hero-video-upload"
              type="file"
              accept=".mp4,.mov,video/mp4,video/quicktime"
              className="sr-only"
              onChange={(event) => handleUpload(event, "video")}
            />
          </label>
        </div>
      ) : (
        <div className="site-upload-section">
          <label htmlFor="hero-image-upload" className="site-upload-box">
            {image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="Hero banner preview" className="site-upload-thumb" />
                <span className="site-upload-filename">{image.name}</span>
              </>
            ) : (
              <ImagePlaceholder />
            )}
            {!image ? <span className="site-upload-title">Add Banner Image</span> : null}
            <span className="site-upload-hint form-upload-hint">
              Upload a clear image for your site. JPG or PNG, under
              <br className="hidden sm:block" />
              5MB. You can change this anytime.
              <br />
              1440 × 720 px preferred
            </span>
            <input
              id="hero-image-upload"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="sr-only"
              onChange={(event) => handleUpload(event, "image")}
            />
          </label>
        </div>
      )}
      {errors.media ? (
        <p role="alert" className="site-error">
          {errors.media}
        </p>
      ) : null}

      <div className="site-form-grid-2 site-form-grid-2-mt">
        <InputField
          label="Hero title *"
          labelClassName="input-heading"
          id="hero-title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter headline"
        />
        <InputField
          label="Hero subtitle *"
          labelClassName="input-heading"
          id="hero-subtitle"
          required
          value={subtitle}
          onChange={(event) => setSubtitle(event.target.value)}
          placeholder="Supporting text..."
        />
        <InputField
          label="CTA button label *"
          labelClassName="input-heading"
          id="hero-cta-label"
          required
          value={buttonLabel}
          onChange={(event) => setButtonLabel(event.target.value)}
          placeholder="CTA button label"
        />
        <InputField
          label="CTA button URL *"
          labelClassName="input-heading"
          id="hero-cta-url"
          required
          value={buttonUrl}
          onChange={(event) => {
            setButtonUrl(event.target.value);
            setErrors((current) => ({ ...current, form: "" }));
            setNotice("");
          }}
          placeholder="CTA Button URL"
        />
      </div>
      {errors.form ? (
        <p role="alert" className="site-error">
          {errors.form}
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
