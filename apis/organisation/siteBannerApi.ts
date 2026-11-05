import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";

export type SiteBannerFeatureType = "events" | "news" | "custom";
export type SiteBannerImageTarget = "from_feature" | "custom_upload";

export type SiteBannerMedia =
  | string
  | {
      path?: string | null;
      url?: string | null;
    }
  | null;

export type SiteBannerItem = {
  id: number | string;
  site_id: number | string;
  feature_type: SiteBannerFeatureType | string;
  feature_target_id?: number | string | null;
  feature_image_target: SiteBannerImageTarget | string;
  custom_headline?: string | null;
  image_url?: SiteBannerMedia;
  cta_button_1_label?: string | null;
  cta_button_1_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export function siteBannerImagePath(value: SiteBannerMedia | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  return typeof value.path === "string" ? value.path.trim() : "";
}

export function siteBannerImageUrl(value: SiteBannerMedia | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value.url === "string" && value.url.trim()) return value.url.trim();
  return typeof value.path === "string" ? value.path.trim() : "";
}

export type SaveSiteBannerPayload = {
  site_id: number;
  feature_type: SiteBannerFeatureType;
  feature_target_id?: number | null;
  feature_image_target: SiteBannerImageTarget;
  custom_headline?: string | null;
  image_url?: string | null;
  cta_button_1_label?: string | null;
  cta_button_1_url?: string | null;
};

export type SiteBannerShowResponse = {
  success: boolean;
  message: string;
  data: {
    banner: SiteBannerItem | null;
  };
};

export type SiteBannerSaveResponse = {
  success: boolean;
  message: string;
  data: {
    banner: SiteBannerItem;
  };
};

export const siteBannerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrganisationSiteBanner: build.query<
      SiteBannerShowResponse,
      { site_id: number | string }
    >({
      query: ({ site_id }) => ({
        url: `organisation/site/banner?site_id=${encodeURIComponent(String(site_id))}`,
        method: "GET",
      }),
      providesTags: (_result, _error, arg) => [
        { type: "OrganisationSiteBanner", id: String(arg.site_id) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    saveOrganisationSiteBanner: build.mutation<
      SiteBannerSaveResponse,
      SaveSiteBannerPayload
    >({
      query: (body) => ({
        url: "organisation/site/banner/save",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "OrganisationSiteBanner", id: String(arg.site_id) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
  }),
});

export const {
  useGetOrganisationSiteBannerQuery,
  useSaveOrganisationSiteBannerMutation,
} = siteBannerApi;
