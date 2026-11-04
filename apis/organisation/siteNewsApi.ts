import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";

export type SiteNewsStatus = "draft" | "published";

export type SiteNewsLinkedEvent = {
  id: number | string;
  unique_id?: string | null;
  name?: string | null;
  status?: string | null;
};

export type SiteNewsMedia =
  | string
  | {
      path?: string | null;
      url?: string | null;
    }
  | null;

export type SiteNewsItem = {
  id: number | string;
  organisation_id?: number | string | null;
  site_id?: number | string | null;
  featured_image?: SiteNewsMedia;
  headline: string;
  slug: string;
  excerpt?: string | null;
  description?: string | null;
  linked_event_id?: number | string | null;
  status: SiteNewsStatus | string;
  published_at?: string | null;
  created_by?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  linked_event?: SiteNewsLinkedEvent | null;
};

export function siteNewsImagePath(value: SiteNewsMedia | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  return typeof value.path === "string" ? value.path.trim() : "";
}

export function siteNewsImageUrl(value: SiteNewsMedia | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value.url === "string" && value.url.trim()) return value.url.trim();
  return typeof value.path === "string" ? value.path.trim() : "";
}

export type SiteNewsListParams = {
  site_id?: number | string;
  status?: SiteNewsStatus | string;
  search?: string;
  per_page?: number;
  cursor?: string;
};

export type SiteNewsListResponse = {
  success: boolean;
  message: string;
  data: {
    items: SiteNewsItem[];
    pagination: {
      per_page: number;
      next_cursor: string | null;
      prev_cursor: string | null;
      has_more: boolean;
    };
  };
};

export type CreateSiteNewsPayload = {
  site_id?: number | null;
  featured_image?: string | null;
  headline: string;
  slug?: string | null;
  excerpt?: string | null;
  description?: string | null;
  linked_event_id?: number | null;
  status?: SiteNewsStatus;
  published_at?: string | null;
};

export type UpdateSiteNewsPayload = {
  site_id?: number | null;
  featured_image?: string | null;
  headline?: string;
  slug?: string | null;
  excerpt?: string | null;
  description?: string | null;
  linked_event_id?: number | null;
};

export type ManageSiteNewsStatusPayload = {
  status: SiteNewsStatus;
  published_at?: string | null;
};

export type SiteNewsMutationResponse = {
  success: boolean;
  message: string;
  data: {
    news: SiteNewsItem;
  };
};

export const SITE_NEWS_PAGE_SIZE = 9;

export const siteNewsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrganisationSiteNewsList: build.query<SiteNewsListResponse, SiteNewsListParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        const perPage = params?.per_page ?? SITE_NEWS_PAGE_SIZE;
        searchParams.set("per_page", String(perPage));
        if (params?.site_id !== undefined && params.site_id !== "") {
          searchParams.set("site_id", String(params.site_id));
        }
        if (params?.status) searchParams.set("status", String(params.status));
        if (params?.search?.trim()) searchParams.set("search", params.search.trim());
        if (params?.cursor) searchParams.set("cursor", params.cursor);

        const qs = searchParams.toString();
        return {
          url: `organisation/site/news/list${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data?.items?.length
          ? [
              ...result.data.items.map((item) => ({
                type: "OrganisationSiteNews" as const,
                id: String(item.id),
              })),
              { type: "OrganisationSiteNews", id: "LIST" },
            ]
          : [{ type: "OrganisationSiteNews", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    createOrganisationSiteNews: build.mutation<
      SiteNewsMutationResponse,
      CreateSiteNewsPayload
    >({
      query: (body) => ({
        url: "organisation/site/news/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "OrganisationSiteNews", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    updateOrganisationSiteNews: build.mutation<
      SiteNewsMutationResponse,
      { newsId: string | number; body: UpdateSiteNewsPayload }
    >({
      query: ({ newsId, body }) => ({
        url: `organisation/site/news/update/${newsId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "OrganisationSiteNews", id: String(arg.newsId) },
        { type: "OrganisationSiteNews", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    manageOrganisationSiteNewsStatus: build.mutation<
      SiteNewsMutationResponse,
      { newsId: string | number; body: ManageSiteNewsStatusPayload }
    >({
      query: ({ newsId, body }) => ({
        url: `organisation/site/news/manage-status/${newsId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "OrganisationSiteNews", id: String(arg.newsId) },
        { type: "OrganisationSiteNews", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    deleteOrganisationSiteNews: build.mutation<
      { success: boolean; message: string; data?: { deleted?: boolean } },
      string | number
    >({
      query: (newsId) => ({
        url: `organisation/site/news/delete/${newsId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, newsId) => [
        { type: "OrganisationSiteNews", id: String(newsId) },
        { type: "OrganisationSiteNews", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
  }),
});

export const {
  useGetOrganisationSiteNewsListQuery,
  useLazyGetOrganisationSiteNewsListQuery,
  useCreateOrganisationSiteNewsMutation,
  useUpdateOrganisationSiteNewsMutation,
  useManageOrganisationSiteNewsStatusMutation,
  useDeleteOrganisationSiteNewsMutation,
} = siteNewsApi;
