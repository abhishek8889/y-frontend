import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";

export type SiteSupportContactStatus = "active" | "inactive";

export type SiteSupportContactItem = {
  id: number | string;
  site_id: number | string;
  department_name: string;
  email?: string | null;
  phone?: string | null;
  status: SiteSupportContactStatus | string;
  created_by?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SiteSupportContactListParams = {
  site_id?: number | string;
  status?: SiteSupportContactStatus | string;
  search?: string;
  per_page?: number;
  cursor?: string;
};

export type SiteSupportContactListResponse = {
  success: boolean;
  message: string;
  data: {
    items: SiteSupportContactItem[];
    pagination: {
      per_page: number;
      next_cursor: string | null;
      prev_cursor: string | null;
      has_more: boolean;
    };
  };
};

export type CreateSiteSupportContactPayload = {
  site_id: number;
  department_name: string;
  email?: string | null;
  phone?: string | null;
  status?: SiteSupportContactStatus;
};

export type UpdateSiteSupportContactPayload = {
  site_id?: number;
  department_name?: string;
  email?: string | null;
  phone?: string | null;
  status?: SiteSupportContactStatus;
};

export type SiteSupportContactMutationResponse = {
  success: boolean;
  message: string;
  data: {
    contact: SiteSupportContactItem;
  };
};

export const SITE_SUPPORT_CONTACT_PAGE_SIZE = 9;

export const siteSupportContactApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrganisationSiteSupportContactList: build.query<
      SiteSupportContactListResponse,
      SiteSupportContactListParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        const perPage = params?.per_page ?? SITE_SUPPORT_CONTACT_PAGE_SIZE;
        searchParams.set("per_page", String(perPage));
        if (params?.site_id !== undefined && params.site_id !== "") {
          searchParams.set("site_id", String(params.site_id));
        }
        if (params?.status) searchParams.set("status", String(params.status));
        if (params?.search?.trim()) searchParams.set("search", params.search.trim());
        if (params?.cursor) searchParams.set("cursor", params.cursor);

        const qs = searchParams.toString();
        return {
          url: `organisation/site/support-contact/list${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data?.items?.length
          ? [
              ...result.data.items.map((item) => ({
                type: "OrganisationSiteSupportContacts" as const,
                id: String(item.id),
              })),
              { type: "OrganisationSiteSupportContacts", id: "LIST" },
            ]
          : [{ type: "OrganisationSiteSupportContacts", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    createOrganisationSiteSupportContact: build.mutation<
      SiteSupportContactMutationResponse,
      CreateSiteSupportContactPayload
    >({
      query: (body) => ({
        url: "organisation/site/support-contact/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "OrganisationSiteSupportContacts", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    updateOrganisationSiteSupportContact: build.mutation<
      SiteSupportContactMutationResponse,
      { contactId: string | number; body: UpdateSiteSupportContactPayload }
    >({
      query: ({ contactId, body }) => ({
        url: `organisation/site/support-contact/update/${contactId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "OrganisationSiteSupportContacts", id: String(arg.contactId) },
        { type: "OrganisationSiteSupportContacts", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    deleteOrganisationSiteSupportContact: build.mutation<
      { success: boolean; message: string; data?: { deleted?: boolean } },
      string | number
    >({
      query: (contactId) => ({
        url: `organisation/site/support-contact/delete/${contactId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, contactId) => [
        { type: "OrganisationSiteSupportContacts", id: String(contactId) },
        { type: "OrganisationSiteSupportContacts", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
  }),
});

export const {
  useGetOrganisationSiteSupportContactListQuery,
  useLazyGetOrganisationSiteSupportContactListQuery,
  useCreateOrganisationSiteSupportContactMutation,
  useUpdateOrganisationSiteSupportContactMutation,
  useDeleteOrganisationSiteSupportContactMutation,
} = siteSupportContactApi;
