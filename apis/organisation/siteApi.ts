import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";

/** DNS instruction returned on site create / domain setup. */
export type SiteDnsRecord = {
  purpose?: string | null;
  type: string;
  name: string;
  value: string;
};

export type OrganisationSiteDomain = {
  id?: number | string;
  site_id?: number | string;
  hostname?: string | null;
  status?: string | null;
  vercel_added?: boolean | null;
  dns_instructions?: SiteDnsRecord[] | null;
  verified_at?: string | null;
  activated_at?: string | null;
  last_error?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type OrganisationSiteMedia =
  | string
  | {
      path?: string | null;
      url?: string | null;
      name?: string | null;
    }
  | null;

/** Fixed navigation item shape stored on `sites.navigation`. */
export type SiteNavigationItem = {
  name: string;
  redirect_link: string;
};

/** Site row from `organisation/site/list` — fields may grow; map defensively. */
export type OrganisationSite = {
  id: number | string;
  unique_id?: string | null;
  organisation_id?: number | string | null;
  name?: string | null;
  title?: string | null;
  slug?: string | null;
  status?: string | null;
  kind?: string | null;
  type?: string | null;
  site_type?: string | null;
  /** Top-level hostname from list resource (mirrors domain.hostname). */
  hostname?: string | null;
  domain?: string | OrganisationSiteDomain | null;
  logo?: OrganisationSiteMedia;
  navigation?: SiteNavigationItem[] | null;
  feature_object?: {
    event_category?: string;
    news_category?: string;
  } | null;
  favicon?: OrganisationSiteMedia;
  header?: Record<string, unknown> | null;
  footer?: Record<string, unknown> | null;
  branding_complete?: boolean | null;
  template_name?: string | null;
  site_template_id?: string | number | null;
  created_at?: string | null;
  createdAt?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
};

/** Patch body for `organisation/site/update/{id}` — only include keys to change. */
export type UpdateOrganisationSitePayload = {
  name?: string;
  logo?: string | null;
  navigation?: SiteNavigationItem[] | null;
  status?: "draft" | "active" | "disabled";
};

export type UpdateOrganisationSiteResponse = {
  success: boolean;
  message: string;
  data?: {
    site?: OrganisationSite;
    dns_records?: SiteDnsRecord[] | null;
    verified?: boolean | null;
  } & OrganisationSite;
};

export type OrganisationSiteListResponse = {
  success: boolean;
  message: string;
  data: {
    sites: OrganisationSite[];
  };
};

/** Normalize list payload — API returns `{ sites: [...] }`. */
export function extractOrganisationSites(
  response: OrganisationSiteListResponse | undefined,
): OrganisationSite[] {
  const payload = response?.data as
    | OrganisationSite[]
    | { sites?: OrganisationSite[] }
    | undefined;
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.sites)) return payload.sites;
  return [];
}

export type CreateOrganisationSitePayload = {
  name: string;
  /** Domain hostname only (e.g. club.example.com) — no scheme or path. */
  hostname: string;
  template_id?: number | null;
};

export type CreateOrganisationSiteResponse = {
  success: boolean;
  message: string;
  data: {
    site: OrganisationSite;
    dns_records?: SiteDnsRecord[] | null;
    verified?: boolean;
  };
};

export type UpdateOrganisationSiteDomainResponse = {
  success: boolean;
  message: string;
  data: {
    site: OrganisationSite;
    dns_records?: SiteDnsRecord[] | null;
    verified?: boolean | null;
  };
};

export function extractDnsRecords(
  response:
    | CreateOrganisationSiteResponse
    | UpdateOrganisationSiteResponse
    | UpdateOrganisationSiteDomainResponse
    | undefined,
): SiteDnsRecord[] {
  if (!response?.data) return [];
  const top = response.data.dns_records;
  if (Array.isArray(top) && top.length) return top;
  const site = "site" in response.data ? response.data.site : undefined;
  const domain = site?.domain;
  if (domain && typeof domain === "object" && Array.isArray(domain.dns_instructions)) {
    return domain.dns_instructions;
  }
  return [];
}

export function extractHostname(
  response: CreateOrganisationSiteResponse | undefined,
  fallback: string,
): string {
  const domain = response?.data?.site?.domain;
  if (domain && typeof domain === "object" && typeof domain.hostname === "string" && domain.hostname.trim()) {
    return domain.hostname.trim();
  }
  return fallback;
}

export function extractCreatedSiteId(
  response: CreateOrganisationSiteResponse | undefined,
): string | null {
  const id = response?.data?.site?.id;
  if (id === undefined || id === null) return null;
  return String(id);
}

export function isApiSiteId(siteId: string | null | undefined): boolean {
  return Boolean(siteId && /^\d+$/.test(String(siteId)));
}

export function formatDomainStatusLabel(status: string | null | undefined): string {
  const raw = String(status ?? "").trim().toLowerCase();
  if (!raw) return "Unknown";
  if (raw === "pending_dns" || raw === "pending") return "Pending DNS";
  if (raw === "pending_verification") return "Pending Verification";
  if (raw === "active") return "Active";
  if (raw === "verified" || raw === "live") return "Verified";
  if (raw === "failed" || raw === "error") return "Failed";
  return raw
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const siteApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrganisationSiteList: build.query<OrganisationSiteListResponse, void>({
      query: () => ({
        url: "organisation/site/list",
        method: "GET",
      }),
      providesTags: ["OrganisationSites"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    createOrganisationSite: build.mutation<
      CreateOrganisationSiteResponse,
      CreateOrganisationSitePayload
    >({
      query: (body) => ({
        url: "organisation/site/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["OrganisationSites"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    refreshOrganisationSiteDomain: build.mutation<
      { success: boolean; message: string; data?: unknown },
      string
    >({
      query: (siteId) => ({
        url: `organisation/site/${siteId}/refresh-domain`,
        method: "POST",
      }),
      invalidatesTags: ["OrganisationSites"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    updateOrganisationSiteDomain: build.mutation<
      UpdateOrganisationSiteDomainResponse,
      { siteId: string; domain: string }
    >({
      query: ({ siteId, domain }) => ({
        url: `organisation/site/${siteId}/update-domain`,
        method: "POST",
        body: { domain },
      }),
      invalidatesTags: ["OrganisationSites"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    /** Publish by setting status=active on update — branding must already be complete. */
    publishOrganisationSite: build.mutation<UpdateOrganisationSiteResponse, string>({
      query: (siteId) => ({
        url: `organisation/site/update/${siteId}`,
        method: "POST",
        body: { status: "active" },
      }),
      invalidatesTags: ["OrganisationSites"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    updateOrganisationSite: build.mutation<
      UpdateOrganisationSiteResponse,
      { siteId: string; body: UpdateOrganisationSitePayload }
    >({
      query: ({ siteId, body }) => ({
        url: `organisation/site/update/${siteId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["OrganisationSites"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
  }),
});

export const {
  useGetOrganisationSiteListQuery,
  useCreateOrganisationSiteMutation,
  useRefreshOrganisationSiteDomainMutation,
  useUpdateOrganisationSiteDomainMutation,
  usePublishOrganisationSiteMutation,
  useUpdateOrganisationSiteMutation,
} = siteApi;
