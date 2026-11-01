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
  domain?: string | OrganisationSiteDomain | null;
  logo?: OrganisationSiteMedia;
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

export type UpdateOrganisationSitePayload = {
  name?: string;
  domain?: string | null;
  site_template_id?: number | string | null;
  logo?: string | null;
  favicon?: string | null;
  header?: Record<string, unknown> | null;
  footer?: Record<string, unknown> | null;
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
  data: OrganisationSite[];
};

export type CreateOrganisationSitePayload = {
  name: string;
  /** Omit or null on first create — domain is connected later (publish / Domain step). */
  domain?: string | null;
  site_type: "club" | string;
  site_template_id: string | null;
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
  response: CreateOrganisationSiteResponse | undefined,
): SiteDnsRecord[] {
  if (!response?.data) return [];
  const top = response.data.dns_records;
  if (Array.isArray(top) && top.length) return top;
  const domain = response.data.site?.domain;
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
    updateOrganisationSiteAssets: build.mutation<
      UpdateOrganisationSiteResponse,
      { siteId: string; body: Pick<UpdateOrganisationSitePayload, "logo" | "favicon"> }
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
  useUpdateOrganisationSiteAssetsMutation,
} = siteApi;
