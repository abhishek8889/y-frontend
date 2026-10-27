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
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="site-upload-preview-icon">
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
    <form onSubmit={saveAssets} className="site-tab">
      <InputField
        id="microsite-name"
        required
        label="Microsite name"
        labelClassName="input-heading"
        value={microSiteName}
        onChange={(event) => {
          setMicroSiteName(event.target.value);
          setNotice("");
        }}
        placeholder="e.g. United Sports Elite"
      />

      <div className="site-form-grid-2 site-assets-grid">
        {([
          { id: "logo", label: "Official logo", value: logo, hint: "Click to upload logo" },
          { id: "favicon", label: "Favicon", value: favicon, hint: "Click to upload favicon" },
        ] as const).map((asset) => (
          <div key={asset.id}>
            <label className="input-heading" htmlFor={`site-${asset.id}-upload`}>
              {asset.label}
            </label>
            <label htmlFor={`site-${asset.id}-upload`} className="site-upload-inline">
              <span className="site-upload-preview">
                {asset.value ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.value.url} alt={`${asset.label} preview`} />
                ) : (
                  <AssetPlaceholder />
                )}
              </span>
              <span className="site-upload-meta">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="site-upload-meta-icon">
                  <path
                    d="M12 16V3m0 0L7 8m5-5 5 5M4 15v5h16v-5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="site-upload-meta-title">{asset.value?.name ?? asset.hint}</span>
                <span className="site-upload-meta-hint">
                  PNG or SVG · max 2MB
                  <br />
                  (Min 200x200px)
                </span>
              </span>
              <input
                id={`site-${asset.id}-upload`}
                type="file"
                accept=".png,.svg,image/png,image/svg+xml"
                className="sr-only"
                onChange={(event) => handleUpload(event, asset.id)}
              />
            </label>
            {errors[asset.id] ? (
              <p role="alert" className="site-error">
                {errors[asset.id]}
              </p>
            ) : null}
          </div>
        ))}
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
