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
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-8 w-8 text-[#d7d7d7]">
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
    <form onSubmit={saveAbout} className="mt-4">
      {/* <h3 className="text-[18px] font-black uppercase leading-6">About page</h3>
      <p className="mt-1 text-[12px] text-[#777]">
        All things your customers want to know and love about your brand
      </p> */}

      <div className="mt-4 grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
        <div>
          <InputField
            id="about-title"
            label="Title"
            labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
            required
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setNotice("");
            }}
            placeholder="Enter headline"
            density="compact"
            containerClassName="mt-1 mb-[20px]"
            className="!h-[40px]"
          />
          <InputField
            as="textarea"
            labelClassName="!text-[14px] !mb-[6px] !leading-[20px]"
            label="Description"
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
          <label
            htmlFor="about-image"
            className="flex min-h-[186px] cursor-pointer flex-col items-center justify-center border border-dashed border-black/65 px-5 py-6 text-center transition hover:bg-black/[0.025]"
          >
            {image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="About page preview" className="mb-2 max-h-[112px] max-w-full object-contain" />
                <span className="text-[11px] font-bold">{image.name}</span>
                <span className="mt-1 text-[10px] text-[#999]">Click to replace image</span>
              </>
            ) : (
              <>
                <ImagePlaceholder />
                <span className="mt-2 text-[16px] font-bold text-black">Add Image</span>
                <span className="mt-2 text-[14px] leading-[18px] text-[#999]">
                  Upload a nice image that represent your brand. JPG or<br className="hidden sm:block" />
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
          {imageError ? <p role="alert" className="mt-1 text-[11px] text-red-600">{imageError}</p> : null}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        {notice ? <p role="status" className="mr-auto text-[11px] text-[#666]">{notice}</p> : null}
        <button
          type="button"
          onClick={cancelChanges}
          className="h-[40px] min-w-[90px] rounded-[3px] border border-black px-4 text-[14px] cursor-pointer uppercase hover:bg-black hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-[40px] min-w-[78px] rounded-[3px] border border-black bg-black px-4 text-[14px] cursor-pointer uppercase text-white hover:bg-white hover:text-black"
        >
          Save
        </button>
      </div>
    </form>
  );
}
