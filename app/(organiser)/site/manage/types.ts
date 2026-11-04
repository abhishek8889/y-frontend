export type MainTab = "Website" | "Content" | "Domain & Identity";
export type ContentPanel = "news" | "about" | "contact";
export type SettingsPanel = "identity" | "domain" | "enquiries";
export type WebsitePanel = "header" | "feature" | "content-select";

export const MAIN_TABS: MainTab[] = ["Website", "Content", "Domain & Identity"];

export const WEBSITE_TABS: { id: WebsitePanel; label: string }[] = [
  { id: "header", label: "Header & footer" },
  { id: "feature", label: "Banner & CTA" },
  { id: "content-select", label: "Categories" },
];

export const CONTENT_NAV: { id: ContentPanel; label: string }[] = [
  { id: "news", label: "News" },
  { id: "about", label: "About" },
  { id: "contact", label: "Support Contacts" },
];

export const SETTINGS_NAV: { id: SettingsPanel; label: string }[] = [
  { id: "identity", label: "Identity" },
  { id: "domain", label: "Domain" },
  { id: "enquiries", label: "Enquiries" },
];
