"use client";

import {
  useEffect,
  useState,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useUploadMediaMutation } from "@/apis/media/mediaApi";
import {
  isApiSiteId,
  useUpdateOrganisationSiteMutation,
} from "@/apis/organisation/siteApi";
import { InputField } from "@/components/ui/InputField";
import {
  defaultFooterConfig,
  defaultHeaderConfig,
  footerToPayload,
  headerToPayload,
} from "../siteMappers";
import type {
  SiteFooterConfig,
  SiteFooterLink,
  SiteHeaderConfig,
  SiteMediaAsset,
  SiteNavItem,
  SiteRecord,
  SiteSocialLink,
} from "../siteTypes";
import AddNavigationModal from "./header-footer/AddNavigationModal";

type NavigationItem = SiteNavItem;
type FooterLink = SiteFooterLink;
type LogoAsset = SiteMediaAsset;

type HeaderFooterSettings = {
  searchEnabled: boolean;
  accountEnabled: boolean;
  headerLogo: LogoAsset | null;
  footerLogo: LogoAsset | null;
  navigation: NavigationItem[];
  exploreTitle: string;
  exploreLinks: FooterLink[];
  socialTitle: string;
  socialLinks: SiteSocialLink[];
  contactTitle: string;
  phoneNumber: string;
  email: string;
  address: string;
};

function settingsFromSite(site: SiteRecord | null | undefined): HeaderFooterSettings {
  const header = site?.header ?? defaultHeaderConfig();
  const footer = site?.footer ?? defaultFooterConfig();
  return {
    searchEnabled: header.search_enabled,
    accountEnabled: header.account_enabled,
    headerLogo: header.logo ? { ...header.logo } : null,
    footerLogo: footer.logo ? { ...footer.logo } : null,
    navigation: header.navigation.map((item) => ({ ...item })),
    exploreTitle: footer.explore_title,
    exploreLinks: footer.explore_links.map((item) => ({ ...item })),
    socialTitle: footer.social_title,
    socialLinks: footer.social_links.map((item) => ({ ...item })),
    contactTitle: footer.contact_title,
    phoneNumber: footer.phone,
    email: footer.email,
    address: footer.address,
  };
}

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

function toHeaderConfig(settings: HeaderFooterSettings): SiteHeaderConfig {
  return {
    logo: settings.headerLogo,
    navigation: settings.navigation.map((item) => ({
      ...item,
      name: item.name.trim(),
    })),
    search_enabled: settings.searchEnabled,
    account_enabled: settings.accountEnabled,
  };
}

function toFooterConfig(settings: HeaderFooterSettings): SiteFooterConfig {
  return {
    logo: settings.footerLogo,
    explore_title: settings.exploreTitle.trim(),
    explore_links: settings.exploreLinks.map((item) => ({ ...item })),
    social_title: settings.socialTitle.trim(),
    social_links: settings.socialLinks.map((item) => ({
      ...item,
      value: item.value.trim(),
    })),
    contact_title: settings.contactTitle.trim(),
    phone: settings.phoneNumber.trim(),
    email: settings.email.trim(),
    address: settings.address.trim(),
  };
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
      <label htmlFor={id} className="form-upload-box site-hf-logo-upload">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url} alt={`${label} preview`} className="site-hf-logo-preview" />
        ) : (
          <ImagePlaceholder />
        )}
        <p className="input-heading mb-0 text-center">
          {value ? value.name : `Upload ${label.toLowerCase()}`}
        </p>
        <p className="form-upload-hint">
          {value ? "Click to replace image" : "PNG or SVG · max 2MB"}
        </p>
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

export default function HeaderFooterTab({
  site,
  section = "all",
}: {
  site: SiteRecord;
  section?: "header" | "footer" | "all";
}) {
  const showHeader = section === "header" || section === "all";
  const showFooter = section === "footer" || section === "all";

  const [settings, setSettings] = useState<HeaderFooterSettings>(() =>
    cloneSettings(settingsFromSite(site)),
  );
  const [savedSettings, setSavedSettings] = useState<HeaderFooterSettings>(() =>
    cloneSettings(settingsFromSite(site)),
  );
  const [notice, setNotice] = useState("");
  const [logoErrors, setLogoErrors] = useState({ header: "", footer: "" });
  const [uploadingLogo, setUploadingLogo] = useState<"header" | "footer" | null>(null);
  const [isNavigationModalOpen, setIsNavigationModalOpen] = useState(false);
  const [draggingNavId, setDraggingNavId] = useState<string | null>(null);
  const [dragOverNavId, setDragOverNavId] = useState<string | null>(null);

  const [uploadMedia] = useUploadMediaMutation();
  const [updateSite, { isLoading: isSaving }] = useUpdateOrganisationSiteMutation();

  useEffect(() => {
    const next = cloneSettings(settingsFromSite(site));
    setSettings(next);
    setSavedSettings(cloneSettings(next));
    setLogoErrors({ header: "", footer: "" });
    setNotice("");
  }, [site.id, site.header, site.footer]);

  function updateSetting<K extends keyof HeaderFooterSettings>(
    key: K,
    value: HeaderFooterSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
    setNotice("");
  }

  async function handleLogoUpload(slot: "header" | "footer", file: File | undefined) {
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

    setUploadingLogo(slot);
    setLogoErrors((current) => ({ ...current, [errorKey]: "" }));
    setNotice("");

    try {
      const result = await uploadMedia({
        file,
        context: slot === "header" ? "site-header-logo" : "site-footer-logo",
      }).unwrap();
      updateSetting(settingKey, {
        path: result.data.path,
        url: result.data.url,
        name: result.data.original_name || file.name,
      });
    } catch {
      setLogoErrors((current) => ({
        ...current,
        [errorKey]: "Upload failed. Try again.",
      }));
    } finally {
      setUploadingLogo(null);
    }
  }

  function updateNavigation(
    id: string,
    field: "name" | "included",
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

  function withSyncedPriorities(items: NavigationItem[]): NavigationItem[] {
    return items.map((item, index) => ({ ...item, priority: String(index + 1) }));
  }

  function reorderNavigation(fromId: string, toId: string) {
    if (fromId === toId) return;
    setSettings((current) => {
      const fromIndex = current.navigation.findIndex((item) => item.id === fromId);
      const toIndex = current.navigation.findIndex((item) => item.id === toId);
      if (fromIndex < 0 || toIndex < 0) return current;
      const next = [...current.navigation];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return { ...current, navigation: withSyncedPriorities(next) };
    });
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

  function addNavigationItem(item: { name: string; url: string }) {
    setSettings((current) => ({
      ...current,
      navigation: withSyncedPriorities([
        ...current.navigation,
        {
          id: crypto.randomUUID(),
          name: item.name,
          url: item.url,
          priority: String(current.navigation.length + 1),
          included: true,
        },
      ]),
    }));
    setIsNavigationModalOpen(false);
    setNotice("");
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isApiSiteId(site.id)) {
      setNotice("Save branding after the site is created.");
      return;
    }

    const next = cloneSettings(settings);
    next.navigation = next.navigation.map((item) => ({ ...item, name: item.name.trim() }));
    setSettings(next);

    const body =
      section === "footer"
        ? { footer: footerToPayload(toFooterConfig(next)) }
        : section === "header"
          ? { header: headerToPayload(toHeaderConfig(next)) }
          : {
              header: headerToPayload(toHeaderConfig(next)),
              footer: footerToPayload(toFooterConfig(next)),
            };

    try {
      await updateSite({ siteId: site.id, body }).unwrap();
      setSavedSettings(cloneSettings(next));
      if (section === "header") setNotice("Header settings saved.");
      else if (section === "footer") setNotice("Footer settings saved.");
      else setNotice("Header and footer settings saved.");
    } catch {
      // Toast handled by mutation.
    }
  }

  function cancelChanges() {
    setSettings(cloneSettings(savedSettings));
    setLogoErrors({ header: "", footer: "" });
    setNotice("");
  }

  return (
    <div className={section === "all" ? "site-tab" : "site-hf-embedded"}>
      <form
        onSubmit={(event) => {
          void saveSettings(event);
        }}
        aria-label={
          section === "header"
            ? "Header settings"
            : section === "footer"
              ? "Footer settings"
              : "Header and footer settings"
        }
      >
        {showHeader ? (
          <section className="site-hf-section">
            {section === "all" ? (
              <SectionHeading
                title="Header Configuration"
                description="Set up your website header, navigation and actions."
              />
            ) : null}

            <div className="site-hf-block site-hf-block--first">
              <h4 className="input-heading">Header preview</h4>
              <div className="site-hf-navbar" aria-label="Header navigation preview">
                <div className="site-hf-navbar-left">
                  {settings.navigation
                    .filter((item) => item.included)
                    .map((item) => (
                      <span key={item.id} className="site-hf-navbar-link">
                        {item.name || "Link"}
                      </span>
                    ))}
                  {settings.navigation.every((item) => !item.included) ? (
                    <span className="site-hf-navbar-empty">No links included yet</span>
                  ) : null}
                </div>
                <div className="site-hf-navbar-brand">
                  {settings.headerLogo?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={settings.headerLogo.url}
                      alt=""
                      className="site-hf-navbar-logo"
                    />
                  ) : (
                    <span className="site-hf-navbar-brand-fallback">
                      {settings.headerLogo?.name || "Your logo"}
                    </span>
                  )}
                </div>
                <div className="site-hf-navbar-right">
                  <span className="site-hf-navbar-link">Login</span>
                </div>
              </div>
              <p className="form-helper-text site-hf-preview-hint">
                Preview only — edit logo and links below to update what appears in the bar.
              </p>
            </div>

            <div className="site-hf-block">
              <div className="site-hf-preview-logo-col">
                <h4 className="input-heading">Header logo</h4>
                <LogoDropZone
                  id="header-logo-upload"
                  label="Header logo"
                  value={settings.headerLogo}
                  error={logoErrors.header}
                  onUpload={(file) => {
                    void handleLogoUpload("header", file);
                  }}
                />
              </div>
            </div>

            <div className="site-hf-block">
              <div className="site-hf-nav-header">
                <h4 className="input-heading mb-0">Main navigation</h4>
                <button
                  type="button"
                  onClick={() => setIsNavigationModalOpen(true)}
                  className="page-primary-button-action"
                >
                  <span aria-hidden="true">+</span>
                  Add navigation item
                </button>
              </div>

              <div className="site-hf-nav-list" role="list">
                {settings.navigation.map((item) => (
                  <div
                    key={item.id}
                    role="listitem"
                    onDragOver={(event: DragEvent<HTMLDivElement>) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      if (dragOverNavId !== item.id) setDragOverNavId(item.id);
                    }}
                    onDragLeave={() => {
                      if (dragOverNavId === item.id) setDragOverNavId(null);
                    }}
                    onDrop={(event: DragEvent<HTMLDivElement>) => {
                      event.preventDefault();
                      const fromId = event.dataTransfer.getData("text/plain") || draggingNavId;
                      if (fromId) reorderNavigation(fromId, item.id);
                      setDraggingNavId(null);
                      setDragOverNavId(null);
                    }}
                    className={[
                      "site-hf-nav-row",
                      draggingNavId === item.id ? "is-dragging" : "",
                      dragOverNavId === item.id ? "is-drag-over" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <button
                      type="button"
                      className="site-hf-drag"
                      title="Drag to reorder"
                      aria-label={`Drag to reorder ${item.name || "navigation item"}`}
                      draggable
                      onDragStart={(event: DragEvent<HTMLButtonElement>) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", item.id);
                        setDraggingNavId(item.id);
                      }}
                      onDragEnd={() => {
                        setDraggingNavId(null);
                        setDragOverNavId(null);
                      }}
                    >
                      ⠿
                    </button>
                    <span className="site-hf-nav-check">
                      <CheckControl
                        label={`Include ${item.name || "navigation item"}`}
                        checked={item.included}
                        onChange={() => updateNavigation(item.id, "included", !item.included)}
                      />
                    </span>
                    <InputField
                      aria-label={`${item.name || "Navigation item"} link name`}
                      labelClassName="input-heading"
                      value={item.name}
                      onChange={(event) => updateNavigation(item.id, "name", event.target.value)}
                      placeholder="Link name"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {showFooter ? (
          <section className={section === "all" ? "site-hf-footer" : "site-hf-section"}>
            {section === "all" ? (
              <SectionHeading
                title="Footer Configuration"
                description="Set up your website footer with links, contact information and social media."
              />
            ) : null}

            <div className="site-hf-block site-hf-block--first">
              <h4 className="input-heading">Footer preview</h4>
              <div className="site-hf-footer-preview" aria-label="Footer preview">
                <div className="site-hf-footer-preview-grid">
                  <div className="site-hf-footer-preview-col site-hf-footer-preview-brand">
                    {settings.footerLogo?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={settings.footerLogo.url}
                        alt=""
                        className="site-hf-footer-preview-logo"
                      />
                    ) : (
                      <span className="site-hf-footer-preview-logo-fallback">
                        {settings.footerLogo?.name || "Your logo"}
                      </span>
                    )}
                    <ul className="site-hf-footer-preview-list">
                      {settings.exploreLinks
                        .filter((link) => link.included)
                        .map((link) => (
                          <li key={link.id}>{link.label}</li>
                        ))}
                      {settings.exploreLinks.every((link) => !link.included) ? (
                        <li className="site-hf-footer-preview-empty">No links included</li>
                      ) : null}
                    </ul>
                  </div>

                  <div className="site-hf-footer-preview-col">
                    <p className="site-hf-footer-preview-heading">
                      {settings.socialTitle.trim() || "Social media"}
                    </p>
                    <ul className="site-hf-footer-preview-list">
                      {settings.socialLinks
                        .filter((link) => link.value.trim())
                        .map((link) => (
                          <li key={link.id}>{link.label}</li>
                        ))}
                      {settings.socialLinks.every((link) => !link.value.trim())
                        ? settings.socialLinks.map((link) => (
                            <li key={link.id} className="site-hf-footer-preview-muted">
                              {link.label}
                            </li>
                          ))
                        : null}
                    </ul>
                  </div>

                  <div className="site-hf-footer-preview-col">
                    <p className="site-hf-footer-preview-heading">
                      {settings.contactTitle.trim() || "Contact us"}
                    </p>
                    <ul className="site-hf-footer-preview-list site-hf-footer-preview-contact">
                      <li>
                        <span className="site-hf-footer-preview-icon" aria-hidden="true">
                          ☎
                        </span>
                        {settings.phoneNumber.trim() || "Add phone number"}
                      </li>
                      <li>
                        <span className="site-hf-footer-preview-icon" aria-hidden="true">
                          ✉
                        </span>
                        {settings.email.trim() || "Add email"}
                      </li>
                      <li>
                        <span className="site-hf-footer-preview-icon" aria-hidden="true">
                          ⌖
                        </span>
                        {settings.address.trim() || "Add address"}
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="site-hf-footer-preview-bottom">
                  <p>© {new Date().getFullYear()} All Rights Reserved | powered by yourlist</p>
                  <p className="site-hf-footer-preview-terms">Terms of Use</p>
                </div>
              </div>
              <p className="form-helper-text site-hf-preview-hint">
                Preview only — edit the sections below to update what appears here.
              </p>
            </div>

            <div className="site-hf-block site-hf-footer-editor">
              <div className="site-hf-footer-editor-logo">
                <h4 className="input-heading">Footer logo</h4>
                <LogoDropZone
                  id="footer-logo-upload"
                  label="Footer logo"
                  value={settings.footerLogo}
                  error={logoErrors.footer}
                  onUpload={(file) => {
                    void handleLogoUpload("footer", file);
                  }}
                />
              </div>

              <div className="site-hf-cards">
                <FooterCard title="Footer links">
                  <div className="site-hf-card-links">
                    {settings.exploreLinks.map((link) => (
                      <label key={link.id} className="site-hf-link-row">
                        <CheckControl
                          label={`Show ${link.label} footer link`}
                          checked={link.included}
                          onChange={() => updateFooterLink(link.id, !link.included)}
                        />
                        <span>{link.label}</span>
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
                    placeholder="Social media"
                  />
                  <div className="site-hf-social-fields">
                    {settings.socialLinks.map((link) => (
                      <InputField
                        key={link.id}
                        id={`social-${link.id}`}
                        type="url"
                        label={link.label}
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
                    placeholder="Contact us"
                  />
                  <div className="site-hf-social-fields site-hf-contact-fields">
                    <InputField
                      id="footer-phone"
                      label="Phone number"
                      labelClassName="input-heading"
                      type="text"
                      inputMode="tel"
                      value={settings.phoneNumber}
                      onChange={(event) => updateSetting("phoneNumber", event.target.value)}
                      placeholder="e.g. +44 1234 567890"
                    />
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
            </div>
          </section>
        ) : null}

        <div className="site-form-actions">
          {notice ? (
            <p role="status" className="site-notice">
              {notice}
            </p>
          ) : null}
          <button
            type="button"
            onClick={cancelChanges}
            disabled={isSaving || Boolean(uploadingLogo)}
            className="form-footer-btn form-footer-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || Boolean(uploadingLogo)}
            className="form-footer-btn form-footer-btn-primary"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>

      {isNavigationModalOpen ? (
        <AddNavigationModal
          open
          onClose={() => setIsNavigationModalOpen(false)}
          onSave={addNavigationItem}
        />
      ) : null}
    </div>
  );
}
