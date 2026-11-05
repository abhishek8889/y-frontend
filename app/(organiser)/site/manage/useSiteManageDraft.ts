"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useGetOrganisationEventsQuery,
  useLazyGetOrganisationEventsQuery,
  type OrganisationEvent,
} from "@/apis/events/eventsApi";
import { useUploadMediaMutation } from "@/apis/media/mediaApi";
import {
  extractDnsRecords,
  isApiSiteId,
  usePublishOrganisationSiteMutation,
  useUpdateOrganisationSiteDomainMutation,
  useUpdateOrganisationSiteMutation,
  type SiteDnsRecord,
  type SiteNavigationItem,
} from "@/apis/organisation/siteApi";
import {
  siteBannerImagePath,
  siteBannerImageUrl,
  useGetOrganisationSiteBannerQuery,
  useSaveOrganisationSiteBannerMutation,
  type SaveSiteBannerPayload,
  type SiteBannerFeatureType,
  type SiteBannerImageTarget,
  type SiteBannerItem,
} from "@/apis/organisation/siteBannerApi";
import {
  useGetOrganisationSiteCategoryQuery,
  useUpdateOrganisationSiteCategoryMutation,
  type SiteCategoryItem,
  type SiteFeatureObject,
  type UpdateSiteCategoryPayload,
} from "@/apis/organisation/siteCategoryApi";
import { getEventBanner } from "@/components/organiser/events/EventBannerMedia";
import { formatDateTime } from "@/lib/events/formatDateTime";
import { appToast } from "@/lib/ui/toast";
import { mapOrganisationSite, navigationToPayload } from "../siteMappers";
import type { SiteRecord } from "../siteTypes";
import {
  getSetupChecklist,
  isSystemNavItem,
  mergeNavigationWithDefaults,
  newArticleId,
  newNavId,
  readFileAsDataUrl,
  readManageDraft,
  validateImageFile,
  writeManageDraft,
  type FeatureKind,
  type LocalArticle,
  type NavItem,
  type SampleEvent,
  type SiteManageDraft,
  type SupportContact,
} from "../workspace/siteManageState";
import { buildClubsitePreviewModel } from "./previewModel";
import type {
  ContentPanel,
  MainTab,
  SettingsPanel,
  WebsitePanel,
} from "./types";

/** Published events for Banner & CTA / Categories — 10 per page. */
export const FEATURE_EVENTS_PAGE_SIZE = 10;

function mapOrganisationEvent(event: OrganisationEvent): SampleEvent {
  const banner = getEventBanner(event.images);
  return {
    id: String(event.id),
    title: event.name?.trim() || `Event ${event.id}`,
    dateLabel: formatDateTime(event.starts_at, {
      timeZone: event.timezone,
      includeYear: true,
    }),
    venue: event.venue?.name?.trim() || "Venue TBC",
    cta: "Get tickets",
    path: `/events/${event.unique_id || event.id}`,
    imageUrl: banner?.url?.trim() || "",
  };
}

/** Header & footer fields always come from organisation/site/list (via SiteRecord). */
function seedDraftFromSite(site: SiteRecord, draft: SiteManageDraft): SiteManageDraft {
  const status = String(site.status ?? "").trim().toLowerCase();
  const published =
    status === "active" || status === "live" || status === "published";

  return {
    ...draft,
    publicName: site.name?.trim() || draft.publicName,
    logoPath: site.logo?.path ?? "",
    logoDataUrl: site.logo?.url ?? "",
    navItems: mergeNavigationWithDefaults(site.navigation ?? []),
    domainInput: site.domainHostname || draft.domainInput,
    domainConnected: Boolean(site.domainHostname),
    siteStatus: published ? "published" : draft.siteStatus,
  };
}

function featureKindFromApi(value: string | undefined | null): FeatureKind {
  if (value === "news") return "news";
  if (value === "custom") return "custom";
  return "event";
}

function featureTypeToApi(kind: FeatureKind): SiteBannerFeatureType {
  if (kind === "news") return "news";
  if (kind === "custom") return "custom";
  return "events";
}

function applyBannerToDraft(
  draft: SiteManageDraft,
  banner: SiteBannerItem | null | undefined,
): SiteManageDraft {
  if (!banner) return draft;

  const featureKind = featureKindFromApi(
    typeof banner.feature_type === "string" ? banner.feature_type : null,
  );
  const fromFeature = banner.feature_image_target === "from_feature";
  const targetId =
    banner.feature_target_id !== undefined && banner.feature_target_id !== null
      ? String(banner.feature_target_id)
      : "";

  return {
    ...draft,
    featureKind,
    selectedEventId:
      featureKind === "event" && targetId ? targetId : draft.selectedEventId,
    selectedArticleId:
      featureKind === "news" && targetId ? targetId : draft.selectedArticleId,
    customHeadline:
      typeof banner.custom_headline === "string" && banner.custom_headline.trim()
        ? banner.custom_headline
        : draft.customHeadline,
    bannerSource: fromFeature && featureKind !== "custom" ? "feature" : "upload",
    bannerImagePath: siteBannerImagePath(banner.image_url),
    bannerImageDataUrl: siteBannerImageUrl(banner.image_url),
    ctaLabel:
      typeof banner.cta_button_1_label === "string"
        ? banner.cta_button_1_label
        : draft.ctaLabel,
    ctaRedirectLink:
      typeof banner.cta_button_1_url === "string"
        ? banner.cta_button_1_url
        : draft.ctaRedirectLink,
  };
}

function applyCategoriesToDraft(
  draft: SiteManageDraft,
  featureObject: SiteFeatureObject | null | undefined,
  categories: SiteCategoryItem[] | null | undefined,
): SiteManageDraft {
  const eventIds: string[] = [];
  const newsIds: string[] = [];
  for (const row of categories ?? []) {
    const id =
      row.category_id !== undefined && row.category_id !== null
        ? String(row.category_id)
        : "";
    if (!id) continue;
    if (row.category_type === "events") {
      if (!eventIds.includes(id)) eventIds.push(id);
    }
    if (row.category_type === "news") {
      if (!newsIds.includes(id)) newsIds.push(id);
    }
  }

  return {
    ...draft,
    showEvents: (featureObject?.event_category ?? "off") === "on",
    showNews: (featureObject?.news_category ?? "off") === "on",
    includedEventIds: eventIds,
    includedArticleIds: newsIds,
  };
}

function sameIdList(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const left = [...a].map(String).sort();
  const right = [...b].map(String).sort();
  return left.every((id, index) => id === right[index]);
}

function toNavigationPayload(items: NavItem[]): SiteNavigationItem[] {
  const locked = mergeNavigationWithDefaults(items);
  return navigationToPayload(
    locked.map((item) => ({
      name: item.name,
      redirect_link: item.redirect_link,
    })),
  );
}

export function useSiteManageDraft(
  site: SiteRecord,
  onPublishedLocal?: (site: SiteRecord) => void,
  onSiteUpdated?: (site: SiteRecord) => void,
) {
  const [uploadMedia] = useUploadMediaMutation();
  const [updateSite, { isLoading: isSavingHeader }] =
    useUpdateOrganisationSiteMutation();
  const [updateSiteDomain, { isLoading: isSavingDomain }] =
    useUpdateOrganisationSiteDomainMutation();
  const [publishSite, { isLoading: isPublishing }] =
    usePublishOrganisationSiteMutation();
  const [saveBannerMutation, { isLoading: isSavingBanner }] =
    useSaveOrganisationSiteBannerMutation();
  const [updateCategoryMutation, { isLoading: isSavingCategories }] =
    useUpdateOrganisationSiteCategoryMutation();
  const [dnsModal, setDnsModal] = useState<{
    hostname: string;
    status: string | null;
    records: SiteDnsRecord[];
  } | null>(null);

  const [mainTab, setMainTab] = useState<MainTab>("Website");
  const [websitePanel, setWebsitePanel] = useState<WebsitePanel>("feature");
  const [contentPanel, setContentPanel] = useState<ContentPanel>("news");
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>("identity");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const bannerHydratedForSite = useRef<string | null>(null);
  const categoryHydratedForSite = useRef<string | null>(null);
  const [draft, setDraft] = useState<SiteManageDraft>(() =>
    seedDraftFromSite(site, readManageDraft(site.id, site.name)),
  );
  const [workingSite, setWorkingSite] = useState<SiteRecord>(site);

  useEffect(() => {
    setWorkingSite(site);
  }, [site]);

  const canQuerySiteExtras = isApiSiteId(site.id);
  const { data: bannerData } = useGetOrganisationSiteBannerQuery(
    { site_id: site.id },
    { skip: !canQuerySiteExtras },
  );
  const { data: categoryData } = useGetOrganisationSiteCategoryQuery(
    { site_id: site.id },
    { skip: !canQuerySiteExtras },
  );

  const [extraEvents, setExtraEvents] = useState<SampleEvent[]>([]);
  const [eventsNextCursor, setEventsNextCursor] = useState<string | null>(null);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const eventsLoadLock = useRef(false);

  const {
    data: eventsData,
    isLoading: eventsLoading,
    isFetching: eventsFetching,
    isError: eventsError,
  } = useGetOrganisationEventsQuery({
    per_page: FEATURE_EVENTS_PAGE_SIZE,
    status: "published",
  });

  const [fetchMoreEvents, { isFetching: eventsFetchingMore }] =
    useLazyGetOrganisationEventsQuery();

  useEffect(() => {
    setExtraEvents([]);
    eventsLoadLock.current = false;
    const pagination = eventsData?.data?.pagination;
    setEventsNextCursor(pagination?.next_cursor ?? null);
    setEventsHasMore(Boolean(pagination?.has_more && pagination?.next_cursor));
  }, [eventsData]);

  const events = useMemo(() => {
    const first = (eventsData?.data?.items ?? []).map(mapOrganisationEvent);
    const seen = new Set<string>();
    const merged: SampleEvent[] = [];
    for (const event of [...first, ...extraEvents]) {
      if (seen.has(event.id)) continue;
      seen.add(event.id);
      merged.push(event);
    }
    return merged;
  }, [eventsData?.data?.items, extraEvents]);

  const loadMoreEvents = useCallback(async () => {
    if (!eventsNextCursor || !eventsHasMore) return;
    if (eventsFetchingMore || eventsFetching || eventsLoadLock.current) return;

    eventsLoadLock.current = true;
    try {
      const result = await fetchMoreEvents({
        per_page: FEATURE_EVENTS_PAGE_SIZE,
        status: "published",
        cursor: eventsNextCursor,
      }).unwrap();
      const pageItems = (result.data?.items ?? []).map(mapOrganisationEvent);
      const pagination = result.data?.pagination;
      if (pageItems.length) {
        setExtraEvents((prev) => [...prev, ...pageItems]);
      }
      setEventsNextCursor(pagination?.next_cursor ?? null);
      setEventsHasMore(Boolean(pagination?.has_more && pagination?.next_cursor));
    } catch {
      // Keep list; scroll again to retry.
    } finally {
      eventsLoadLock.current = false;
    }
  }, [
    eventsNextCursor,
    eventsHasMore,
    eventsFetchingMore,
    eventsFetching,
    fetchMoreEvents,
  ]);

  const preview = useMemo(
    () => buildClubsitePreviewModel(draft, events, site.name),
    [draft, events, site.name],
  );

  const checklist = useMemo(() => getSetupChecklist(draft), [draft]);

  const selectedEvent =
    events.find((item) => item.id === draft.selectedEventId) ?? events[0];
  const editingArticle =
    draft.articles.find((item) => item.id === draft.editingArticleId) ?? null;
  const editingAbout =
    draft.aboutBoxes.find((item) => item.id === draft.editingAboutId) ?? null;

  useEffect(() => {
    bannerHydratedForSite.current = null;
    categoryHydratedForSite.current = null;
    setDraft(seedDraftFromSite(site, readManageDraft(site.id, site.name)));
    setMainTab("Website");
    setWebsitePanel("feature");
    setReviewOpen(false);
    // Seed once per site — avoid resetting while the user edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: site.id only
  }, [site.id]);

  function persist(next: SiteManageDraft) {
    writeManageDraft(site.id, next);
    setDraft(next);
  }

  useEffect(() => {
    if (!canQuerySiteExtras || !bannerData) return;
    if (bannerHydratedForSite.current === String(site.id)) return;
    bannerHydratedForSite.current = String(site.id);
    setDraft((current) => {
      const next = applyBannerToDraft(current, bannerData.data?.banner);
      writeManageDraft(site.id, next);
      return next;
    });
  }, [bannerData, canQuerySiteExtras, site.id]);

  useEffect(() => {
    if (!canQuerySiteExtras || !categoryData?.data) return;

    const featureObject = categoryData.data.feature_object;
    const categories = Array.isArray(categoryData.data.categories)
      ? categoryData.data.categories
      : [];

    setDraft((current) => {
      const next = applyCategoriesToDraft(current, featureObject, categories);
      const unchanged =
        current.showEvents === next.showEvents &&
        current.showNews === next.showNews &&
        sameIdList(current.includedEventIds, next.includedEventIds) &&
        sameIdList(current.includedArticleIds, next.includedArticleIds);
      if (unchanged && categoryHydratedForSite.current === String(site.id)) {
        return current;
      }
      categoryHydratedForSite.current = String(site.id);
      writeManageDraft(site.id, next);
      return next;
    });
  }, [categoryData, canQuerySiteExtras, site.id]);

  // Keep banner featured event valid — do not overwrite Categories selections.
  useEffect(() => {
    if (!events.length) return;
    setDraft((current) => {
      const ids = events.map((event) => String(event.id));
      const selectedId = String(current.selectedEventId);
      if (ids.includes(selectedId)) return current;
      const next = {
        ...current,
        selectedEventId: ids[0],
        toast: "",
      };
      writeManageDraft(site.id, next);
      return next;
    });
  }, [events, site.id]);

  function update(partial: Partial<SiteManageDraft>) {
    const { toast: toastMessage, ...rest } = partial;
    if (toastMessage?.trim()) {
      appToast.success(toastMessage.trim());
    }
    persist({ ...draft, ...rest, toast: "" });
  }

  function toast(message: string, variant: "success" | "error" = "error") {
    if (variant === "success") appToast.success(message);
    else appToast.error(message);
  }

  async function uploadImage(
    fileList: FileList | null,
    apply: (dataUrl: string) => void,
  ) {
    const file = fileList?.[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      toast(error);
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      apply(dataUrl);
    } catch {
      toast("Could not read that image. Try another file.");
    }
  }

  async function uploadLogo(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file || uploadingLogo) return;
    const error = validateImageFile(file);
    if (error) {
      toast(error);
      return;
    }

    setUploadingLogo(true);
    try {
      const result = await uploadMedia({
        file,
        context: "site-logo",
      }).unwrap();
      persist({
        ...draft,
        logoPath: result.data.path,
        logoDataUrl: result.data.url,
        toast: "",
      });
      appToast.success("Logo uploaded — save header to apply.");
    } catch {
      // Error toast from media upload mutation.
    } finally {
      setUploadingLogo(false);
    }
  }

  function clearLogo() {
    persist({
      ...draft,
      logoPath: "",
      logoDataUrl: "",
      toast: "",
    });
    appToast.success("Logo removed — save header to apply.");
  }

  async function uploadBanner(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file || uploadingBanner) return;
    const error = validateImageFile(file);
    if (error) {
      toast(error);
      return;
    }

    setUploadingBanner(true);
    try {
      const result = await uploadMedia({
        file,
        context: "site-banner",
      }).unwrap();
      persist({
        ...draft,
        bannerImagePath: result.data.path,
        bannerImageDataUrl: result.data.url,
        bannerSource: "upload",
        toast: "",
      });
      appToast.success("Banner uploaded — save Banner & CTA to apply.");
    } catch {
      // Error toast from media upload mutation.
    } finally {
      setUploadingBanner(false);
    }
  }

  function clearBannerImage() {
    persist({
      ...draft,
      bannerImagePath: "",
      bannerImageDataUrl: "",
      bannerSource: "upload",
      toast: "",
    });
    appToast.success("Banner removed — save Banner & CTA to apply.");
  }

  async function saveBannerCta() {
    if (isSavingBanner || uploadingBanner) return;

    if (!isApiSiteId(site.id)) {
      toast("Save is unavailable until this site exists on the server.");
      return;
    }

    const featureType = featureTypeToApi(draft.featureKind);
    const imageTarget: SiteBannerImageTarget =
      draft.featureKind === "custom" || draft.bannerSource === "upload"
        ? "custom_upload"
        : "from_feature";

    if (draft.featureKind === "event" && !draft.selectedEventId.trim()) {
      toast("Select a published event to feature.");
      return;
    }
    if (draft.featureKind === "news" && !draft.selectedArticleId.trim()) {
      toast("Select a published news article to feature.");
      return;
    }
    if (draft.featureKind === "custom" && !draft.customHeadline.trim()) {
      toast("Enter a campaign headline.");
      return;
    }
    if (imageTarget === "custom_upload" && !draft.bannerImagePath.trim()) {
      toast("Upload a banner image.");
      return;
    }

    const siteIdNum = Number(site.id);
    if (!Number.isFinite(siteIdNum) || siteIdNum < 1) {
      toast("Save is unavailable until this site exists on the server.");
      return;
    }

    const body: SaveSiteBannerPayload = {
      site_id: siteIdNum,
      feature_type: featureType,
      feature_target_id:
        draft.featureKind === "custom"
          ? null
          : draft.featureKind === "event"
            ? Number(draft.selectedEventId)
            : Number(draft.selectedArticleId),
      feature_image_target: imageTarget,
      custom_headline:
        draft.featureKind === "custom" ? draft.customHeadline.trim() : null,
      image_url:
        imageTarget === "custom_upload" ? draft.bannerImagePath.trim() : null,
      cta_button_1_label: draft.ctaLabel.trim() || null,
      cta_button_1_url: draft.ctaRedirectLink.trim() || null,
    };

    try {
      const result = await saveBannerMutation(body).unwrap();
      const saved = result.data?.banner;
      const next = applyBannerToDraft(draft, saved);
      bannerHydratedForSite.current = String(site.id);
      persist({ ...next, toast: "" });
    } catch {
      // Error toast from mutation.
    }
  }

  async function saveCategories() {
    if (isSavingCategories) return;

    if (!isApiSiteId(site.id)) {
      toast("Save is unavailable until this site exists on the server.");
      return;
    }

    const siteIdNum = Number(site.id);
    if (!Number.isFinite(siteIdNum) || siteIdNum < 1) {
      toast("Save is unavailable until this site exists on the server.");
      return;
    }

    const eventIds = draft.includedEventIds
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);
    const newsIds = draft.includedArticleIds
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);

    const body: UpdateSiteCategoryPayload = {
      site_id: siteIdNum,
      feature_object: {
        event_category: draft.showEvents ? "on" : "off",
        news_category: draft.showNews ? "on" : "off",
      },
      categories: [
        ...eventIds.map((category_id) => ({
          category_type: "events" as const,
          category_id,
        })),
        ...newsIds.map((category_id) => ({
          category_type: "news" as const,
          category_id,
        })),
      ],
    };

    try {
      const result = await updateCategoryMutation(body).unwrap();
      const next = applyCategoriesToDraft(
        draft,
        result.data?.feature_object,
        result.data?.categories,
      );
      categoryHydratedForSite.current = String(site.id);
      persist({ ...next, toast: "" });
    } catch {
      // Error toast from mutation.
    }
  }

  async function saveDomain() {
    if (isSavingDomain) return;

    const domain = draft.domainInput
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/+$/, "")
      .toLowerCase();

    if (!domain) {
      toast("Enter a domain first.");
      return;
    }

    if (!isApiSiteId(site.id)) {
      toast("Save is unavailable until this site exists on the server.");
      return;
    }

    try {
      const result = await updateSiteDomain({
        siteId: site.id,
        domain,
      }).unwrap();

      const updated = result.data?.site;
      const hostname =
        (updated?.hostname && String(updated.hostname).trim()) ||
        (updated?.domain &&
        typeof updated.domain === "object" &&
        typeof updated.domain.hostname === "string"
          ? updated.domain.hostname.trim()
          : "") ||
        domain;

      const dnsRecords = extractDnsRecords(result);
      const nextSite: SiteRecord = {
        ...workingSite,
        domainHostname: hostname,
        domainStatus:
          updated?.domain &&
          typeof updated.domain === "object" &&
          typeof updated.domain.status === "string"
            ? updated.domain.status
            : workingSite.domainStatus,
        vercelAdded:
          (updated?.domain &&
            typeof updated.domain === "object" &&
            Boolean(updated.domain.vercel_added)) ||
          dnsRecords.length > 0 ||
          workingSite.vercelAdded,
        dnsRecords: dnsRecords.length ? dnsRecords : workingSite.dnsRecords,
        updatedAt: new Date().toISOString(),
      };

      persist({
        ...draft,
        domainInput: hostname,
        domainConnected: Boolean(hostname),
        toast: "",
      });
      setWorkingSite(nextSite);
      onSiteUpdated?.(nextSite);
    } catch {
      // Error toast from mutation.
    }
  }

  async function saveHeaderFooter() {
    if (isSavingHeader || uploadingLogo) return;

    const name = draft.publicName.trim();
    if (!name) {
      toast("Enter a public name.");
      return;
    }
    if (name.length < 2) {
      toast("Public name must be at least 2 characters.");
      return;
    }

    const navigation = toNavigationPayload(draft.navItems);
    if (!navigation.length) {
      toast("Add at least one navigation item with a name.");
      return;
    }

    if (!isApiSiteId(site.id)) {
      toast("Save is unavailable until this site exists on the server.");
      return;
    }

    try {
      const result = await updateSite({
        siteId: site.id,
        body: {
          name,
          logo: draft.logoPath.trim() ? draft.logoPath.trim() : null,
          navigation,
        },
      }).unwrap();

      const updated = result.data?.site;
      const nextDraft: SiteManageDraft = {
        ...draft,
        publicName: updated?.name?.trim() || name,
        toast: "",
      };

      if (updated?.logo && typeof updated.logo === "object") {
        if (typeof updated.logo.path === "string") {
          nextDraft.logoPath = updated.logo.path;
        }
        if (typeof updated.logo.url === "string" && updated.logo.url) {
          nextDraft.logoDataUrl = updated.logo.url;
        }
      } else if (!draft.logoPath) {
        nextDraft.logoPath = "";
        nextDraft.logoDataUrl = "";
      }

      nextDraft.navItems = mergeNavigationWithDefaults(
        Array.isArray(updated?.navigation) && updated.navigation.length
          ? updated.navigation
          : navigation,
      );

      persist(nextDraft);

      if (updated) {
        onSiteUpdated?.({
          ...site,
          name: nextDraft.publicName,
          logo: nextDraft.logoPath
            ? {
                path: nextDraft.logoPath,
                url: nextDraft.logoDataUrl || nextDraft.logoPath,
              }
            : null,
          navigation: toNavigationPayload(nextDraft.navItems),
          brandingComplete: Boolean(
            nextDraft.logoPath && nextDraft.navItems.length,
          ),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch {
      // Toast handled by mutation — keep panel open for corrections.
    }
  }

  function updateNavItem(id: string, partial: Partial<NavItem>) {
    update({
      navItems: draft.navItems.map((item) => {
        if (item.id !== id) return item;
        // System routes stay fixed — only the label can change.
        if (isSystemNavItem(item)) {
          return {
            ...item,
            name: partial.name !== undefined ? partial.name : item.name,
          };
        }
        return { ...item, ...partial };
      }),
    });
  }

  function addNavItem() {
    update({
      navItems: [
        ...draft.navItems,
        { id: newNavId(), name: "New page", redirect_link: "/" },
      ],
      toast: "Navigation item added — it appears in the header preview.",
    });
    setWebsitePanel("header");
  }

  function removeNavItem(id: string) {
    const target = draft.navItems.find((item) => item.id === id);
    if (target && isSystemNavItem(target)) {
      toast("Events, News and About us are required and cannot be removed.");
      return;
    }
    if (draft.navItems.length <= 1) {
      toast("Keep at least one navigation item.");
      return;
    }
    update({
      navItems: draft.navItems.filter((item) => item.id !== id),
      toast: "Navigation item removed.",
    });
  }

  function toggleIncluded(
    listKey: "includedEventIds" | "includedArticleIds",
    id: string,
  ) {
    const target = String(id);
    const current = draft[listKey].map(String);
    const next = current.includes(target)
      ? current.filter((item) => item !== target)
      : [...current, target];
    update({ [listKey]: next });
  }

  function saveArticle(article: LocalArticle, message?: string) {
    const now = new Date().toISOString();
    const exists = draft.articles.some((item) => item.id === article.id);
    const nextArticle: LocalArticle = {
      ...article,
      createdAt: article.createdAt || now,
      updatedAt: now,
    };
    const articles = exists
      ? draft.articles.map((item) =>
          item.id === article.id ? nextArticle : item,
        )
      : [nextArticle, ...draft.articles];
    const includedArticleIds = draft.includedArticleIds.includes(article.id)
      ? draft.includedArticleIds
      : [...draft.includedArticleIds, article.id];
    persist({
      ...draft,
      articles,
      includedArticleIds,
      editingArticleId: article.id,
      selectedArticleId: article.id,
      toast: "",
    });
    if (message?.trim()) appToast.success(message.trim());
  }

  function deleteArticle(articleId: string) {
    const articles = draft.articles.filter((item) => item.id !== articleId);
    const includedArticleIds = draft.includedArticleIds.filter(
      (id) => id !== articleId,
    );
    const nextEditing =
      draft.editingArticleId === articleId
        ? (articles[0]?.id ?? null)
        : draft.editingArticleId;
    const nextSelected =
      draft.selectedArticleId === articleId
        ? (articles[0]?.id ?? "")
        : draft.selectedArticleId;
    persist({
      ...draft,
      articles,
      includedArticleIds,
      editingArticleId: nextEditing,
      selectedArticleId: nextSelected,
      toast: "",
    });
    appToast.success("Story deleted.");
  }

  function saveSupportContact(contact: SupportContact, message?: string) {
    const exists = draft.supportContacts.some((item) => item.id === contact.id);
    const supportContacts = exists
      ? draft.supportContacts.map((item) =>
          item.id === contact.id ? contact : item,
        )
      : [contact, ...draft.supportContacts];
    persist({
      ...draft,
      supportContacts,
      toast: "",
    });
    appToast.success(message?.trim() || "Support contact saved.");
  }

  function deleteSupportContact(contactId: string) {
    persist({
      ...draft,
      supportContacts: draft.supportContacts.filter((item) => item.id !== contactId),
      toast: "",
    });
    appToast.success("Support contact deleted.");
  }

  function createArticle() {
    const now = new Date().toISOString();
    const article: LocalArticle = {
      id: newArticleId(),
      headline: "",
      slug: "",
      excerpt: "",
      body: "",
      imageDataUrl: "",
      linkedEventId: events[0]?.id ?? "",
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };
    persist({
      ...draft,
      articles: [article, ...draft.articles],
      includedArticleIds: [...draft.includedArticleIds, article.id],
      editingArticleId: article.id,
      selectedArticleId: article.id,
      toast: "",
    });
    appToast.success("New draft ready — add headline, image and story.");
    setMainTab("Content");
    setContentPanel("news");
  }

  function openDnsInstructions(next: SiteRecord) {
    setDnsModal({
      hostname: next.domainHostname || draft.domainInput.trim() || "",
      status: next.domainStatus,
      records: next.dnsRecords,
    });
  }

  async function publishWebsite() {
    if (isPublishing) return;

    if (!isApiSiteId(site.id)) {
      toast("Publish is unavailable until this site exists on the server.");
      return;
    }

    if (!draft.publicName.trim()) {
      toast("Add a public name under Header & footer before publishing.");
      setMainTab("Website");
      setWebsitePanel("header");
      return;
    }

    if (!draft.logoPath.trim()) {
      toast("Upload a logo under Header & footer before publishing.");
      setMainTab("Website");
      setWebsitePanel("header");
      return;
    }

    if (!draft.navItems.length) {
      toast("Add navigation under Header & footer before publishing.");
      setMainTab("Website");
      setWebsitePanel("header");
      return;
    }

    if (!draft.domainInput.trim()) {
      toast("Add a domain under Domain & Identity before publishing.");
      setMainTab("Domain & Identity");
      return;
    }

    // Already published with DNS on hand — show instructions again.
    if (
      (draft.siteStatus === "published" ||
        workingSite.status === "active" ||
        workingSite.status === "live") &&
      workingSite.dnsRecords.length > 0
    ) {
      openDnsInstructions(workingSite);
      return;
    }

    try {
      const result = await publishSite(site.id).unwrap();
      const records = extractDnsRecords(result);
      const mapped = result.data?.site
        ? mapOrganisationSite(result.data.site)
        : null;
      const hostname =
        mapped?.domainHostname?.trim() ||
        draft.domainInput.trim() ||
        site.domainHostname ||
        "";
      const nextSite: SiteRecord = {
        ...(mapped ?? workingSite),
        status: mapped?.status || "active",
        domainHostname: hostname || workingSite.domainHostname,
        domainStatus: mapped?.domainStatus ?? workingSite.domainStatus,
        vercelAdded:
          mapped?.vercelAdded || records.length > 0 || workingSite.vercelAdded,
        dnsRecords: records.length
          ? records
          : mapped?.dnsRecords?.length
            ? mapped.dnsRecords
            : workingSite.dnsRecords,
        brandingComplete: true,
        updatedAt: new Date().toISOString(),
      };

      persist({
        ...draft,
        siteStatus: "published",
        hasReviewedOnce: true,
        domainInput: nextSite.domainHostname || draft.domainInput,
        domainConnected: Boolean(nextSite.domainHostname),
        toast: "",
      });
      setWorkingSite(nextSite);
      onPublishedLocal?.(nextSite);
      onSiteUpdated?.(nextSite);
      setReviewOpen(false);
      openDnsInstructions(nextSite);
    } catch {
      // Error toast from mutation.
    }
  }

  function closeDnsModal() {
    setDnsModal(null);
  }

  return {
    site: workingSite,
    draft,
    events,
    eventsLoading,
    eventsError,
    eventsFetchingMore,
    eventsHasMore,
    loadMoreEvents,
    preview,
    checklist,
    selectedEvent,
    editingArticle,
    editingAbout,
    mainTab,
    setMainTab,
    websitePanel,
    setWebsitePanel,
    contentPanel,
    setContentPanel,
    settingsPanel,
    setSettingsPanel,
    reviewOpen,
    setReviewOpen,
    dnsModal,
    closeDnsModal,
    isPublishing,
    update,
    toast,
    uploadImage,
    uploadLogo,
    clearLogo,
    uploadingLogo,
    uploadBanner,
    clearBannerImage,
    uploadingBanner,
    saveBannerCta,
    isSavingBanner,
    saveCategories,
    isSavingCategories,
    saveDomain,
    isSavingDomain,
    saveHeaderFooter,
    isSavingHeader,
    updateNavItem,
    addNavItem,
    removeNavItem,
    toggleIncluded,
    saveArticle,
    deleteArticle,
    saveSupportContact,
    deleteSupportContact,
    createArticle,
    publishWebsite,
  };
}

export type SiteManageController = ReturnType<typeof useSiteManageDraft>;
