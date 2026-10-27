"use client";

import { useEffect, useState, type FormEvent } from "react";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";
import { OrganiserModal } from "@/components/organiser/OrganiserModal";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import AboutUsTab from "./tabs/AboutUsTab";
import ContactUsTab from "./tabs/ContactUsTab";
import DomainTab from "./tabs/DomainTab";
import EventsTab from "./tabs/EventsTab";
import HeaderFooterTab from "./tabs/HeaderFooterTab";
import HeroSectionTab from "./tabs/HeroSectionTab";
import MainAssetsTab from "./tabs/MainAssetsTab";
import NewsTab from "./tabs/NewsTab";

const SITE_STORAGE_KEY = "yourlist_organiser_site";

const siteSections = [
  "Domain",
  "Main Assets",
  "Hero Section",
  "About Us",
  "Events",
  "News",
  "Contact",
  "Header & Footer",
] as const;

type SiteSection = (typeof siteSections)[number];

type SiteRecord = {
  id: string;
  name: string;
  createdAt: string;
};

function readStoredSite(): SiteRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SITE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SiteRecord;
    if (!parsed?.id || !parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredSite(site: SiteRecord | null) {
  if (typeof window === "undefined") return;
  if (site === null) {
    window.localStorage.removeItem(SITE_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(site));
}

function SiteEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <section aria-label="Site empty state" className="site-create-empty">
      <div className="site-create-empty-icon">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" width="32" height="32">
          <rect x="4" y="7" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 12h24M12 7v18" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </div>
      <h1 className="site-create-empty-title">No site yet</h1>
      <p className="site-create-empty-copy">
        Create your branded site to manage domain, branding, hero, events, news, and contact pages.
      </p>
      <div className="site-create-empty-action">
        <Button type="button" onClick={onCreate} className="page-primary-button-action">
          <span aria-hidden className="text-[18px] leading-none">
            +
          </span>
          Create New Site
        </Button>
      </div>
    </section>
  );
}

function CreateSiteDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setError("");
  }, [open]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Enter a site name with at least 2 characters.");
      return;
    }
    onCreate(trimmed);
  }

  return (
    <OrganiserModal
      open={open}
      onClose={onClose}
      showClose
      titleId="create-site-title"
      panelClassName="max-w-[520px]"
    >
      <div className="site-create-modal">
        <header className="site-create-modal-header">
          <div>
            <h2 id="create-site-title" className="site-create-modal-title">
              Create New Site
            </h2>
            <p className="site-create-modal-subtitle">
              Name your site, then set up each section.
            </p>
          </div>
        </header>
        <form onSubmit={submit} className="site-create-modal-body">
          <InputField
            id="site-name"
            label="Site name *"
            labelClassName="input-heading"
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            placeholder="e.g. Hednesford Town"
          />
          {error ? (
            <p role="alert" className="site-error">
              {error}
            </p>
          ) : null}
          <div className="site-create-modal-footer">
            <Button type="button" onClick={onClose} className="form-footer-btn form-footer-btn-secondary">
              Cancel
            </Button>
            <Button type="submit" className="form-footer-btn form-footer-btn-primary">
              Create Site
            </Button>
          </div>
        </form>
      </div>
    </OrganiserModal>
  );
}

function ConnectivityStatus({
  connectedDomain,
  detailed,
}: {
  connectedDomain: string;
  detailed?: boolean;
}) {
  if (detailed) {
    return (
      <div className="site-connectivity">
        <span className="site-connectivity-label">Status</span>
        <span className="site-connectivity-divider" />
        <span className="site-status-dot site-status-dot-ok" aria-hidden="true" />
        <span className="site-connectivity-copy">
          Connectivity Secured
          <br />
          <span className="site-connectivity-note">Global nameservers verified</span>
        </span>
        <span className="site-connectivity-active">● ACTIVE</span>
      </div>
    );
  }

  return (
    <div className="site-connectivity">
      <span className="site-connectivity-label">Status</span>
      <span className="site-connectivity-divider" />
      <span
        className={`site-status-dot ${
          connectedDomain ? "site-status-dot-warn" : "site-status-dot-bad"
        }`}
        aria-hidden="true"
      />
      <span>{connectedDomain ? "Domain setup pending" : "Website not live"}</span>
    </div>
  );
}

export default function SitePage() {
  const [ready, setReady] = useState(false);
  const [site, setSite] = useState<SiteRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SiteSection>("Domain");
  const [connectedDomain, setConnectedDomain] = useState("");
  const [domainNotice, setDomainNotice] = useState("");
  const [pageNotice, setPageNotice] = useState("");

  useEffect(() => {
    setSite(readStoredSite());
    setReady(true);
  }, []);

  const isBrandingTab = activeSection === "Main Assets" || activeSection === "Hero Section";

  function selectSection(section: SiteSection) {
    setActiveSection(section);
    setDomainNotice("");
    setPageNotice("");
  }

  function createSite(name: string) {
    const next: SiteRecord = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
    };
    writeStoredSite(next);
    setSite(next);
    setCreateOpen(false);
    setActiveSection("Domain");
  }

  if (!ready) {
    return (
      <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
        <div className="site-loading">Loading site…</div>
      </DashboardShell>
    );
  }

  if (!site) {
    return (
      <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
        <div className="page-content">
          <SiteEmptyState onCreate={() => setCreateOpen(true)} />
          <CreateSiteDialog
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onCreate={createSite}
          />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell header={<DashboardHeader />} sidebar={<DashboardSidebar />}>
      <div className="site-workspace">
        <aside className="site-sidebar" aria-label="Site sections">
          <nav className="site-sidebar-nav">
            {siteSections.map((section) => (
              <button
                key={section}
                type="button"
                aria-current={activeSection === section ? "page" : undefined}
                onClick={() => selectSection(section)}
                className={[
                  "site-sidebar-item",
                  activeSection === section ? "site-tab-active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {section}
              </button>
            ))}
          </nav>
        </aside>

        <div className="site-main">
          <header className="site-toolbar">
            <div>
              <h1 className="site-toolbar-title">Your Site</h1>
              <p className="site-toolbar-subtitle">{site.name}</p>
            </div>
            {isBrandingTab ? (
              <div className="site-toolbar-actions">
                <ConnectivityStatus connectedDomain={connectedDomain} detailed />
                <Button
                  type="button"
                  onClick={() => {
                    setActiveSection("Domain");
                    setDomainNotice(
                      connectedDomain
                        ? `DNS configuration for ${connectedDomain}.`
                        : "Connect a domain to view DNS records.",
                    );
                    setPageNotice("");
                  }}
                  className="page-secondary-button"
                >
                  View DNS
                </Button>
                <Button
                  type="button"
                  onClick={() => setPageNotice("Connect a domain before previewing the site.")}
                  className="page-primary-button-action"
                >
                  Preview website
                </Button>
              </div>
            ) : (
              <ConnectivityStatus connectedDomain={connectedDomain} />
            )}
          </header>

          <section
            className="site-panel"
            aria-label={
              activeSection === "News"
                ? "Site news"
                : activeSection === "Contact"
                  ? "Site contact page"
                  : `Site ${activeSection}`
            }
          >
            <div className="site-mobile-nav">
              <SelectField
                id="site-section-select"
                aria-label="Site section"
                labelClassName="input-heading"
                value={activeSection}
                onChange={(event) => selectSection(event.target.value as SiteSection)}
                options={siteSections.map((section) => ({ value: section, label: section }))}
              />
            </div>

            {pageNotice ? (
              <p role="status" className="site-notice">
                {pageNotice}
              </p>
            ) : null}

            <div hidden={activeSection !== "Domain"}>
              <DomainTab
                connectedDomain={connectedDomain}
                onConnected={setConnectedDomain}
                notice={domainNotice}
              />
            </div>
            <div hidden={activeSection !== "Main Assets"}>
              <MainAssetsTab />
            </div>
            <div hidden={activeSection !== "Hero Section"}>
              <HeroSectionTab />
            </div>
            <div hidden={activeSection !== "About Us"}>
              <AboutUsTab />
            </div>
            <div hidden={activeSection !== "Events"}>
              <EventsTab />
            </div>
            <div hidden={activeSection !== "News"}>
              <NewsTab />
            </div>
            <div hidden={activeSection !== "Contact"}>
              <ContactUsTab />
            </div>
            <div hidden={activeSection !== "Header & Footer"}>
              <HeaderFooterTab />
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
