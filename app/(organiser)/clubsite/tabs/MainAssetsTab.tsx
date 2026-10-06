"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { InputField } from "@/components/ui/InputField";

type UploadedAsset = {
  name: string;
  url: string;
};

function useAssetPreview(asset: UploadedAsset | null) {
  useEffect(() => {
    if (!asset) return;
    return () => URL.revokeObjectURL(asset.url);
  }, [asset]);
}

function AssetPlaceholder() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-8 w-8 text-[#bdbdbd]">
      <rect x="3" y="3" width="42" height="42" rx="4" fill="currentColor" />
      <path d="m9 34 9-10 6 6 5-5 10 9H9Z" fill="white" />
      <circle cx="17" cy="16" r="3" fill="white" />
    </svg>
  );
}

export default function MainAssetsTab() {
  const [microSiteName, setMicroSiteName] = useState("");
  const [savedMicroSiteName, setSavedMicroSiteName] = useState("");
  const [logo, setLogo] = useState<UploadedAsset | null>(null);
  const [favicon, setFavicon] = useState<UploadedAsset | null>(null);
  const [errors, setErrors] = useState({ logo: "", favicon: "" });
  const [notice, setNotice] = useState("");

  useAssetPreview(logo);
  useAssetPreview(favicon);

  function handleUpload(event: ChangeEvent<HTMLInputElement>, type: "logo" | "favicon") {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const setError = (message: string) => setErrors((current) => ({ ...current, [type]: message }));
    const validFormat = ["image/png", "image/svg+xml"].includes(file.type) || /\.(png|svg)$/i.test(file.name);
    if (!validFormat) {
      setError("Upload a PNG or SVG file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("File must be 2 MB or smaller.");
      return;
    }

    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth < 200 || image.naturalHeight < 200) {
        URL.revokeObjectURL(url);
        setError("Image must be at least 200 × 200 pixels.");
        return;
      }
      const asset = { name: file.name, url };
      if (type === "logo") setLogo(asset);
      else setFavicon(asset);
      setError("");
      setNotice("");
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setError("This image could not be read. Choose a valid PNG or SVG.");
    };
    image.src = url;
  }

  function saveAssets(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavedMicroSiteName(microSiteName.trim());
    setMicroSiteName(microSiteName.trim());
    setNotice("Branding assets saved.");
  }

  function cancelChanges() {
    setMicroSiteName(savedMicroSiteName);
    setLogo(null);
    setFavicon(null);
    setErrors({ logo: "", favicon: "" });
    setNotice("");
  }

  return (
    <form onSubmit={saveAssets} className="mt-4">
      <div>
        <label htmlFor="microsite-name" className="block text-[10px] font-bold uppercase">Microsite name *</label>
        <InputField
          id="microsite-name"
          required
          value={microSiteName}
          onChange={(event) => {
            setMicroSiteName(event.target.value);
            setNotice("");
          }}
          placeholder="e.g. United Sports Elite"
          density="compact"
          containerClassName="mt-1 !h-[34px] !rounded-[3px] !border-black/65 focus-within:!ring-0"
          className="!px-3 !text-[11px] placeholder:!text-[#777]"
        />
      </div>

      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        {([
          { id: "logo", label: "Official logo", value: logo, hint: "Click to upload logo" },
          { id: "favicon", label: "Favicon", value: favicon, hint: "Click to upload favicon" },
        ] as const).map((asset) => (
          <div key={asset.id}>
            <label className="mb-1 block text-[10px] font-bold uppercase">{asset.label}</label>
            <label htmlFor={`clubsite-${asset.id}-upload`} className="flex min-h-[142px] cursor-pointer items-center gap-4 border border-dashed border-black/65 p-3.5 transition hover:bg-black/[0.025] sm:gap-5 sm:px-4">
              <span className="flex h-[112px] w-[112px] shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-[#f4f4f4]">
                {asset.value ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.value.url} alt={`${asset.label} preview`} className="h-full w-full object-contain p-2" />
                ) : <AssetPlaceholder />}
              </span>
              <span className="min-w-0">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mb-2 h-6 w-6 text-black">
                  <path d="M12 16V3m0 0L7 8m5-5 5 5M4 15v5h16v-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="block text-[10px] font-bold uppercase">{asset.value?.name ?? asset.hint}</span>
                <span className="mt-2 block text-[11px] leading-4 text-black">PNG or SVG · max 2MB<br />(Min 200x200px)</span>
              </span>
              <input
                id={`clubsite-${asset.id}-upload`}
                type="file"
                accept=".png,.svg,image/png,image/svg+xml"
                className="sr-only"
                onChange={(event) => handleUpload(event, asset.id)}
              />
            </label>
            {errors[asset.id] ? <p role="alert" className="mt-1 text-[11px] text-red-600">{errors[asset.id]}</p> : null}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        {notice ? <p role="status" className="mr-auto text-[11px] text-[#666]">{notice}</p> : null}
        <button type="button" onClick={cancelChanges} className="h-[35px] min-w-[96px] rounded-[3px] border border-black/70 px-4 text-[10px] uppercase hover:bg-black hover:text-white">Cancel</button>
        <button type="submit" className="h-[35px] min-w-[82px] rounded-[3px] border border-black bg-black px-4 text-[10px] uppercase text-white hover:bg-white hover:text-black">Save</button>
      </div>
    </form>
  );
}
