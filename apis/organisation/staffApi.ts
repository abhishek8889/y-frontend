import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";

export type StaffMemberRole = {
  id: number | string;
  name?: string | null;
  slug?: string | null;
};

export type StaffMember = {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  country_code?: string | null;
  country?: string | null;
  description?: string | null;
  profile_image?: string | null;
  profile_image_url?: string | null;
  status?: string | null;
  role_ids?: Array<number | string> | null;
  roles?: StaffMemberRole[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  joined_at?: string | null;
};

export type StaffListParams = {
  search?: string;
  status?: "" | "active" | "inactive" | string;
  per_page?: number;
  cursor?: string;
};

export type StaffListResponse = {
  success: boolean;
  message: string;
  data: {
    items: StaffMember[];
    pagination: {
      per_page: number;
      next_cursor: string | null;
      prev_cursor: string | null;
      has_more: boolean;
    };
  };
};

export type StaffDetailsResponse = {
  success: boolean;
  message: string;
  data: StaffMember;
};

export type CreateStaffMemberPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code: string;
  country: string;
  password: string;
  confirm_password: string;
  role_ids: number[];
  status: "active" | "inactive" | string;
  profile_image?: string | null;
  description?: string | null;
};

export type UpdateStaffMemberPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code: string;
  country: string;
  password?: string;
  confirm_password?: string;
  description?: string | null;
  profile_image?: string | null;
  role_ids: number[];
  status: "active" | "inactive" | string;
};

export type ManageStaffStatusPayload = {
  status: "active" | "inactive";
};

export type StaffMutationResponse = {
  success: boolean;
  message: string;
  data: StaffMember;
};

export function staffDisplayName(member: StaffMember) {
  const fromParts = [member.first_name, member.last_name].filter(Boolean).join(" ").trim();
  if (fromParts) return fromParts;
  if (member.name?.trim()) return member.name.trim();
  return member.email?.trim() || "Staff member";
}

export function staffRoleLabels(member: StaffMember) {
  if (Array.isArray(member.roles) && member.roles.length) {
    return member.roles
      .map((role) => role.name?.trim() || String(role.id))
      .filter(Boolean)
      .join(", ");
  }
  return "—";
}

export function staffRoleIds(member: StaffMember): number[] {
  if (Array.isArray(member.role_ids) && member.role_ids.length) {
    return member.role_ids.map(Number).filter((id) => Number.isFinite(id));
  }
  if (Array.isArray(member.roles) && member.roles.length) {
    return member.roles
      .map((role) => Number(role.id))
      .filter((id) => Number.isFinite(id));
  }
  return [];
}

export const staffApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStaffMemberList: build.query<StaffListResponse, StaffListParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        searchParams.set("search", params?.search?.trim() ?? "");
        searchParams.set("status", params?.status ?? "");
        searchParams.set("per_page", String(params?.per_page ?? 10));
        if (params?.cursor) {
          searchParams.set("cursor", params.cursor);
        }

        return {
          url: `organisation/staff-member/list?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["StaffMembers"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    getStaffMemberDetails: build.query<StaffDetailsResponse, number | string>({
      query: (staffId) => ({
        url: `organisation/staff-member/details/${staffId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, staffId) => [
        { type: "StaffMembers", id: String(staffId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    createStaffMember: build.mutation<StaffMutationResponse, CreateStaffMemberPayload>({
      query: (body) => ({
        url: "organisation/staff-member/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["StaffMembers"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    updateStaffMember: build.mutation<
      StaffMutationResponse,
      { staffId: number | string; body: UpdateStaffMemberPayload }
    >({
      query: ({ staffId, body }) => ({
        url: `organisation/staff-member/update/${staffId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "StaffMembers",
        { type: "StaffMembers", id: String(arg.staffId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
    manageStaffMemberStatus: build.mutation<
      StaffMutationResponse,
      { staffId: number | string; body: ManageStaffStatusPayload }
    >({
      query: ({ staffId, body }) => ({
        url: `organisation/staff-member/manage-status/${staffId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        "StaffMembers",
        { type: "StaffMembers", id: String(arg.staffId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { success: true, error: true });
      },
    }),
  }),
});

export const {
  useGetStaffMemberListQuery,
  useGetStaffMemberDetailsQuery,
  useCreateStaffMemberMutation,
  useUpdateStaffMemberMutation,
  useManageStaffMemberStatusMutation,
} = staffApi;
