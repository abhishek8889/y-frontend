import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";

export type SiteFeatureToggle = "on" | "off";

export type SiteFeatureObject = {
  event_category: SiteFeatureToggle | string;
  news_category: SiteFeatureToggle | string;
};

export type SiteCategoryType = "events" | "news";

export type SiteCategoryItem = {
  id?: number | string;
  site_id?: number | string;
  category_type: SiteCategoryType | string;
  category_id: number | string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SiteCategoryShowResponse = {
  success: boolean;
  message: string;
  data: {
    feature_object: SiteFeatureObject;
    categories: SiteCategoryItem[];
  };
};

export type UpdateSiteCategoryPayload = {
  site_id: number;
  feature_object: {
    event_category: SiteFeatureToggle;
    news_category: SiteFeatureToggle;
  };
  categories: Array<{
    category_type: SiteCategoryType;
    category_id: number;
  }>;
};

export type SiteCategoryUpdateResponse = {
  success: boolean;
  message: string;
  data: {
    feature_object: SiteFeatureObject;
    categories: SiteCategoryItem[];
  };
};

export const siteCategoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrganisationSiteCategory: build.query<
      SiteCategoryShowResponse,
      { site_id: number | string }
    >({
      query: ({ site_id }) => ({
        url: `organisation/site/category?site_id=${encodeURIComponent(String(site_id))}`,
        method: "GET",
      }),
      providesTags: (_result, _error, arg) => [
        { type: "OrganisationSiteCategory", id: String(arg.site_id) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    updateOrganisationSiteCategory: build.mutation<
      SiteCategoryUpdateResponse,
      UpdateSiteCategoryPayload
    >({
      query: (body) => ({
        url: "organisation/site/category-update",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "OrganisationSiteCategory", id: String(arg.site_id) },
        { type: "OrganisationSites", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
  }),
});

export const {
  useGetOrganisationSiteCategoryQuery,
  useUpdateOrganisationSiteCategoryMutation,
} = siteCategoryApi;
