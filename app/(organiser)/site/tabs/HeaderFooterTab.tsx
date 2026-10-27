"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import AddNavigationModal from "./header-footer/AddNavigationModal";

type NavigationItem = {
  id: string;
  name: string;
  url: string;
  priority: string;
  included: boolean;
};

type FooterLink = {
  id: string;
  label: string;
  included: boolean;
};

type LogoAsset = {
  name: string;
  url: string;
};

type HeaderFooterSettings = {
  searchEnabled: boolean;
  accountEnabled: boolean;
  headerButtonEnabled: boolean;
  headerButtonName: string;
  headerLogo: LogoAsset | null;
  footerLogo: LogoAsset | null;
  navigation: NavigationItem[];
  exploreTitle: string;
  exploreLinks: FooterLink[];
  socialTitle: string;
  socialLinks: { id: string; label: string; value: string }[];
  contactTitle: string;
  phoneCountry: string;
  phoneNumber: string;
  email: string;
  address: string;
};

const initialSettings: HeaderFooterSettings = {
  searchEnabled: true,
  accountEnabled: true,
  headerButtonEnabled: true,
  headerButtonName: "",
  headerLogo: null,
  footerLogo: null,
  navigation: [
    { id: "home", name: "Home", url: "/", priority: "1", included: true },
    { id: "about", name: "About", url: "/about", priority: "2", included: true },
    { id: "events", name: "Events", url: "/events", priority: "3", included: true },
    { id: "news", name: "News", url: "/news", priority: "4", included: true },
  ],
  exploreTitle: "",
  exploreLinks: [
    { id: "about", label: "About", included: true },
    { id: "events", label: "Events", included: true },
    { id: "news", label: "News", included: true },
    { id: "tickets", label: "My Tickets", included: true },
  ],
  socialTitle: "",
  socialLinks: [
    { id: "facebook", label: "Facebook", value: "" },
    { id: "instagram", label: "Instagram", value: "" },
    { id: "tiktok", label: "TikTok", value: "" },
    { id: "youtube", label: "YouTube", value: "" },
  ],
  contactTitle: "",
  phoneCountry: "+1",
  phoneNumber: "",
  email: "",
  address: "",
};

function cloneSettings(settings: HeaderFooterSettings): HeaderFooterSettings {
  return {
    ...settings,
    headerLogo: settings.headerLogo ? { ...settings.headerLogo } : null,
    footerLogo: settings.footerLogo ? { ...settings.footerLogo } : null,
    navigation: settings.navigation.map((item) => ({ ...item })),
    exploreLinks: settings.exploreLinks.map((item) => ({ ...item })),
    socialLinks: settings.socialLinks.map((item) => ({ ...item })),
  };
}

function useLogoPreview(asset: LogoAsset | null) {
  useEffect(() => {
    if (!asset) return;
    return () => URL.revokeObjectURL(asset.url);
  }, [asset]);
}

function ImagePlaceholder() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="site-hf-logo-icon">
      <rect x="3" y="3" width="42" height="42" rx="4" fill="currentColor" />
      <path d="m9 34 9-10 6 6 5-5 10 9H9Z" fill="white" />
      <circle cx="17" cy="16" r="3" fill="white" />
    </svg>
  );
}

function LogoDropZone({
  id,
  label,
  value,
  error,
  onUpload,
}: {
  id: string;
  label: string;
  value: LogoAsset | null;
  error: string;
  onUpload: (file: File | undefined) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="site-hf-logo-upload">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url} alt={`${label} preview`} className="site-hf-logo-preview" />
        ) : (
          <ImagePlaceholder />
        )}
        <span className="site-hf-logo-title">
          {value ? value.name : "Upload website logo"}
        </span>
        <span className="site-hf-logo-hint form-upload-hint">
          {value ? "Click to replace image" : "PNG or SVG · max 2MB"}
        </span>
        <input
          id={id}
          type="file"
          accept=".png,.svg,image/png,image/svg+xml"
          className="sr-only"
          onChange={(event) => {
            onUpload(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
      {error ? (
        <p role="alert" className="site-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={onChange}
      className={`site-switch${checked ? " site-switch-on" : ""}`}
    >
      <span aria-hidden="true" className="site-switch-knob" />
    </button>
  );
}

function CheckControl({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-label={label}
      aria-checked={checked}
      onClick={onChange}
      className={`site-checkbox${checked ? " site-checkbox-on" : ""}`}
    >
      {checked ? (
        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="m2 6 2.5 2.5L10 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </button>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="site-tab-title site-tab-title-lg">{title}</h3>
      <p className="site-tab-subtitle site-tab-subtitle-md">{description}</p>
    </div>
  );
}

function FooterCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="site-hf-card">
      <h4 className="site-hf-card-title">{title}</h4>
      {children}
    </section>
  );
}

export default function HeaderFooterTab() {
  const [settings, setSettings] = useState<HeaderFooterSettings>(() =>
    cloneSettings(initialSettings),
  );
  const [savedSettings, setSavedSettings] = useState<HeaderFooterSettings>(() =>
    cloneSettings(initialSettings),
  );
  const [notice, setNotice] = useState("");
  const [logoErrors, setLogoErrors] = useState({ header: "", footer: "" });
  const [isNavigationModalOpen, setIsNavigationModalOpen] = useState(false);

  useLogoPreview(settings.headerLogo);
  useLogoPreview(settings.footerLogo);

  function updateSetting<K extends keyof HeaderFooterSettings>(
    key: K,
    value: HeaderFooterSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
    setNotice("");
  }

  function handleLogoUpload(slot: "header" | "footer", file: File | undefined) {
    const errorKey = slot === "header" ? "header" : "footer";
    const settingKey = slot === "header" ? "headerLogo" : "footerLogo";

    if (!file) {
      updateSetting(settingKey, null);
      setLogoErrors((current) => ({ ...current, [errorKey]: "" }));
      return;
    }

    const validFormat =
      ["image/png", "image/svg+xml"].includes(file.type) || /\.(png|svg)$/i.test(file.name);
    if (!validFormat) {
      setLogoErrors((current) => ({ ...current, [errorKey]: "Upload a PNG or SVG file." }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoErrors((current) => ({
        ...current,
        [errorKey]: "File must be 2 MB or smaller.",
      }));
      return;
    }

    const url = URL.createObjectURL(file);
    updateSetting(settingKey, { name: file.name, url });
    setLogoErrors((current) => ({ ...current, [errorKey]: "" }));
  }

  function updateNavigation(
    id: string,
    field: "name" | "priority" | "included",
    value: string | boolean,
  ) {
    setSettings((current) => ({
      ...current,
      navigation: current.navigation.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
    setNotice("");
  }

  function updateFooterLink(id: string, included: boolean) {
    setSettings((current) => ({
      ...current,
      exploreLinks: current.exploreLinks.map((item) =>
        item.id === id ? { ...item, included } : item,
      ),
    }));
    setNotice("");
  }

  function updateSocialLink(id: string, value: string) {
    setSettings((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((item) =>
        item.id === id ? { ...item, value } : item,
      ),
    }));
    setNotice("");
  }

  function addNavigationItem(item: Omit<NavigationItem, "id" | "included">) {
    setSettings((current) => ({
      ...current,
      navigation: [...current.navigation, { ...item, id: crypto.randomUUID(), included: true }],
    }));
    setIsNavigationModalOpen(false);
    setNotice("");
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = cloneSettings(settings);
    next.navigation = next.navigation.map((item) => ({ ...item, name: item.name.trim() }));
    setSettings(next);
    setSavedSettings(cloneSettings(next));
    setNotice("Header and footer settings saved.");
  }

  function cancelChanges() {
    setSettings(cloneSettings(savedSettings));
    setLogoErrors({ header: "", footer: "" });
    setNotice("");
  }

  return (
    <div className="site-tab">
      <form onSubmit={saveSettings} aria-label="Header and footer settings">
        <section className="site-hf-section">
          <SectionHeading
            title="Header Configuration"
            description="Set up your website header, navigation and actions."
          />

          <div className="site-hf-block-lg">
            <h4 className="site-hf-subheading">Website logo</h4>
            <LogoDropZone
              id="header-logo-upload"
              label="Header logo"
              value={settings.headerLogo}
              error={logoErrors.header}
              onUpload={(file) => handleLogoUpload("header", file)}
            />
          </div>

          <div className="site-hf-block">
            <h4 className="site-hf-subheading">Header actions</h4>
            <div className="site-hf-toggle-list">
              <div className="site-hf-toggle-row">
                <span className="site-hf-toggle-label">Show search option</span>
                <Toggle
                  label="Show search option"
                  checked={settings.searchEnabled}
                  onChange={() => updateSetting("searchEnabled", !settings.searchEnabled)}
                />
              </div>
              <div className="site-hf-toggle-row">
                <span className="site-hf-toggle-label">Show Login account</span>
                <Toggle
                  label="Show login account"
                  checked={settings.accountEnabled}
                  onChange={() => updateSetting("accountEnabled", !settings.accountEnabled)}
                />
              </div>
            </div>
          </div>

          <div className="site-hf-block">
            <h4 className="site-hf-subheading">Header button</h4>
            <label htmlFor="header-button-name" className="input-heading">
              Contact Us
            </label>
            <div className="site-hf-button-row">
              <CheckControl
                label="Show header contact button"
                checked={settings.headerButtonEnabled}
                onChange={() =>
                  updateSetting("headerButtonEnabled", !settings.headerButtonEnabled)
                }
              />
              <InputField
                id="header-button-name"
                labelClassName="input-heading"
                value={settings.headerButtonName}
                onChange={(event) => updateSetting("headerButtonName", event.target.value)}
                placeholder="Change link name to"
              />
            </div>
          </div>

          <div className="site-hf-block">
            <div className="site-hf-nav-header">
              <h4 className="site-hf-subheading">Main navigation</h4>
              <button
                type="button"
                onClick={() => setIsNavigationModalOpen(true)}
                className="page-primary-button-action"
              >
                <span aria-hidden="true">+</span>
                Add navigation item
              </button>
            </div>

            <div className="site-hf-nav-list">
              {settings.navigation.map((item) => (
                <div key={item.id} className="site-hf-nav-row">
                  <label className="site-hf-nav-name">{item.name || "Navigation item"}</label>
                  <span className="site-hf-nav-check">
                    <CheckControl
                      label={`Include ${item.name || "navigation item"}`}
                      checked={item.included}
                      onChange={() => updateNavigation(item.id, "included", !item.included)}
                    />
                  </span>
                  <InputField
                    aria-label={`${item.name || "Navigation item"} priority`}
                    type="number"
                    min="1"
                    labelClassName="input-heading"
                    value={item.priority}
                    onChange={(event) => updateNavigation(item.id, "priority", event.target.value)}
                    placeholder="Priority"
                  />
                  <InputField
                    aria-label={`${item.name || "Navigation item"} link name`}
                    labelClassName="input-heading"
                    value={item.name}
                    onChange={(event) => updateNavigation(item.id, "name", event.target.value)}
                    placeholder="Change link name to"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="site-hf-footer">
          <SectionHeading
            title="Footer Configuration"
            description="Set up your website footer with links, contact information and social media."
          />

          <div className="site-hf-block">
            <h4 className="site-hf-subheading site-hf-subheading-sm">Website logo</h4>
            <LogoDropZone
              id="footer-logo-upload"
              label="Footer logo"
              value={settings.footerLogo}
              error={logoErrors.footer}
              onUpload={(file) => handleLogoUpload("footer", file)}
            />
          </div>

          <div className="site-hf-cards">
            <FooterCard title="Explore">
              <InputField
                aria-label="Explore footer title"
                labelClassName="input-heading"
                value={settings.exploreTitle}
                onChange={(event) => updateSetting("exploreTitle", event.target.value)}
                placeholder="Change title name to"
              />
              <h5 className="site-hf-card-links-title">Links</h5>
              <div className="site-hf-card-links">
                {settings.exploreLinks.map((link) => (
                  <label key={link.id} className="site-hf-link-row">
                    <span aria-hidden="true" className="site-hf-drag">
                      ⠿
                    </span>
                    <CheckControl
                      label={`Show ${link.label} footer link`}
                      checked={link.included}
                      onChange={() => updateFooterLink(link.id, !link.included)}
                    />
                    {link.label}
                  </label>
                ))}
              </div>
            </FooterCard>

            <FooterCard title="Social handles">
              <InputField
                aria-label="Social handles footer title"
                labelClassName="input-heading"
                value={settings.socialTitle}
                onChange={(event) => updateSetting("socialTitle", event.target.value)}
                placeholder="Change title name to"
              />
              <h5 className="site-hf-card-links-title">Links</h5>
              <div className="site-hf-social-fields">
                {settings.socialLinks.map((link) => (
                  <InputField
                    key={link.id}
                    id={`social-${link.id}`}
                    type="url"
                    label={`${link.label}`}
                    labelClassName="input-heading"
                    value={link.value}
                    onChange={(event) => updateSocialLink(link.id, event.target.value)}
                    placeholder={`${link.id}.com/yourhandle`}
                  />
                ))}
              </div>
            </FooterCard>

            <FooterCard title="Contact">
              <InputField
                aria-label="Contact footer title"
                labelClassName="input-heading"
                value={settings.contactTitle}
                onChange={(event) => updateSetting("contactTitle", event.target.value)}
                placeholder="Change title name to"
              />
              <div className="site-hf-social-fields">
                <div className="site-hf-phone-field">
                  <label htmlFor="footer-phone" className="input-heading">
                    Phone Number
                  </label>
                  <div className="site-hf-phone-row">
                    <SelectField
                      id="footer-phone-country"
                      aria-label="Phone country code"
                      labelClassName="input-heading"
                      value={settings.phoneCountry}
                      onChange={(event) => updateSetting("phoneCountry", event.target.value)}
                      options={[
                        { value: "+1", label: "🇺🇸 +1" },
                        { value: "+44", label: "🇬🇧 +44" },
                        { value: "+91", label: "🇮🇳 +91" },
                      ]}
                    />
                    <InputField
                      id="footer-phone"
                      type="tel"
                      labelClassName="input-heading"
                      value={settings.phoneNumber}
                      onChange={(event) => updateSetting("phoneNumber", event.target.value)}
                      placeholder="(000) 000-0000"
                    />
                  </div>
                </div>
                <InputField
                  id="footer-email"
                  label="Email"
                  labelClassName="input-heading"
                  type="email"
                  value={settings.email}
                  onChange={(event) => updateSetting("email", event.target.value)}
                  placeholder="user@gmail.com"
                />
                <InputField
                  as="textarea"
                  id="footer-address"
                  rows={3}
                  label="Address"
                  labelClassName="input-heading"
                  value={settings.address}
                  onChange={(event) => updateSetting("address", event.target.value)}
                  placeholder="Enter address details"
                />
              </div>
            </FooterCard>
          </div>
        </section>

        <div className="site-form-actions">
          {notice ? (
            <p role="status" className="site-notice">
              {notice}
            </p>
          ) : null}
          <button
            type="button"
            onClick={cancelChanges}
            className="form-footer-btn form-footer-btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="form-footer-btn form-footer-btn-primary">
            Save
          </button>
        </div>
      </form>

      {isNavigationModalOpen ? (
        <AddNavigationModal
          open
          defaultPriority={String(settings.navigation.length + 1)}
          onClose={() => setIsNavigationModalOpen(false)}
          onSave={addNavigationItem}
        />
      ) : null}
    </div>
  );
}
