"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useUploadMediaMutation } from "@/apis/media/mediaApi";
import {
  isApiSiteId,
  useUpdateOrganisationSiteAssetsMutation,
} from "@/apis/organisation/siteApi";
import { Button } from "@/components/ui/Button";
import type { SiteMediaAsset, SiteRecord } from "../siteTypes";

type AssetKind = "logo" | "favicon";

function AssetPlaceholder() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="site-asset-upload-icon">
      <path
        d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5M8 10l4-4 4 4M12 6.5V16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MainAssetsTab({ site }: { site: SiteRecord }) {
  const [logo, setLogo] = useState<SiteMediaAsset | null>(site.logo);
  const [favicon, setFavicon] = useState<SiteMediaAsset | null>(site.favicon);
  const [savedLogo, setSavedLogo] = useState<SiteMediaAsset | null>(site.logo);
  const [savedFavicon, setSavedFavicon] = useState<SiteMediaAsset | null>(site.favicon);
  const [uploading, setUploading] = useState<AssetKind | null>(null);
  const [errors, setErrors] = useState({ logo: "", favicon: "" });
  const [notice, setNotice] = useState("");

  const [uploadMedia] = useUploadMediaMutation();
  const [updateAssets, { isLoading: isSaving }] = useUpdateOrganisationSiteAssetsMutation();

  useEffect(() => {
    setLogo(site.logo);
    setFavicon(site.favicon);
    setSavedLogo(site.logo);
    setSavedFavicon(site.favicon);
    setErrors({ logo: "", favicon: "" });
    setNotice("");
  }, [site.id, site.logo, site.favicon]);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>, type: AssetKind) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const setError = (message: string) =>
      setErrors((current) => ({ ...current, [type]: message }));

    const validFormat =
      ["image/png", "image/svg+xml"].includes(file.type) || /\.(png|svg)$/i.test(file.name);
    if (!validFormat) {
      setError("Upload a PNG or SVG file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("File must be 2 MB or smaller.");
      return;
    }

    setUploading(type);
    setError("");
    setNotice("");

    try {
      const result = await uploadMedia({
        file,
        context: type === "logo" ? "site-logo" : "site-favicon",
      }).unwrap();

      const asset: SiteMediaAsset = {
        path: result.data.path,
        url: result.data.url,
        name: result.data.original_name || file.name,
      };

      if (type === "logo") setLogo(asset);
      else setFavicon(asset);
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(null);
    }
  }

  async function saveAssets(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isApiSiteId(site.id)) {
      setNotice("Save branding after the site is created.");
      return;
    }
    if (!logo?.path || !favicon?.path) {
      setNotice("Upload both a logo and favicon before saving.");
      return;
    }

    try {
      await updateAssets({
        siteId: site.id,
        body: {
          logo: logo.path,
          favicon: favicon.path,
        },
      }).unwrap();
      setSavedLogo(logo);
      setSavedFavicon(favicon);
      setNotice("Logo and favicon saved.");
    } catch {
      // Toast handled by mutation.
    }
  }

  function cancelChanges() {
    setLogo(savedLogo);
    setFavicon(savedFavicon);
    setErrors({ logo: "", favicon: "" });
    setNotice("");
  }

  const assets = [
    {
      id: "logo" as const,
      label: "Official logo",
      value: logo,
      emptyTitle: "Click to upload logo",
      uploadingTitle: "Uploading logo…",
    },
    {
      id: "favicon" as const,
      label: "Favicon",
      value: favicon,
      emptyTitle: "Click to upload favicon",
      uploadingTitle: "Uploading favicon…",
    },
  ];

  return (
    <form onSubmit={(event) => void saveAssets(event)} className="site-tab">
      <div className="site-form-grid-2 site-assets-grid">
        {assets.map((asset) => {
          const isUploading = uploading === asset.id;
          return (
            <div key={asset.id}>
              <label className="input-heading" htmlFor={`site-${asset.id}-upload`}>
                {asset.label}
              </label>
              <label
                htmlFor={`site-${asset.id}-upload`}
                className={[
                  "form-upload-box site-asset-upload",
                  isUploading ? "site-asset-upload--busy" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {asset.value?.url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.value.url}
                      alt={`${asset.label} preview`}
                      className="site-asset-upload-preview"
                    />
                    <p className="input-heading mb-0 text-center">
                      {asset.value.name || "Replace image"}
                    </p>
                    <p className="form-upload-hint">Click to replace · PNG or SVG · max 2MB</p>
                  </>
                ) : (
                  <>
                    <AssetPlaceholder />
                    <p className="input-heading mb-0 text-center">
                      {isUploading ? asset.uploadingTitle : asset.emptyTitle}
                    </p>
                    <p className="form-upload-hint">
                      PNG or SVG · max 2MB
                      <br />
                      (Min 200×200px)
                    </p>
                  </>
                )}
                <input
                  id={`site-${asset.id}-upload`}
                  type="file"
                  accept=".png,.svg,image/png,image/svg+xml"
                  className="sr-only"
                  disabled={Boolean(uploading) || isSaving}
                  onChange={(event) => {
                    void handleUpload(event, asset.id);
                  }}
                />
              </label>
              {errors[asset.id] ? (
                <p role="alert" className="site-error">
                  {errors[asset.id]}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="site-form-actions">
        {notice ? (
          <p role="status" className="site-notice">
            {notice}
          </p>
        ) : null}
        <Button
          type="button"
          onClick={cancelChanges}
          disabled={isSaving || Boolean(uploading)}
          className="form-footer-btn form-footer-btn-secondary"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving || Boolean(uploading)}
          className="form-footer-btn form-footer-btn-primary"
        >
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
