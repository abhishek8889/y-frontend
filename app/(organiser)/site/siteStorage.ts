import { mapSiteFooter, mapSiteHeader } from "./siteMappers";
import type { SiteRecord, SitesStore } from "./siteTypes";

const SITE_STORAGE_KEY = "yourlist_organiser_sites_v2";
const JOURNEY_RESET_FLAG = "yourlist_organiser_sites_journey_reset_v1";
/** Older keys — cleared once so the new empty-state journey can show. */
const LEGACY_KEYS = ["yourlist_organiser_sites_v1", "yourlist_organiser_site"] as const;

function emptyStore(): SitesStore {
  return { version: 1, sites: [], activeSiteId: null };
}

function normalizeSiteRecord(value: unknown): SiteRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<SiteRecord>;
  if (
    typeof record.id !== "string" ||
    typeof record.name !== "string" ||
    !record.name.trim() ||
    (record.kind !== "main" && record.kind !== "whitelabel")
  ) {
    return null;
  }

  const createdAt =
    typeof record.createdAt === "string" && record.createdAt
      ? record.createdAt
      : new Date().toISOString();

  return {
    id: record.id,
    name: record.name.trim(),
    kind: record.kind,
    createdAt,
    updatedAt: typeof record.updatedAt === "string" && record.updatedAt ? record.updatedAt : createdAt,
    status: typeof record.status === "string" && record.status ? record.status : "draft",
    domainHostname: typeof record.domainHostname === "string" ? record.domainHostname : null,
    domainStatus: typeof record.domainStatus === "string" ? record.domainStatus : null,
    dnsRecords: Array.isArray(record.dnsRecords) ? record.dnsRecords : [],
    logo:
      record.logo &&
      typeof record.logo === "object" &&
      typeof record.logo.path === "string" &&
      typeof record.logo.url === "string"
        ? {
            path: record.logo.path,
            url: record.logo.url,
            name: typeof record.logo.name === "string" ? record.logo.name : undefined,
          }
        : null,
    favicon:
      record.favicon &&
      typeof record.favicon === "object" &&
      typeof record.favicon.path === "string" &&
      typeof record.favicon.url === "string"
        ? {
            path: record.favicon.path,
            url: record.favicon.url,
            name: typeof record.favicon.name === "string" ? record.favicon.name : undefined,
          }
        : null,
    header: mapSiteHeader(record.header),
    footer: mapSiteFooter(record.footer),
    brandingComplete: Boolean(record.brandingComplete),
  };
}

/** Drop pre-journey local site drafts once so empty state is visible. */
function ensureJourneyReset() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(JOURNEY_RESET_FLAG) === "1") return;
  for (const key of LEGACY_KEYS) {
    window.localStorage.removeItem(key);
  }
  window.localStorage.removeItem(SITE_STORAGE_KEY);
  window.localStorage.setItem(JOURNEY_RESET_FLAG, "1");
}

export function readSitesStore(): SitesStore {
  if (typeof window === "undefined") return emptyStore();
  ensureJourneyReset();

  try {
    const raw = window.localStorage.getItem(SITE_STORAGE_KEY);
    if (!raw) return emptyStore();

    const parsed = JSON.parse(raw) as Partial<SitesStore>;
    if (!Array.isArray(parsed.sites)) return emptyStore();

    const sites = parsed.sites
      .map(normalizeSiteRecord)
      .filter((site): site is SiteRecord => Boolean(site));
    if (!sites.length) return emptyStore();

    const activeSiteId =
      typeof parsed.activeSiteId === "string" &&
      sites.some((site) => site.id === parsed.activeSiteId)
        ? parsed.activeSiteId
        : sites[0]?.id ?? null;

    return { version: 1, sites, activeSiteId };
  } catch {
    return emptyStore();
  }
}

export function writeSitesStore(store: SitesStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(store));
}

export function clearSitesStore() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SITE_STORAGE_KEY);
}

export function getActiveSite(store: SitesStore): SiteRecord | null {
  if (!store.sites.length) return null;
  if (store.activeSiteId) {
    const active = store.sites.find((site) => site.id === store.activeSiteId);
    if (active) return active;
  }
  return store.sites[0] ?? null;
}

export function getMainSite(store: SitesStore): SiteRecord | null {
  return store.sites.find((site) => site.kind === "main") ?? null;
}

function blankSiteFields(name: string, kind: SiteRecord["kind"]): SiteRecord {
  const createdAt = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    kind,
    createdAt,
    updatedAt: createdAt,
    status: "draft",
    domainHostname: null,
    domainStatus: null,
    dnsRecords: [],
    logo: null,
    favicon: null,
    header: null,
    footer: null,
    brandingComplete: false,
  };
}

export function createMainSite(name: string): SiteRecord {
  return blankSiteFields(name, "main");
}

export function createWhitelabelSite(name: string): SiteRecord {
  return blankSiteFields(name, "whitelabel");
}
