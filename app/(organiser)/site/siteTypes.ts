import type { SiteDnsRecord } from "@/apis/organisation/siteApi";

export const SITE_SECTIONS = [
  "Domain",
  "Branding",
  "Hero Section",
  "About Us",
  "Events",
  "News",
  "Contact",
] as const;

export type SiteSection = (typeof SITE_SECTIONS)[number];

/** All organiser sites are the same microsite product. */
export type SiteKind = "microsite";

export type SiteMediaAsset = {
  path: string;
  url: string;
  name?: string;
};

/** Fixed navigation shape stored on `sites.navigation` (matches API). */
export type SiteNavItem = {
  name: string;
  redirect_link: string;
};

export type SiteFooterLink = {
  id: string;
  label: string;
  included: boolean;
};

export type SiteSocialLink = {
  id: string;
  label: string;
  value: string;
};

export type SiteHeaderConfig = {
  logo: SiteMediaAsset | null;
  navigation: SiteNavItem[];
  search_enabled: boolean;
  account_enabled: boolean;
};

export type SiteFooterConfig = {
  logo: SiteMediaAsset | null;
  explore_title: string;
  explore_links: SiteFooterLink[];
  social_title: string;
  social_links: SiteSocialLink[];
  contact_title: string;
  phone: string;
  email: string;
  address: string;
};

export type SiteRecord = {
  id: string;
  name: string;
  kind: SiteKind;
  createdAt: string;
  updatedAt: string;
  status: string;
  domainHostname: string | null;
  domainStatus: string | null;
  dnsRecords: SiteDnsRecord[];
  logo: SiteMediaAsset | null;
  navigation: SiteNavItem[];
  favicon: SiteMediaAsset | null;
  header: SiteHeaderConfig | null;
  footer: SiteFooterConfig | null;
  brandingComplete: boolean;
};

export type SitesStore = {
  version: 1;
  sites: SiteRecord[];
  activeSiteId: string | null;
};

export const SITE_SETUP_STEPS = [
  { key: "domain", label: "Domain" },
  { key: "branding", label: "Branding" },
  { key: "hero", label: "Hero" },
  { key: "content", label: "Content" },
  { key: "publish", label: "Publish" },
] as const;
