import {
  eventMeta,
  type LocalArticle,
  type SampleEvent,
  type SiteManageDraft,
} from "../workspace/siteManageState";

export type ClubsitePreviewModel = {
  brandName: string;
  brandInitial: string;
  previewUrl: string;
  heroTitle: string;
  heroMeta: string;
  heroCta: string;
  heroCtaLink: string;
  heroImage: string;
  visibleEvents: SampleEvent[];
  newsForPreview: LocalArticle[];
};

export function buildClubsitePreviewModel(
  draft: SiteManageDraft,
  events: SampleEvent[],
  siteName: string,
): ClubsitePreviewModel {
  const brandName = draft.publicName.trim() || siteName;
  const brandInitial = (brandName.charAt(0) || "C").toUpperCase();
  const selectedEvent =
    events.find((item) => item.id === draft.selectedEventId) ?? events[0];
  const selectedArticle =
    draft.articles.find((item) => item.id === draft.selectedArticleId) ??
    draft.articles[0];

  const visibleEvents = events.filter((event) =>
    draft.includedEventIds.includes(event.id),
  );
  const newsForPreview = draft.articles.filter(
    (article) =>
      draft.includedArticleIds.includes(article.id) &&
      article.status === "published",
  );

  const heroTitle =
    draft.featureKind === "event"
      ? selectedEvent.title
      : draft.featureKind === "news"
        ? selectedArticle?.headline || "Choose a story"
        : draft.customHeadline || "Add a campaign headline";

  const heroMeta =
    draft.featureKind === "event"
      ? eventMeta(selectedEvent)
      : draft.featureKind === "news"
        ? selectedArticle?.status === "published"
          ? "From your news"
          : "Draft story"
        : draft.ctaRedirectLink || "Custom campaign";

  const heroCta =
    draft.ctaLabel.trim() ||
    (draft.featureKind === "event"
      ? selectedEvent.cta
      : draft.featureKind === "news"
        ? "Read article"
        : "Learn more");

  const heroCtaLink =
    draft.ctaRedirectLink.trim() ||
    (draft.featureKind === "event"
      ? selectedEvent.path
      : draft.featureKind === "news"
        ? `/news/${selectedArticle?.id ?? ""}`
        : "/");

  const heroImage =
    draft.bannerSource === "upload" && draft.bannerImageDataUrl
      ? draft.bannerImageDataUrl
      : draft.featureKind === "news"
        ? selectedArticle?.imageDataUrl || ""
        : "";

  const previewUrl =
    draft.domainConnected && draft.domainInput
      ? draft.domainInput
      : `${brandName.toLowerCase().replace(/\s+/g, "")}.preview`;

  return {
    brandName,
    brandInitial,
    previewUrl,
    heroTitle,
    heroMeta,
    heroCta,
    heroCtaLink,
    heroImage,
    visibleEvents,
    newsForPreview,
  };
}
