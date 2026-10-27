"use client";

import type { Ref } from "react";

export type FormSectionTab = {
  id: string;
  label: string;
};

type FormSectionTabsProps = {
  tabs: FormSectionTab[];
  activeTabId: string;
  ariaLabel: string;
  onTabSelect: (tabId: string) => void;
  /**
   * `button` — in-page scroll / state (Venue form).
   * `anchor` — hash links + state (Event form).
   */
  mode?: "button" | "anchor";
  /** When true, nav uses role="tablist" and items use role="tab". */
  asTablist?: boolean;
  /** Optional ref for sticky bar height (scroll offset). */
  barRef?: Ref<HTMLDivElement>;
  className?: string;
};

/**
 * Shared organiser form / detail section nav.
 * Markup + classes must stay identical across Venue, Event, and similar screens.
 */
export function FormSectionTabs({
  tabs,
  activeTabId,
  ariaLabel,
  onTabSelect,
  mode = "button",
  asTablist = false,
  barRef,
  className = "",
}: FormSectionTabsProps) {
  return (
    <div ref={barRef} className={`form-tabs-bar ${className}`.trim()}>
      <nav
        aria-label={ariaLabel}
        className="form-tabs-nav"
        role={asTablist ? "tablist" : undefined}
      >
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          const tabClassName = ["form-tab", isActive ? "form-tab-active" : ""]
            .filter(Boolean)
            .join(" ");

          if (mode === "anchor") {
            return (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                className={tabClassName}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onTabSelect(tab.id)}
              >
                {tab.label}
              </a>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              id={asTablist ? `form-tab-${tab.id}` : undefined}
              role={asTablist ? "tab" : undefined}
              aria-selected={asTablist ? isActive : undefined}
              className={tabClassName}
              aria-current={!asTablist && isActive ? "true" : undefined}
              onClick={() => onTabSelect(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
