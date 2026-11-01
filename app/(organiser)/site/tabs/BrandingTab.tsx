"use client";

import { useState, type ReactNode } from "react";
import type { SiteRecord } from "../siteTypes";
import HeaderFooterTab from "./HeaderFooterTab";
import MainAssetsTab from "./MainAssetsTab";

type BrandingPanel = "assets" | "header" | "footer";

const PANELS: { id: BrandingPanel; title: string; description: string }[] = [
  {
    id: "assets",
    title: "Logo & favicon",
    description: "Official logo and favicon for your clubsite.",
  },
  {
    id: "header",
    title: "Header",
    description: "Header logo and main navigation.",
  },
  {
    id: "footer",
    title: "Footer",
    description: "Links, contact details, and social handles.",
  },
];

function AccordionChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      width="16"
      height="16"
      className={open ? "site-branding-chevron site-branding-chevron--open" : "site-branding-chevron"}
    >
      <path
        d="M4 6.5 8 10.5 12 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BrandingAccordion({
  id,
  title,
  description,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const panelId = `branding-panel-${id}`;
  const buttonId = `branding-trigger-${id}`;

  return (
    <section className={open ? "site-branding-accordion is-open" : "site-branding-accordion"}>
      <h3 className="site-branding-accordion-heading">
        <button
          type="button"
          id={buttonId}
          className="site-branding-accordion-trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="site-branding-accordion-copy">
            <span className="site-branding-accordion-title">{title}</span>
            <span className="site-branding-accordion-desc">{description}</span>
          </span>
          <AccordionChevron open={open} />
        </button>
      </h3>
      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="site-branding-accordion-panel"
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}

export default function BrandingTab({ site }: { site: SiteRecord }) {
  const [openPanel, setOpenPanel] = useState<BrandingPanel>("assets");

  function toggle(panel: BrandingPanel) {
    setOpenPanel((current) => (current === panel ? current : panel));
  }

  return (
    <div className="site-tab site-branding-tab">
      {PANELS.map((panel) => (
        <BrandingAccordion
          key={panel.id}
          id={panel.id}
          title={panel.title}
          description={panel.description}
          open={openPanel === panel.id}
          onToggle={() => toggle(panel.id)}
        >
          {panel.id === "assets" ? <MainAssetsTab site={site} /> : null}
          {panel.id === "header" ? <HeaderFooterTab site={site} section="header" /> : null}
          {panel.id === "footer" ? <HeaderFooterTab site={site} section="footer" /> : null}
        </BrandingAccordion>
      ))}
    </div>
  );
}
