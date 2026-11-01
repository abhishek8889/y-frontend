import type {
  OrganisationSite,
  OrganisationSiteMedia,
  SiteDnsRecord,
} from "@/apis/organisation/siteApi";
import type {
  SiteFooterConfig,
  SiteFooterLink,
  SiteHeaderConfig,
  SiteKind,
  SiteMediaAsset,
  SiteNavItem,
  SiteRecord,
  SiteSocialLink,
} from "./siteTypes";

const DEFAULT_NAV: SiteNavItem[] = [
  { id: "home", name: "Home", url: "/", priority: "1", included: true },
  { id: "about", name: "About", url: "/about", priority: "2", included: true },
  { id: "events", name: "Events", url: "/events", priority: "3", included: true },
  { id: "news", name: "News", url: "/news", priority: "4", included: true },
];

const DEFAULT_EXPLORE: SiteFooterLink[] = [
  { id: "about", label: "About", included: true },
  { id: "events", label: "Events", included: true },
  { id: "news", label: "News", included: true },
  { id: "tickets", label: "My Tickets", included: true },
];

const DEFAULT_SOCIAL: SiteSocialLink[] = [
  { id: "facebook", label: "Facebook", value: "" },
  { id: "instagram", label: "Instagram", value: "" },
  { id: "tiktok", label: "TikTok", value: "" },
  { id: "youtube", label: "YouTube", value: "" },
];

export function mediaFromField(value: OrganisationSiteMedia | undefined): SiteMediaAsset | null {
  if (!value) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    return { path: trimmed, url: trimmed };
  }
  const path = typeof value.path === "string" ? value.path.trim() : "";
  if (!path) return null;
  const url =
    typeof value.url === "string" && value.url.trim() ? value.url.trim() : path;
  const name = typeof value.name === "string" && value.name.trim() ? value.name.trim() : undefined;
  return { path, url, name };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function mapNavigation(raw: unknown): SiteNavItem[] {
  if (!Array.isArray(raw) || !raw.length) return DEFAULT_NAV.map((item) => ({ ...item }));
  return raw.map((item, index) => {
    const row = asRecord(item) ?? {};
    return {
      id: typeof row.id === "string" && row.id ? row.id : `nav-${index}`,
      name: typeof row.name === "string" ? row.name : "",
      url: typeof row.url === "string" ? row.url : "/",
      priority:
        typeof row.priority === "string" || typeof row.priority === "number"
          ? String(row.priority)
          : String(index + 1),
      included: row.included !== false,
    };
  });
}

function mapExploreLinks(raw: unknown): SiteFooterLink[] {
  if (!Array.isArray(raw) || !raw.length) return DEFAULT_EXPLORE.map((item) => ({ ...item }));
  return raw.map((item, index) => {
    const row = asRecord(item) ?? {};
    return {
      id: typeof row.id === "string" && row.id ? row.id : `link-${index}`,
      label: typeof row.label === "string" ? row.label : "Link",
      included: row.included !== false,
    };
  });
}

function mapSocialLinks(raw: unknown): SiteSocialLink[] {
  if (!Array.isArray(raw) || !raw.length) return DEFAULT_SOCIAL.map((item) => ({ ...item }));
  return raw.map((item, index) => {
    const row = asRecord(item) ?? {};
    return {
      id: typeof row.id === "string" && row.id ? row.id : `social-${index}`,
      label: typeof row.label === "string" ? row.label : "Social",
      value: typeof row.value === "string" ? row.value : "",
    };
  });
}

export function mapSiteHeader(raw: unknown): SiteHeaderConfig | null {
  const data = asRecord(raw);
  if (!data) return null;
  return {
    logo: mediaFromField((data.logo as OrganisationSiteMedia) ?? null),
    navigation: mapNavigation(data.navigation),
    search_enabled: data.search_enabled !== false,
    account_enabled: data.account_enabled !== false,
  };
}

export function mapSiteFooter(raw: unknown): SiteFooterConfig | null {
  const data = asRecord(raw);
  if (!data) return null;
  return {
    logo: mediaFromField((data.logo as OrganisationSiteMedia) ?? null),
    explore_title: typeof data.explore_title === "string" ? data.explore_title : "",
    explore_links: mapExploreLinks(data.explore_links),
    social_title: typeof data.social_title === "string" ? data.social_title : "",
    social_links: mapSocialLinks(data.social_links),
    contact_title: typeof data.contact_title === "string" ? data.contact_title : "",
    phone: typeof data.phone === "string" ? data.phone : "",
    email: typeof data.email === "string" ? data.email : "",
    address: typeof data.address === "string" ? data.address : "",
  };
}

export function defaultHeaderConfig(): SiteHeaderConfig {
  return {
    logo: null,
    navigation: DEFAULT_NAV.map((item) => ({ ...item })),
    search_enabled: true,
    account_enabled: true,
  };
}

export function defaultFooterConfig(): SiteFooterConfig {
  return {
    logo: null,
    explore_title: "",
    explore_links: DEFAULT_EXPLORE.map((item) => ({ ...item })),
    social_title: "",
    social_links: DEFAULT_SOCIAL.map((item) => ({ ...item })),
    contact_title: "",
    phone: "",
    email: "",
    address: "",
  };
}

export function headerToPayload(header: SiteHeaderConfig): Record<string, unknown> {
  return {
    logo: header.logo?.path ?? null,
    navigation: header.navigation.map((item) => ({
      id: item.id,
      name: item.name,
      url: item.url,
      priority: item.priority,
      included: item.included,
    })),
    search_enabled: header.search_enabled,
    account_enabled: header.account_enabled,
  };
}

export function footerToPayload(footer: SiteFooterConfig): Record<string, unknown> {
  return {
    logo: footer.logo?.path ?? null,
    explore_title: footer.explore_title,
    explore_links: footer.explore_links.map((item) => ({ ...item })),
    social_title: footer.social_title,
    social_links: footer.social_links.map((item) => ({ ...item })),
    contact_title: footer.contact_title,
    phone: footer.phone,
    email: footer.email,
    address: footer.address,
  };
}

export function isSiteBrandingComplete(site: SiteRecord): boolean {
  if (site.brandingComplete) return true;
  return Boolean(site.logo?.path && site.favicon?.path && site.header && site.footer);
}

export function resolveSiteKind(site: OrganisationSite, index: number): SiteKind {
  const raw = (site.kind ?? site.type ?? site.site_type ?? "").toString().toLowerCase();
  if (raw === "whitelabel" || raw === "white_label" || raw === "wl" || raw === "brand") {
    return "whitelabel";
  }
  if (raw === "main" || raw === "club") return "main";
  return index === 0 ? "main" : "whitelabel";
}

function domainFromSite(site: OrganisationSite): {
  hostname: string | null;
  status: string | null;
  dnsRecords: SiteDnsRecord[];
} {
  const domain = site.domain;
  if (!domain) return { hostname: null, status: null, dnsRecords: [] };
  if (typeof domain === "string") {
    return { hostname: domain.trim() || null, status: null, dnsRecords: [] };
  }
  return {
    hostname: typeof domain.hostname === "string" && domain.hostname.trim() ? domain.hostname.trim() : null,
    status: typeof domain.status === "string" ? domain.status : null,
    dnsRecords: Array.isArray(domain.dns_instructions) ? domain.dns_instructions : [],
  };
}

export function mapOrganisationSite(site: OrganisationSite, index: number): SiteRecord {
  const name =
    (typeof site.name === "string" && site.name.trim()) ||
    (typeof site.title === "string" && site.title.trim()) ||
    "Untitled site";
  const createdAt =
    (typeof site.created_at === "string" && site.created_at) ||
    (typeof site.createdAt === "string" && site.createdAt) ||
    new Date().toISOString();
  const updatedAt =
    (typeof site.updated_at === "string" && site.updated_at) ||
    (typeof site.updatedAt === "string" && site.updatedAt) ||
    createdAt;
  const domain = domainFromSite(site);
  const logo = mediaFromField(site.logo);
  const favicon = mediaFromField(site.favicon);
  const header = mapSiteHeader(site.header);
  const footer = mapSiteFooter(site.footer);
  const brandingComplete =
    typeof site.branding_complete === "boolean"
      ? site.branding_complete
      : Boolean(logo?.path && favicon?.path && header && footer);

  return {
    id: String(site.id),
    name,
    kind: resolveSiteKind(site, index),
    createdAt,
    updatedAt,
    status: typeof site.status === "string" && site.status ? site.status : "draft",
    domainHostname: domain.hostname,
    domainStatus: domain.status,
    dnsRecords: domain.dnsRecords,
    logo,
    favicon,
    header,
    footer,
    brandingComplete,
  };
}

/** Combined display helper (filters / overview). DNS pending overrides site lifecycle. */
export function siteDisplayStatus(site: SiteRecord): string {
  const dns = siteDnsStatus(site);
  if (dns === "pending" || dns === "pending_verification" || dns === "failed") {
    return "pending";
  }
  return siteLifecycleStatus(site);
}

/** Domain / DNS verification status only. */
export function siteDnsStatus(site: SiteRecord): string {
  const domainStatus = (site.domainStatus ?? "").toLowerCase();
  if (domainStatus === "pending_dns" || domainStatus === "pending") return "pending";
  if (domainStatus === "pending_verification") return "pending_verification";
  if (domainStatus === "active") return "active";
  if (domainStatus === "verified" || domainStatus === "live") return "verified";
  if (domainStatus === "failed" || domainStatus === "error") return "failed";
  if (!site.domainHostname) return "not_connected";
  return domainStatus || "pending";
}

/** Site record lifecycle status (draft / live), independent of DNS. */
export function siteLifecycleStatus(site: SiteRecord): string {
  const status = (site.status ?? "").toLowerCase();
  if (status === "live" || status === "published" || status === "active") return "live";
  if (status === "draft") return "draft";
  return status || "draft";
}

export function formatDnsStatusLabel(status: string): string {
  if (status === "pending") return "Pending DNS";
  if (status === "pending_verification") return "Pending Verification";
  if (status === "active") return "Active";
  if (status === "verified") return "Verified";
  if (status === "failed") return "Failed";
  if (status === "not_connected") return "Not connected";
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatSiteStatusLabel(status: string): string {
  if (status === "live") return "Live";
  if (status === "draft") return "Draft";
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatSiteUpdatedAt(value: string | null | undefined) {
  if (!value?.trim()) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
