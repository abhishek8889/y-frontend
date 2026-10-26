import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";

export type PlatformOrganisation = {
  id: number;
  unique_id: string;
  organiser_name: string | null;
  name: string;
  email: string | null;
  country_calling_code?: string | null;
  country_code?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  address1?: string | null;
  address2?: string | null;
  postal_code?: string | null;
  website?: string | null;
  logo?: string | null;
  banner?: string | null;
  description?: string | null;
  complete_status?: boolean | null;
  approve_status?: boolean | null;
  approve_status_reason?: string | null;
};

export type PlatformOrganisationListResponse = {
  success: boolean;
  message: string;
  data: PlatformOrganisation[];
};

export type ManageOrganisationApproveStatusPayload = {
  organisation_id: number;
  /** 1 = Approve, 2 = Reject */
  approve_status: 1 | 2;
};

export type ManageOrganisationApproveStatusResponse = {
  success: boolean;
  message: string;
  data?: PlatformOrganisation | null;
};

export function organisationApproveLabel(approveStatus: boolean | null | undefined) {
  return approveStatus ? "Active" : "Pending";
}

export function organisationLocation(org: PlatformOrganisation) {
  return [org.city, org.country].filter(Boolean).join(", ") || "—";
}

export const platformOrganisationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPlatformOrganisationList: build.query<PlatformOrganisationListResponse, void>({
      query: () => ({
        url: "platform/organisation/list",
        method: "GET",
      }),
      providesTags: ["PlatformOrganisations"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    manageOrganisationApproveStatus: build.mutation<
      ManageOrganisationApproveStatusResponse,
      ManageOrganisationApproveStatusPayload
    >({
      query: (body) => ({
        url: "platform/organisation/manage-approve-status",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PlatformOrganisations"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
  }),
});

export const {
  useGetPlatformOrganisationListQuery,
  useManageOrganisationApproveStatusMutation,
} = platformOrganisationsApi;
