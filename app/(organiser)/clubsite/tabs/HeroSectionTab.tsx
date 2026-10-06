"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { InputField } from "@/components/ui/InputField";

type HeroAsset = {
  name: string;
  url: string;
  file: File;
};

function usePreview(asset: HeroAsset | null) {
  useEffect(() => {
    if (!asset) return;
    return () => URL.revokeObjectURL(asset.url);
  }, [asset]);
}

function PlayIcon() {
  return (
    <span className="flex h-[38px] w-[46px] items-center justify-center rounded-[2px] bg-[#d9d9d9]">
      <svg viewBox="0 0 24 24" fill="white" aria-hidden="true" className="ml-0.5 h-5 w-5">
        <path d="M7 4.8a1 1 0 0 1 1.5-.86l11.2 6.2a2.1 2.1 0 0 1 0 3.72L8.5 20.06A1 1 0 0 1 7 19.2V4.8Z" />
      </svg>
    </span>
  );
}

export default function HeroSectionTab() {
  const [video, setVideo] = useState<HeroAsset | null>(null);
  const [image, setImage] = useState<HeroAsset | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [buttonLabel, setButtonLabel] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [saved, setSaved] = useState({ video: null as HeroAsset | null, image: null as HeroAsset | null, title: "", subtitle: "", buttonLabel: "", buttonUrl: "" });
  const [errors, setErrors] = useState({ video: "", image: "", form: "" });
  const [notice, setNotice] = useState("");

  usePreview(video);
  usePreview(image);

  function handleUpload(event: ChangeEvent<HTMLInputElement>, type: "video" | "image") {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const isVideo = type === "video";
    const validFormat = isVideo
      ? ["video/mp4", "video/quicktime"].includes(file.type) || /\.(mp4|mov)$/i.test(file.name)
      : ["image/jpeg", "image/png"].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (!validFormat) {
      setErrors((current) => ({ ...current, [type]: isVideo ? "Upload an MP4 or MOV video." : "Upload a JPG or PNG image." }));
      return;
    }
    const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors((current) => ({ ...current, [type]: `File must be ${isVideo ? "100" : "5"} MB or smaller.` }));
      return;
    }

    const url = URL.createObjectURL(file);
    if (isVideo) {
      const element = document.createElement("video");
      element.preload = "metadata";
      element.onloadedmetadata = () => {
        if (!Number.isFinite(element.duration) || element.duration >= 60) {
          URL.revokeObjectURL(url);
          setErrors((current) => ({ ...current, video: "Video must be shorter than 60 seconds." }));
          return;
        }
        setVideo({ name: file.name, url, file });
        setErrors((current) => ({ ...current, video: "" }));
      };
      element.onerror = () => {
        URL.revokeObjectURL(url);
        setErrors((current) => ({ ...current, video: "This video could not be read." }));
      };
      element.src = url;
      return;
    }

    const element = new Image();
    element.onload = () => {
      setImage({ name: file.name, url, file });
      setErrors((current) => ({ ...current, image: "" }));
    };
    element.onerror = () => {
      URL.revokeObjectURL(url);
      setErrors((current) => ({ ...current, image: "This image could not be read." }));
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
      setErrors((current) => ({ ...current, form: "Enter a valid CTA URL, such as /events or https://example.com." }));
      return;
    }
    const next = { video, image, title: title.trim(), subtitle: subtitle.trim(), buttonLabel: buttonLabel.trim(), buttonUrl: destination };
    setSaved(next);
    setButtonUrl(destination);
    setErrors((current) => ({ ...current, form: "" }));
    setNotice("Hero section saved.");
  }

  function cancelChanges() {
    setVideo(saved.video ? { ...saved.video, url: URL.createObjectURL(saved.video.file) } : null);
    setImage(saved.image ? { ...saved.image, url: URL.createObjectURL(saved.image.file) } : null);
    setTitle(saved.title);
    setSubtitle(saved.subtitle);
    setButtonLabel(saved.buttonLabel);
    setButtonUrl(saved.buttonUrl);
    setErrors({ video: "", image: "", form: "" });
    setNotice("");
  }

  return (
    <form onSubmit={saveHero} className="mt-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="hero-video-upload" className="flex min-h-[205px] cursor-pointer flex-col items-center justify-center border border-dashed border-black/65 px-5 py-6 text-center transition hover:bg-black/[0.025]">
            <PlayIcon />
            <span className="mt-2.5 text-[12px] font-bold text-black">{video ? video.name : "Add Banner Video"}</span>
            <span className="mt-2 max-w-[320px] text-[10px] leading-[15px] text-[#999]">
              Add a quick video highlight for your Clubsite. MP4 or MOV,<br className="hidden sm:block" />
              max 100MB. Keep it under 60 seconds.<br />1440 × 720 px preferred
            </span>
            <input id="hero-video-upload" type="file" accept=".mp4,.mov,video/mp4,video/quicktime" className="sr-only" onChange={(event) => handleUpload(event, "video")} />
          </label>
          {errors.video ? <p role="alert" className="mt-1 text-[11px] text-red-600">{errors.video}</p> : null}
        </div>

        <div>
          <label htmlFor="hero-image-upload" className="flex min-h-[205px] cursor-pointer flex-col items-center justify-center border border-dashed border-black/65 px-5 py-6 text-center transition hover:bg-black/[0.025]">
            {image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="Hero banner preview" className="mb-2 max-h-[105px] max-w-full object-contain" />
                <span className="text-[11px] font-bold">{image.name}</span>
              </>
            ) : <PlayIcon />}
            {!image ? <span className="mt-2.5 text-[12px] font-bold text-black">Add Banner Image</span> : null}
            <span className="mt-2 max-w-[320px] text-[10px] leading-[15px] text-[#999]">
              Upload a clear image for your Clubsite. JPG or PNG, under<br className="hidden sm:block" />
              5MB. You can change this anytime.<br />1440 × 720 px preferred
            </span>
            <input id="hero-image-upload" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="sr-only" onChange={(event) => handleUpload(event, "image")} />
          </label>
          {errors.image ? <p role="alert" className="mt-1 text-[11px] text-red-600">{errors.image}</p> : null}
        </div>
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-3.5 lg:grid-cols-2">
        <div>
          <label htmlFor="hero-title" className="block text-[10px] font-bold uppercase">Hero title *</label>
          <InputField id="hero-title" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter headline" density="compact" containerClassName="mt-1 !h-[34px] !rounded-[3px] !border-black/65 focus-within:!ring-0" className="!px-3 !text-[11px] normal-case placeholder:!text-[#777]" />
        </div>
        <div>
          <label htmlFor="hero-subtitle" className="block text-[10px] font-bold uppercase">Hero subtitle *</label>
          <InputField id="hero-subtitle" required value={subtitle} onChange={(event) => setSubtitle(event.target.value)} placeholder="Supporting text..." density="compact" containerClassName="mt-1 !h-[34px] !rounded-[3px] !border-black/65 focus-within:!ring-0" className="!px-3 !text-[11px] normal-case placeholder:!text-[#777]" />
        </div>
        <div>
          <label htmlFor="hero-cta-label" className="block text-[10px] font-bold uppercase">CTA button label *</label>
          <InputField id="hero-cta-label" required value={buttonLabel} onChange={(event) => setButtonLabel(event.target.value)} placeholder="CTA button label" density="compact" containerClassName="mt-1 !h-[34px] !rounded-[3px] !border-black/65 focus-within:!ring-0" className="!px-3 !text-[11px] normal-case placeholder:!text-[#777]" />
        </div>
        <div>
          <label htmlFor="hero-cta-url" className="block text-[10px] font-bold uppercase">CTA button URL *</label>
          <InputField id="hero-cta-url" required value={buttonUrl} onChange={(event) => { setButtonUrl(event.target.value); setErrors((current) => ({ ...current, form: "" })); setNotice(""); }} placeholder="CTA Button URL" density="compact" containerClassName="mt-1 !h-[34px] !rounded-[3px] !border-black/65 focus-within:!ring-0" className="!px-3 !text-[11px] normal-case placeholder:!text-[#777]" />
        </div>
      </div>
      {errors.form ? <p role="alert" className="mt-2 text-[11px] text-red-600">{errors.form}</p> : null}
      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        {notice ? <p role="status" className="mr-auto text-[11px] text-[#666]">{notice}</p> : null}
        <button type="button" onClick={cancelChanges} className="h-[35px] min-w-[96px] rounded-[3px] border border-black/70 px-4 text-[10px] uppercase hover:bg-black hover:text-white">Cancel</button>
        <button type="submit" className="h-[35px] min-w-[82px] rounded-[3px] border border-black bg-black px-4 text-[10px] uppercase text-white hover:bg-white hover:text-black">Save</button>
      </div>
    </form>
  );
}
