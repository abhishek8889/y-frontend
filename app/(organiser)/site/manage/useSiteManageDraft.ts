"use client";

import { useEffect, useMemo, useState } from "react";
import { useUploadMediaMutation } from "@/apis/media/mediaApi";
import {
  isApiSiteId,
  useUpdateOrganisationSiteMutation,
  type SiteNavigationItem,
} from "@/apis/organisation/siteApi";
import { appToast } from "@/lib/ui/toast";
import { navigationToPayload } from "../siteMappers";
import type { SiteRecord } from "../siteTypes";
import {
  getSetupChecklist,
  isSystemNavItem,
  mergeNavigationWithDefaults,
  newArticleId,
  newNavId,
  readFileAsDataUrl,
  readManageDraft,
  sampleEventsFor,
  validateImageFile,
  writeManageDraft,
  type LocalArticle,
  type NavItem,
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

/** Header & footer fields always come from organisation/site/list (via SiteRecord). */
function seedDraftFromSite(site: SiteRecord, draft: SiteManageDraft): SiteManageDraft {
  return {
    ...draft,
    publicName: site.name?.trim() || draft.publicName,
    logoPath: site.logo?.path ?? "",
    logoDataUrl: site.logo?.url ?? "",
    navItems: mergeNavigationWithDefaults(site.navigation ?? []),
    domainInput: site.domainHostname || draft.domainInput,
    domainConnected: Boolean(site.domainHostname),
  };
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

  const [mainTab, setMainTab] = useState<MainTab>("Website");
  const [websitePanel, setWebsitePanel] = useState<WebsitePanel>("feature");
  const [contentPanel, setContentPanel] = useState<ContentPanel>("news");
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>("identity");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [draft, setDraft] = useState<SiteManageDraft>(() =>
    seedDraftFromSite(site, readManageDraft(site.id, site.name)),
  );

  const events = useMemo(
    () => sampleEventsFor(draft.publicName || site.name),
    [draft.publicName, site.name],
  );

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
    const current = draft[listKey];
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
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

  function publishWebsite() {
    if (!checklist.readyToPublish) {
      toast("Finish identity and homepage feature before publishing.");
      setReviewOpen(true);
      return;
    }
    persist({
      ...draft,
      siteStatus: "published",
      hasReviewedOnce: true,
      toast: "",
    });
    appToast.success(`${preview.brandName} marked published in this preview.`);
    onPublishedLocal?.(site);
    setReviewOpen(false);
  }

  return {
    site,
    draft,
    events,
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
    update,
    toast,
    uploadImage,
    uploadLogo,
    clearLogo,
    uploadingLogo,
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
