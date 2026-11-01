"use client";

import { Button } from "@/components/ui/Button";
import { SITE_SETUP_STEPS } from "../siteTypes";

type SiteEmptyStateProps = {
  onSetup: () => void;
};

export function SiteEmptyState({ onSetup }: SiteEmptyStateProps) {
  return (
    <section aria-label="Microsite empty state" className="site-create-empty">
      <div className="site-create-empty-icon" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
          <rect x="4" y="7" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 12h24M12 7v18" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </div>

      <h1 className="page-title site-create-empty-title">No clubsite yet</h1>
      <p className="page-subtitle site-create-empty-copy">
        Set up your clubsite first — domain, branding, hero, and content.
        You can add white label sites later with the same process.
      </p>

      <ol className="site-create-empty-steps" aria-label="Setup journey">
        {SITE_SETUP_STEPS.map((step, index) => (
          <li key={step.key} className="site-create-empty-step">
            <span className="site-create-empty-step-index" aria-hidden="true">
              {index + 1}
            </span>
            <span className="site-create-empty-step-label">{step.label}</span>
          </li>
        ))}
      </ol>

      <div className="site-create-empty-action">
        <Button type="button" onClick={onSetup} className="page-primary-button-action">
          Setup your site.
        </Button>
      </div>
    </section>
  );
}
