"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";

type HeroAsset = {
  id: string;
  name: string;
  url: string;
  file: File;
};

type BannerType = "image" | "video";

const MAX_HERO_VIDEOS = 5;

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
    url: URL.createObjectURL(asset.file),
  };
}

export default function HeroSectionTab() {
  const uploadId = useId();
  const [bannerType, setBannerType] = useState<BannerType>("image");
  const [videos, setVideos] = useState<HeroAsset[]>([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [image, setImage] = useState<HeroAsset | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [buttonLabel, setButtonLabel] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [saved, setSaved] = useState({
    bannerType: "image" as BannerType,
    videos: [] as HeroAsset[],
    image: null as HeroAsset | null,
    title: "",
    subtitle: "",
    buttonLabel: "",
    buttonUrl: "",
  });
  const [errors, setErrors] = useState({ media: "", form: "" });
  const [notice, setNotice] = useState("");

  usePreview(image);

  const videosRef = useRef(videos);
  videosRef.current = videos;
  useEffect(() => {
    return () => {
      for (const asset of videosRef.current) URL.revokeObjectURL(asset.url);
    };
  }, []);

  const activeVideo = videos[activeVideoIndex] ?? null;
  const canAddMoreVideos = videos.length < MAX_HERO_VIDEOS;

  function revokeAsset(asset: HeroAsset | null | undefined) {
    if (asset?.url) URL.revokeObjectURL(asset.url);
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validFormat =
      ["image/jpeg", "image/png"].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (!validFormat) {
      setErrors((current) => ({ ...current, media: "Upload a JPG or PNG image." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, media: "File must be 5 MB or smaller." }));
      return;
    }

    const url = URL.createObjectURL(file);
    const element = new Image();
    element.onload = () => {
      revokeAsset(image);
      setImage({ id: crypto.randomUUID(), name: file.name, url, file });
      setErrors((current) => ({ ...current, media: "" }));
    };
    element.onerror = () => {
      URL.revokeObjectURL(url);
      setErrors((current) => ({ ...current, media: "This image could not be read." }));
    };
    element.src = url;
  }

  function handleVideoUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    const remaining = MAX_HERO_VIDEOS - videos.length;
    if (remaining <= 0) {
      setErrors((current) => ({
        ...current,
        media: `You can upload up to ${MAX_HERO_VIDEOS} hero videos.`,
      }));
      return;
    }

    const selected = files.slice(0, remaining);
    if (files.length > remaining) {
      setErrors((current) => ({
        ...current,
        media: `Only ${MAX_HERO_VIDEOS} videos are allowed. Extra files were skipped.`,
      }));
    } else {
      setErrors((current) => ({ ...current, media: "" }));
    }

    void (async () => {
      const accepted: HeroAsset[] = [];
      for (const file of selected) {
        const validFormat =
          ["video/mp4", "video/quicktime"].includes(file.type) || /\.(mp4|mov)$/i.test(file.name);
        if (!validFormat) {
          setErrors((current) => ({ ...current, media: "Upload MP4 or MOV videos only." }));
          continue;
        }
        if (file.size > 100 * 1024 * 1024) {
          setErrors((current) => ({
            ...current,
            media: "Each video must be 100 MB or smaller.",
          }));
          continue;
        }

        const url = URL.createObjectURL(file);
        const ok = await new Promise<boolean>((resolve) => {
          const element = document.createElement("video");
          element.preload = "metadata";
          element.onloadedmetadata = () => {
            if (!Number.isFinite(element.duration) || element.duration >= 60) {
              URL.revokeObjectURL(url);
              setErrors((current) => ({
                ...current,
                media: "Each video must be shorter than 60 seconds.",
              }));
              resolve(false);
              return;
            }
            resolve(true);
          };
          element.onerror = () => {
            URL.revokeObjectURL(url);
            setErrors((current) => ({ ...current, media: "A video could not be read." }));
            resolve(false);
          };
          element.src = url;
        });

        if (ok) {
          accepted.push({ id: crypto.randomUUID(), name: file.name, url, file });
        }
      }

      if (!accepted.length) return;
      setVideos((current) => {
        const next = [...current, ...accepted].slice(0, MAX_HERO_VIDEOS);
        setActiveVideoIndex(Math.max(0, next.length - accepted.length));
        return next;
      });
      setNotice("");
    })();
  }

  function removeVideo(index: number) {
    setVideos((current) => {
      const target = current[index];
      revokeAsset(target);
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      setActiveVideoIndex((active) => {
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
    if (bannerType === "video" && videos.length === 0) {
      setErrors((current) => ({ ...current, media: "Upload at least one banner video." }));
      return;
    }

    const next = {
      bannerType,
      videos: videos.map((asset) => ({ ...asset })),
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
    videos.forEach(revokeAsset);
    revokeAsset(image);
    const restoredVideos = saved.videos.map(cloneAsset);
    setBannerType(saved.bannerType);
    setVideos(restoredVideos);
    setActiveVideoIndex(0);
    setImage(saved.image ? cloneAsset(saved.image) : null);
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
          {videos.length > 0 ? (
            <div className="site-hero-video-slider" aria-label="Hero video slider">
              <div className="site-hero-video-stage">
                <button
                  type="button"
                  className="site-hero-video-arrow"
                  aria-label="Previous video"
                  disabled={videos.length < 2}
                  onClick={() =>
                    setActiveVideoIndex((index) => (index - 1 + videos.length) % videos.length)
                  }
                >
                  <ChevronLeft />
                </button>

                <div className="site-hero-video-frame">
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    key={activeVideo?.id}
                    src={activeVideo?.url}
                    className="site-hero-video-preview"
                    controls
                    playsInline
                    preload="metadata"
                  />
                  <p className="site-hero-video-caption">
                    {activeVideoIndex + 1} / {videos.length}
                    {activeVideo ? ` · ${activeVideo.name}` : ""}
                  </p>
                </div>

                <button
                  type="button"
                  className="site-hero-video-arrow"
                  aria-label="Next video"
                  disabled={videos.length < 2}
                  onClick={() => setActiveVideoIndex((index) => (index + 1) % videos.length)}
                >
                  <ChevronRight />
                </button>
              </div>

              <div className="site-hero-video-thumbs" role="list">
                {videos.map((video, index) => (
                  <div key={video.id} className="site-hero-video-thumb" role="listitem">
                    <button
                      type="button"
                      className={[
                        "site-hero-video-thumb-btn",
                        index === activeVideoIndex ? "is-active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => setActiveVideoIndex(index)}
                      aria-label={`Show video ${index + 1}`}
                      aria-current={index === activeVideoIndex ? "true" : undefined}
                    >
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <video src={video.url} muted playsInline preload="metadata" />
                      <span>{index + 1}</span>
                    </button>
                    <button
                      type="button"
                      className="site-hero-video-remove"
                      aria-label={`Remove video ${index + 1}`}
                      onClick={() => removeVideo(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <label
            htmlFor={uploadId}
            className={[
              "site-upload-box",
              !canAddMoreVideos ? "pointer-events-none opacity-50" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <PlayIcon />
            <span className="site-upload-title">
              {videos.length ? "Add another banner video" : "Add banner videos"}
            </span>
            <span className="site-upload-hint form-upload-hint">
              Add multiple quick video highlights for your site. MP4 or MOV,
              <br className="hidden sm:block" />
              max 100MB each. Keep each under 60 seconds.
              <br />
              Up to {MAX_HERO_VIDEOS} videos · 1440 × 720 px preferred
            </span>
            <input
              id={uploadId}
              type="file"
              accept=".mp4,.mov,video/mp4,video/quicktime"
              className="sr-only"
              multiple
              disabled={!canAddMoreVideos}
              onChange={handleVideoUpload}
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
              onChange={handleImageUpload}
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
