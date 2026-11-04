"use client";

import { useEffect, useMemo, useState } from "react";
import { useUploadMediaMutation } from "@/apis/media/mediaApi";
import {
  siteNewsImagePath,
  siteNewsImageUrl,
  useCreateOrganisationSiteNewsMutation,
  useManageOrganisationSiteNewsStatusMutation,
  useUpdateOrganisationSiteNewsMutation,
  type SiteNewsItem,
  type SiteNewsStatus,
} from "@/apis/organisation/siteNewsApi";
import { isApiSiteId } from "@/apis/organisation/siteApi";
import { RichTextEditor, SideDrawer } from "@/components/common";
import { SelectField } from "@/components/ui/SelectField";
import { appToast } from "@/lib/ui/toast";
import {
  slugifyHeadline,
  validateImageFile,
} from "../../workspace/siteManageState";
import { ImageDropzone } from "../ui/ImageDropzone";

export type NewsEventOption = {
  id: string;
  title: string;
};

type NewsArticleDrawerProps = {
  open: boolean;
  siteId: string;
  article: SiteNewsItem | null;
  events: NewsEventOption[];
  onClose: () => void;
  onSaved: () => void;
};

type NewsFormState = {
  featuredImagePath: string;
  featuredImageUrl: string;
  headline: string;
  slug: string;
  excerpt: string;
  description: string;
  linkedEventId: string;
  status: SiteNewsStatus;
};

function blankForm(): NewsFormState {
  return {
    featuredImagePath: "",
    featuredImageUrl: "",
    headline: "",
    slug: "",
    excerpt: "",
    description: "",
    linkedEventId: "",
    status: "draft",
  };
}

function formFromArticle(article: SiteNewsItem): NewsFormState {
  return {
    featuredImagePath: siteNewsImagePath(article.featured_image),
    featuredImageUrl: siteNewsImageUrl(article.featured_image),
    headline: article.headline ?? "",
    slug: article.slug ?? "",
    excerpt: article.excerpt ?? "",
    description: article.description ?? "",
    linkedEventId:
      article.linked_event_id !== undefined && article.linked_event_id !== null
        ? String(article.linked_event_id)
        : "",
    status: article.status === "published" ? "published" : "draft",
  };
}

export function NewsArticleDrawer({
  open,
  siteId,
  article,
  events,
  onClose,
  onSaved,
}: NewsArticleDrawerProps) {
  const [form, setForm] = useState<NewsFormState>(blankForm);
  const [slugCustomized, setSlugCustomized] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [uploadMedia] = useUploadMediaMutation();
  const [createNews, { isLoading: isCreating }] =
    useCreateOrganisationSiteNewsMutation();
  const [updateNews, { isLoading: isUpdating }] =
    useUpdateOrganisationSiteNewsMutation();
  const [manageStatus, { isLoading: isUpdatingStatus }] =
    useManageOrganisationSiteNewsStatusMutation();

  const isEditing = Boolean(article);
  const isSubmitting =
    isCreating || isUpdating || isUpdatingStatus || uploadingImage;

  useEffect(() => {
    if (!open) return;
    if (article) {
      setForm(formFromArticle(article));
      setSlugCustomized(Boolean(article.slug));
      return;
    }
    setForm(blankForm());
    setSlugCustomized(false);
  }, [open, article]);

  const eventOptions = useMemo(
    () => [
      { value: "", label: "No linked event" },
      ...events.map((event) => ({
        value: event.id,
        label: event.title,
      })),
    ],
    [events],
  );

  function patch(partial: Partial<NewsFormState>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  function handleHeadlineChange(headline: string) {
    setForm((current) => ({
      ...current,
      headline,
      slug: slugCustomized ? current.slug : slugifyHeadline(headline),
    }));
  }

  async function uploadFeaturedImage(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file || uploadingImage || isSubmitting) return;
    const error = validateImageFile(file);
    if (error) {
      appToast.error(error);
      return;
    }

    setUploadingImage(true);
    try {
      const result = await uploadMedia({
        file,
        context: "news-featured",
      }).unwrap();
      patch({
        featuredImagePath: result.data.path,
        featuredImageUrl: result.data.url,
      });
      appToast.success("Featured image uploaded.");
    } catch {
      // Error toast from media upload mutation.
    } finally {
      setUploadingImage(false);
    }
  }

  function clearFeaturedImage() {
    if (isSubmitting) return;
    patch({
      featuredImagePath: "",
      featuredImageUrl: "",
    });
  }

  const canSave = form.headline.trim().length > 0 && !isSubmitting;

  async function handleSubmit() {
    if (!canSave) return;
    if (!isApiSiteId(siteId)) return;

    const headline = form.headline.trim();
    const slug = form.slug.trim() || slugifyHeadline(headline);
    const excerpt = form.excerpt.trim() || null;
    const description = form.description.trim() || null;
    const featuredImage = form.featuredImagePath.trim()
      ? form.featuredImagePath.trim()
      : null;
    const linkedEventId = form.linkedEventId.trim()
      ? Number(form.linkedEventId)
      : null;
    const linked =
      linkedEventId !== null && Number.isFinite(linkedEventId)
        ? linkedEventId
        : null;

    try {
      if (!isEditing || !article) {
        await createNews({
          site_id: Number(siteId),
          featured_image: featuredImage,
          headline,
          slug,
          excerpt,
          description,
          linked_event_id: linked,
          status: form.status,
        }).unwrap();
      } else {
        await updateNews({
          newsId: article.id,
          body: {
            site_id: Number(siteId),
            featured_image: featuredImage,
            headline,
            slug,
            excerpt,
            description,
            linked_event_id: linked,
          },
        }).unwrap();

        const previousStatus =
          article.status === "published" ? "published" : "draft";
        if (form.status !== previousStatus) {
          await manageStatus({
            newsId: article.id,
            body: { status: form.status },
          }).unwrap();
        }
      }

      onSaved();
      onClose();
    } catch {
      // Toast handled by mutations.
    }
  }

  return (
    <SideDrawer
      isOpen={open}
      onClose={onClose}
      title={isEditing ? "Update news story" : "Create news story"}
      subtitle={
        isEditing
          ? "Update image, headline, content, linked event, and status."
          : "Add image, headline, content, linked event, and status."
      }
      cancelLabel="Cancel"
      onCancel={onClose}
      submitLabel="Save"
      isSubmitting={isSubmitting}
      onSubmit={() => {
        void handleSubmit();
      }}
    >
      <div className="csp-news-drawer-form">
        <div>
          <span className="input-heading">Featured image</span>
          <ImageDropzone
            id="csp-news-drawer-image"
            previewUrl={form.featuredImageUrl || undefined}
            emptyTitle={uploadingImage ? "Uploading…" : "Add featured image"}
            filledTitle="Change image"
            hint="JPG, PNG or WebP · under 5 MB"
            previewAlt="Featured image"
            previewShape="banner"
            onFiles={(files) => {
              void uploadFeaturedImage(files);
            }}
            onClear={clearFeaturedImage}
          />
        </div>

        <label>
          <span className="input-heading">Headline *</span>
          <input
            className="csp-input"
            value={form.headline}
            placeholder="Story headline"
            disabled={isSubmitting}
            onChange={(event) => handleHeadlineChange(event.target.value)}
          />
        </label>

        <label>
          <span className="input-heading">Slug</span>
          <input
            className="csp-input"
            value={form.slug}
            placeholder="auto-generated-from-headline"
            disabled={isSubmitting}
            onChange={(event) => {
              setSlugCustomized(true);
              patch({
                slug: slugifyHeadline(event.target.value) || event.target.value,
              });
            }}
          />
        </label>

        <RichTextEditor
          id="csp-news-excerpt"
          label="Excerpt"
          labelClassName="input-heading mb-1 block"
          valueHtml={form.excerpt}
          onChangeHtml={(html) => patch({ excerpt: html })}
          placeholder="Short summary shown on cards…"
          minHeightClassName="min-h-[100px]"
        />

        <RichTextEditor
          id="csp-news-description"
          label="Description"
          labelClassName="input-heading mb-1 block"
          valueHtml={form.description}
          onChangeHtml={(html) => patch({ description: html })}
          placeholder="Full story…"
          minHeightClassName="min-h-[180px]"
        />

        <SelectField
          id="csp-news-linked-event"
          label="Linked event"
          labelClassName="input-heading"
          value={form.linkedEventId}
          placeholder="No linked event"
          options={eventOptions}
          disabled={isSubmitting}
          onChange={(event) => patch({ linkedEventId: event.target.value })}
        />

        <SelectField
          id="csp-news-status"
          label="Status"
          labelClassName="input-heading"
          value={form.status}
          disabled={isSubmitting}
          options={[
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
          ]}
          onChange={(event) =>
            patch({ status: event.target.value as SiteNewsStatus })
          }
        />
      </div>
    </SideDrawer>
  );
}
