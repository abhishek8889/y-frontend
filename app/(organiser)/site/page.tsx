"use client";

import { useEffect, useState, type FormEvent } from "react";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";
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
    <section
      aria-label="Site empty state"
      className="flex min-h-[min(70vh,620px)] flex-col items-center justify-center px-6 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-[8px] border border-black/40 bg-black/[0.03]">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-8 w-8 text-black">
          <rect x="4" y="7" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 12h24M12 7v18" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </div>
      <h1 className="mt-5 text-[28px] font-black uppercase leading-7 text-black">No site yet</h1>
      <p className="mt-2 max-w-[420px] text-[14px] leading-5 text-[#6F6E69]">
        Create your branded site to manage domain, branding, hero, events, news, and contact pages.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex h-[44px] items-center gap-2 rounded-[3px] border border-black bg-black px-5 text-[13px] uppercase text-white transition hover:bg-white hover:text-black"
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
          <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Create New Site
      </button>
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

  if (!open) return null;

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-site-title"
        className="w-full max-w-[520px] border border-black/70 bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-black/60 px-5 py-4">
          <div>
            <h2 id="create-site-title" className="text-[18px] font-black uppercase leading-6">
              Create New Site
            </h2>
            <p className="mt-1 text-[13px] text-[#777]">Name your site, then set up each section.</p>
          </div>
          <button
            type="button"
            aria-label="Close create site"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-[22px] leading-none hover:bg-black/5"
          >
            ×
          </button>
        </header>
        <form onSubmit={submit} className="space-y-5 px-5 py-5">
          <InputField
            id="site-name"
            label="Site name *"
            labelClassName="!text-[14px] !mb-[6px]"
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            placeholder="e.g. Hednesford Town"
            density="compact"
            containerClassName="!h-[42px] !rounded-[3px] !border-black/65 focus-within:!ring-0"
            className="!px-3 !text-[14px] normal-case"
          />
          {error ? (
            <p role="alert" className="text-[12px] text-red-600">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-[40px] min-w-[96px] rounded-[3px] border border-black/70 px-4 text-[12px] uppercase hover:bg-black hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-[40px] min-w-[112px] rounded-[3px] border border-black bg-black px-4 text-[12px] uppercase text-white hover:bg-white hover:text-black"
            >
              Create Site
            </button>
          </div>
        </form>
      </section>
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
      <DashboardShell header={<DashboardHeader userName="MARVIN" />} sidebar={<DashboardSidebar />}>
        <main className="flex min-h-full items-center justify-center bg-white text-[13px] text-[#777]">
          Loading site…
        </main>
      </DashboardShell>
    );
  }

  if (!site) {
    return (
      <DashboardShell header={<DashboardHeader userName="MARVIN" />} sidebar={<DashboardSidebar />}>
        <main className="min-h-full bg-white">
          <SiteEmptyState onCreate={() => setCreateOpen(true)} />
          <CreateSiteDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={createSite} />
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell header={<DashboardHeader userName="MARVIN" />} sidebar={<DashboardSidebar />}>
      <main className="flex min-h-full bg-white">
        <aside className="hidden w-[210px] shrink-0 border-r border-black/60 bg-white md:block" aria-label="Site sections">
          <nav className="flex flex-col gap-1 px-4 py-5">
            {siteSections.map((section) => (
              <button
                key={section}
                type="button"
                aria-current={activeSection === section ? "page" : undefined}
                onClick={() => selectSection(section)}
                className={[
                  "h-[36px] cursor-pointer rounded-[3px] px-2 text-left text-[16px] transition",
                  activeSection === section
                    ? "border border-black/70 bg-white text-black"
                    : "text-black/85 hover:bg-black/5",
                ].join(" ")}
              >
                {section}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/60 px-5 py-3 md:px-5">
            <div>
              <h1 className="text-[26px] font-black uppercase leading-6 text-black">Your Site</h1>
              <p className="mt-1 text-[14px] text-[#6F6E69]">{site.name}</p>
            </div>
            {isBrandingTab ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="inline-flex h-[36px] items-center border border-black/50 px-3 text-[10px]">
                  <span className="font-bold uppercase">Status</span>
                  <span className="mx-3 h-5 border-l border-black/20" />
                  <span className="mr-2 h-2 w-2 rounded-full bg-[#2dbb5a]" />
                  <span className="leading-tight">
                    Connectivity Secured
                    <br />
                    <span className="text-[9px] text-[#777]">Global nameservers verified</span>
                  </span>
                  <span className="ml-3 font-bold text-[#138a3d]">● ACTIVE</span>
                </div>
                <button
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
                  className="h-[34px] border border-black/70 bg-white px-3 text-[10px] uppercase hover:bg-black hover:text-white"
                >
                  View DNS
                </button>
                <button
                  type="button"
                  onClick={() => setPageNotice("Connect a domain before previewing the site.")}
                  className="h-[34px] border border-black bg-black px-3 text-[10px] uppercase text-white hover:bg-white hover:text-black"
                >
                  Preview website
                </button>
              </div>
            ) : (
              <div className="inline-flex h-[36px] items-center border border-black/50 px-3 text-[10px]">
                <span className="font-bold uppercase">Status</span>
                <span className="mx-3 h-5 border-l border-black/20" />
                <span className={`mr-2 h-2 w-2 rounded-full ${connectedDomain ? "bg-[#e7a600]" : "bg-[#f04444]"}`} />
                <span>{connectedDomain ? "Domain setup pending" : "Website not live"}</span>
              </div>
            )}
          </header>

          <section
            className="min-w-0 flex-1 p-[24px]"
            aria-label={
              activeSection === "News"
                ? "Site news"
                : activeSection === "Contact"
                  ? "Site contact page"
                  : `Site ${activeSection}`
            }
          >
            <div className="mb-4 block md:hidden">
              <SelectField
                id="site-section-select"
                aria-label="Site section"
                value={activeSection}
                onChange={(event) => selectSection(event.target.value as SiteSection)}
                density="compact"
                containerClassName="!h-9"
                className="!rounded-[3px] !border-black/60 !px-2 !text-[12px]"
                options={siteSections.map((section) => ({ value: section, label: section }))}
              />
            </div>

            {pageNotice ? (
              <p role="status" className="mt-3 text-[11px] text-[#666]">
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
      </main>
    </DashboardShell>
  );
}
