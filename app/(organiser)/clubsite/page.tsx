"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/organiser/DashboardHeader";
import { DashboardShell } from "@/components/organiser/DashboardShell";
import { DashboardSidebar } from "@/components/organiser/DashboardSidebar";
import { SelectField } from "@/components/ui/SelectField";
import AboutUsTab from "./tabs/AboutUsTab";
import ContactUsTab from "./tabs/ContactUsTab";
import DomainTab from "./tabs/DomainTab";
import EventsTab from "./tabs/EventsTab";
import HeaderFooterTab from "./tabs/HeaderFooterTab";
import HeroSectionTab from "./tabs/HeroSectionTab";
import MainAssetsTab from "./tabs/MainAssetsTab";
import NewsTab from "./tabs/NewsTab";
import SeoTab from "./tabs/SeoTab";

const clubsiteSections = [
  "Domain",
  "Main Assets",
  "Hero Section",
  "About Us",
  "Events",
  "News",
  "Contact",
  "Header & Footer",
  "Seo",
] as const;

type ClubsiteSection = (typeof clubsiteSections)[number];

function sectionDescription(section: ClubsiteSection) {
  switch (section) {
    case "Domain":
      return "Configure your domain for your clubsite.";
    case "Main Assets":
    case "Hero Section":
      return "Create your branded platform";
    default:
      return `Manage your clubsite ${section.toLowerCase()} content.`;
  }
}

export default function ClubsitePage() {
  const [activeSection, setActiveSection] = useState<ClubsiteSection>("Domain");
  const [connectedDomain, setConnectedDomain] = useState("");
  const [domainNotice, setDomainNotice] = useState("");
  const [pageNotice, setPageNotice] = useState("");

  const isBrandingTab = activeSection === "Main Assets" || activeSection === "Hero Section";

  function selectSection(section: ClubsiteSection) {
    setActiveSection(section);
    setDomainNotice("");
    setPageNotice("");
  }

  return (
    <DashboardShell header={<DashboardHeader userName="MARVIN" />} sidebar={<DashboardSidebar />}>
      <main className="flex min-h-full bg-white">
        <aside className="hidden w-[210px] shrink-0 border-r border-black/60 bg-white md:block" aria-label="Clubsite sections">
          <nav className="flex flex-col gap-1 px-4 py-5">
            {clubsiteSections.map((section) => (
              <button
                key={section}
                type="button"
                aria-current={activeSection === section ? "page" : undefined}
                onClick={() => selectSection(section)}
                className={[
                  "h-[34px] rounded-[3px] px-2 text-left text-[13px] transition",
                  activeSection === section ? "border border-black/70 bg-white text-black" : "text-black/85 hover:bg-black/5",
                ].join(" ")}
              >
                {section}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-[78px] flex-wrap items-center justify-between gap-4 border-b border-black/60 px-5 py-3 md:px-5">
            <div>
              <h1 className="text-[21px] font-black uppercase leading-6 text-black">Your Clubsite</h1>
              <p className="mt-1 text-[12px] text-[#777]">Create your branded platform</p>
            </div>
            {isBrandingTab ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="hidden h-[36px] min-w-[96px] items-center justify-between border border-black/50 px-3 text-[9px] sm:flex">
                  <span>Traffic<br /><strong className="text-[10px]">2.4k</strong></span>
                  <svg viewBox="0 0 20 16" fill="none" aria-hidden="true" className="h-4 w-5 text-[#138a3d]">
                    <path d="m1 13 6-6 4 3 7-8m-5 0h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="inline-flex h-[36px] items-center border border-black/50 px-3 text-[10px]">
                  <span className="font-bold uppercase">Status</span>
                  <span className="mx-3 h-5 border-l border-black/20" />
                  <span className="mr-2 h-2 w-2 rounded-full bg-[#2dbb5a]" />
                  <span className="leading-tight">Connectivity Secured<br /><span className="text-[9px] text-[#777]">Global nameservers verified</span></span>
                  <span className="ml-3 font-bold text-[#138a3d]">● ACTIVE</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection("Domain");
                    setDomainNotice(connectedDomain
                      ? `DNS configuration for ${connectedDomain}.`
                      : "Connect a domain to view DNS records.");
                    setPageNotice("");
                  }}
                  className="h-[34px] border border-black/70 bg-white px-3 text-[10px] uppercase hover:bg-black hover:text-white"
                >
                  View DNS
                </button>
                <button
                  type="button"
                  onClick={() => setPageNotice("Connect a domain before previewing the clubsite.")}
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
            className="min-w-0 flex-1 px-5 py-4 md:px-5"
            aria-labelledby={activeSection === "News" || activeSection === "Contact" ? undefined : "clubsite-section-title"}
            aria-label={activeSection === "News" ? "Clubsite news" : activeSection === "Contact" ? "Clubsite contact page" : undefined}
          >
            <div className="mb-4 block md:hidden">
              <SelectField
                id="clubsite-section-select"
                aria-label="Clubsite section"
                value={activeSection}
                onChange={(event) => selectSection(event.target.value as ClubsiteSection)}
                density="compact"
                containerClassName="!h-9"
                className="!rounded-[3px] !border-black/60 !px-2 !text-[12px]"
                options={clubsiteSections.map((section) => ({ value: section, label: section }))}
              />
            </div>

            <div hidden={activeSection === "News" || activeSection === "Contact"}>
              <h2 id="clubsite-section-title" className="text-[19px] font-black uppercase leading-6 text-black">
                {activeSection === "Main Assets" ? "Branding" : activeSection === "Hero Section" ? "Set up Clubsite" : activeSection}
              </h2>
              <p className="mt-1 text-[12px] text-[#777]">{sectionDescription(activeSection)}</p>
            </div>

            {pageNotice ? <p role="status" className="mt-3 text-[11px] text-[#666]">{pageNotice}</p> : null}

            <div hidden={activeSection !== "Domain"}>
              <DomainTab
                connectedDomain={connectedDomain}
                onConnected={setConnectedDomain}
                notice={domainNotice}
              />
            </div>
            <div hidden={activeSection !== "Main Assets"}><MainAssetsTab /></div>
            <div hidden={activeSection !== "Hero Section"}><HeroSectionTab /></div>
            <div hidden={activeSection !== "About Us"}><AboutUsTab /></div>
            <div hidden={activeSection !== "Events"}><EventsTab /></div>
            <div hidden={activeSection !== "News"}><NewsTab /></div>
            <div hidden={activeSection !== "Contact"}><ContactUsTab /></div>
            <div hidden={activeSection !== "Header & Footer"}><HeaderFooterTab /></div>
            <div hidden={activeSection !== "Seo"}><SeoTab /></div>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}
