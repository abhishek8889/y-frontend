/** Frontend-only microsite manage draft (localStorage). APIs come later. */

export type FeatureKind = "event" | "news" | "custom";
export type BannerSource = "feature" | "upload";
export type SiteLifecycleLocal = "draft" | "published";
export type ArticleStatus = "draft" | "published";

export type SampleEvent = {
  id: string;
  title: string;
  dateLabel: string;
  venue: string;
  cta: string;
  path: string;
};

/** Built-in pages — redirect links are fixed to the product routes. */
export type SystemNavKey = "events" | "news" | "about";

export type NavItem = {
  id: string;
  name: string;
  redirect_link: string;
  /** When set, redirect link is locked and the row cannot be removed. */
  systemKey?: SystemNavKey;
};

export const SYSTEM_NAV_DEFAULTS: ReadonlyArray<{
  systemKey: SystemNavKey;
  name: string;
  redirect_link: string;
}> = [
  { systemKey: "events", name: "Events", redirect_link: "/events" },
  { systemKey: "news", name: "News", redirect_link: "/news" },
  { systemKey: "about", name: "About us", redirect_link: "/about" },
];

const SYSTEM_LINK_BY_KEY: Record<SystemNavKey, string> = {
  events: "/events",
  news: "/news",
  about: "/about",
};

function normalizePath(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "/";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/+$/, "") || "/";
}

export function systemKeyForRedirect(redirectLink: string): SystemNavKey | undefined {
  const path = normalizePath(redirectLink);
  if (path === "/events") return "events";
  if (path === "/news") return "news";
  if (path === "/about" || path === "/about-us") return "about";
  return undefined;
}

export function isSystemNavItem(item: Pick<NavItem, "systemKey" | "redirect_link">): boolean {
  return Boolean(item.systemKey || systemKeyForRedirect(item.redirect_link));
}

/**
 * Always keep Events / News / About us with locked project routes.
 * Extra custom links from the API (or draft) are kept after them.
 */
export function mergeNavigationWithDefaults(
  items: Array<{ name?: string; redirect_link?: string; id?: string }>,
): NavItem[] {
  const custom: NavItem[] = [];
  const nameByKey: Partial<Record<SystemNavKey, string>> = {};

  for (const [index, item] of items.entries()) {
    const name = typeof item.name === "string" ? item.name.trim() : "";
    const redirect = typeof item.redirect_link === "string" ? item.redirect_link.trim() : "/";
    const systemKey = systemKeyForRedirect(redirect);
    if (systemKey) {
      if (name) nameByKey[systemKey] = name;
      continue;
    }
    custom.push({
      id: item.id || `nav-custom-${index + 1}`,
      name: name || "New page",
      redirect_link: redirect || "/",
    });
  }

  const systemItems: NavItem[] = SYSTEM_NAV_DEFAULTS.map((item) => ({
    id: `nav-system-${item.systemKey}`,
    systemKey: item.systemKey,
    name: nameByKey[item.systemKey] || item.name,
    redirect_link: SYSTEM_LINK_BY_KEY[item.systemKey],
  }));

  return [...systemItems, ...custom];
}

export type LocalArticle = {
  id: string;
  headline: string;
  slug: string;
  excerpt: string;
  body: string;
  imageDataUrl: string;
  linkedEventId: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
};

export function slugifyHeadline(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatArticleDate(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function normalizeArticle(
  article: Partial<LocalArticle>,
  fallbackEventId = "",
): LocalArticle {
  const now = new Date().toISOString();
  const headline = typeof article.headline === "string" ? article.headline : "";
  const createdAt =
    typeof article.createdAt === "string" && article.createdAt
      ? article.createdAt
      : typeof article.updatedAt === "string" && article.updatedAt
        ? article.updatedAt
        : now;
  return {
    id: article.id || newArticleId(),
    headline,
    slug:
      typeof article.slug === "string" && article.slug
        ? article.slug
        : slugifyHeadline(headline),
    excerpt: typeof article.excerpt === "string" ? article.excerpt : "",
    body: typeof article.body === "string" ? article.body : "",
    imageDataUrl:
      typeof article.imageDataUrl === "string" ? article.imageDataUrl : "",
    linkedEventId:
      typeof article.linkedEventId === "string"
        ? article.linkedEventId
        : fallbackEventId,
    status: article.status === "published" ? "published" : "draft",
    createdAt,
    updatedAt:
      typeof article.updatedAt === "string" && article.updatedAt
        ? article.updatedAt
        : createdAt,
  };
}

export type AboutBox = {
  id: string;
  title: string;
  body: string;
};

export type SupportContact = {
  id: string;
  departmentName: string;
  email: string;
  phone: string;
};

export function newSupportContactId() {
  return `support-${Date.now()}`;
}

export function normalizeSupportContact(
  contact: Partial<SupportContact>,
): SupportContact {
  return {
    id: contact.id || newSupportContactId(),
    departmentName:
      typeof contact.departmentName === "string" ? contact.departmentName : "",
    email: typeof contact.email === "string" ? contact.email : "",
    phone: typeof contact.phone === "string" ? contact.phone : "",
  };
}

export type SiteManageDraft = {
  /* Header / brand */
  publicName: string;
  /** Media path from media/upload — sent to organisation/site/update. */
  logoPath: string;
  /** Preview URL (CDN or local data URL). */
  logoDataUrl: string;
  navItems: NavItem[];
  showLogin: boolean;
  loginLabel: string;

  /* Homepage feature + banner / CTA */
  featureKind: FeatureKind;
  selectedEventId: string;
  selectedArticleId: string;
  customHeadline: string;
  bannerSource: BannerSource;
  bannerImageDataUrl: string;
  ctaLabel: string;
  ctaRedirectLink: string;

  /* What appears on this site */
  includedEventIds: string[];
  includedArticleIds: string[];
  showEvents: boolean;
  showNews: boolean;
  showArtists: boolean;

  /* Settings */
  publicContactEmail: string;
  domainInput: string;
  domainConnected: boolean;
  contactFormEnabled: boolean;
  enquiryInbox: string;

  /* Content */
  articles: LocalArticle[];
  aboutBoxes: AboutBox[];
  supportContacts: SupportContact[];
  editingArticleId: string | null;
  editingAboutId: string | null;

  siteStatus: SiteLifecycleLocal;
  hasReviewedOnce: boolean;
  toast: string;
};

const STORAGE_PREFIX = "yourlist.siteManage.v3:";

export function sampleEventsFor(siteName: string): SampleEvent[] {
  const brand = siteName.trim() || "Club";
  return [
    {
      id: "evt-1",
      title: `${brand} Sessions: Night Drive`,
      dateLabel: "Sat 14 Nov · 21:00",
      venue: "Warehouse 7",
      cta: "Get tickets",
      path: "/events/night-drive",
    },
    {
      id: "evt-2",
      title: "Artist Spotlight: Mira Vale",
      dateLabel: "Fri 28 Nov · 20:00",
      venue: "Main Room",
      cta: "View event",
      path: "/events/mira-vale",
    },
    {
      id: "evt-3",
      title: `${brand} members night`,
      dateLabel: "Thu 4 Dec · 19:30",
      venue: "Lounge",
      cta: "Get tickets",
      path: "/events/members-night",
    },
  ];
}

export function defaultNavItems(): NavItem[] {
  return mergeNavigationWithDefaults([]);
}

function defaultAbout(): AboutBox[] {
  return [
    { id: "about-1", title: "Our Story", body: "Tell visitors who you are and why this club exists." },
    { id: "about-2", title: "Events", body: "Explain the kinds of nights, matches or programmes you run." },
    { id: "about-3", title: "Artists", body: "Introduce the artists, teams or people people come for." },
    { id: "about-4", title: "Our Sound", body: "Describe the atmosphere, style or culture of the club." },
    { id: "about-5", title: "Collaborations", body: "List partners, venues and shared projects when ready." },
    { id: "about-6", title: "The Archive", body: "Point people to past events and lasting coverage." },
  ];
}

export function defaultManageDraft(siteName: string): SiteManageDraft {
  const events = sampleEventsFor(siteName);
  const now = new Date().toISOString();
  const openerHeadline = `${siteName} season opener`;
  const articles: LocalArticle[] = [
    {
      id: "news-1",
      headline: openerHeadline,
      slug: slugifyHeadline(openerHeadline),
      excerpt: `Opening the season with ${events[0].title}.`,
      body: `We are opening the season with ${events[0].title}. More lineup and ticket details will follow from the event page.`,
      imageDataUrl: "",
      linkedEventId: events[0].id,
      status: "published",
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    publicName: siteName,
    logoPath: "",
    logoDataUrl: "",
    navItems: defaultNavItems(),
    showLogin: true,
    loginLabel: "Login",

    featureKind: "event",
    selectedEventId: events[0].id,
    selectedArticleId: articles[0].id,
    customHeadline: `Welcome to ${siteName}`,
    bannerSource: "feature",
    bannerImageDataUrl: "",
    ctaLabel: "",
    ctaRedirectLink: "",

    includedEventIds: events.map((event) => event.id),
    includedArticleIds: articles.map((article) => article.id),
    showEvents: true,
    showNews: true,
    showArtists: true,

    publicContactEmail: "",
    domainInput: "",
    domainConnected: false,
    contactFormEnabled: true,
    enquiryInbox: "",

    articles,
    aboutBoxes: defaultAbout(),
    supportContacts: [],
    editingArticleId: articles[0].id,
    editingAboutId: null,

    siteStatus: "draft",
    hasReviewedOnce: false,
    toast: "",
  };
}

export function readManageDraft(siteId: string, siteName: string): SiteManageDraft {
  if (typeof window === "undefined") return defaultManageDraft(siteName);
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${siteId}`);
    if (!raw) return defaultManageDraft(siteName);
    const parsed = JSON.parse(raw) as Partial<SiteManageDraft>;
    const base = defaultManageDraft(siteName);
    return {
      ...base,
      ...parsed,
      publicName: parsed.publicName?.trim() || siteName,
      logoPath: typeof parsed.logoPath === "string" ? parsed.logoPath : "",
      logoDataUrl: typeof parsed.logoDataUrl === "string" ? parsed.logoDataUrl : "",
      navItems: mergeNavigationWithDefaults(
        Array.isArray(parsed.navItems) && parsed.navItems.length > 0
          ? parsed.navItems
          : base.navItems,
      ),
      articles:
        Array.isArray(parsed.articles) && parsed.articles.length > 0
          ? parsed.articles.map((article) =>
              normalizeArticle(article, base.selectedEventId),
            )
          : base.articles,
      aboutBoxes:
        Array.isArray(parsed.aboutBoxes) && parsed.aboutBoxes.length > 0
          ? parsed.aboutBoxes
          : base.aboutBoxes,
      supportContacts: Array.isArray(parsed.supportContacts)
        ? parsed.supportContacts.map((contact) => normalizeSupportContact(contact))
        : base.supportContacts,
      includedEventIds: Array.isArray(parsed.includedEventIds)
        ? parsed.includedEventIds
        : base.includedEventIds,
      includedArticleIds: Array.isArray(parsed.includedArticleIds)
        ? parsed.includedArticleIds
        : base.includedArticleIds,
      toast: "",
    };
  } catch {
    return defaultManageDraft(siteName);
  }
}

export function writeManageDraft(siteId: string, draft: SiteManageDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${siteId}`, JSON.stringify(draft));
  } catch {
    // Ignore storage failures; in-memory UI still works.
  }
}

export function newArticleId() {
  return `news-${Date.now()}`;
}

export function newNavId() {
  return `nav-${Date.now()}`;
}

export function eventMeta(event: SampleEvent) {
  return `${event.dateLabel} · ${event.venue}`;
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not read file."));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File): string | null {
  const validFormat =
    ["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    /\.(jpe?g|png|webp)$/i.test(file.name);
  if (!validFormat) return "Upload a JPG, PNG or WebP image.";
  if (file.size > 5 * 1024 * 1024) return "Image must be 5 MB or smaller.";
  return null;
}

export function getSetupChecklist(draft: SiteManageDraft) {
  const identityDone = Boolean(draft.publicName.trim() && draft.publicContactEmail.trim());
  const homepageDone = Boolean(
    draft.featureKind === "custom"
      ? draft.customHeadline.trim() && (draft.ctaLabel.trim() || draft.customHeadline.trim())
      : draft.featureKind === "event"
        ? draft.selectedEventId
        : draft.selectedArticleId,
  );
  const hasPublishedNews = draft.articles.some((item) => item.status === "published");
  const aboutStarted = draft.aboutBoxes.some((box) => box.body.trim().length > 40);
  const contentStarted = hasPublishedNews || aboutStarted;
  const enquiryDone = !draft.contactFormEnabled || Boolean(draft.enquiryInbox.trim());

  return {
    identityDone,
    homepageDone,
    contentStarted,
    enquiryDone,
    readyToPublish: identityDone && homepageDone,
  };
}
