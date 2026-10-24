import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";
import type { AuthUser } from "@/lib/auth/session";
import type { PermissionMap } from "@/lib/auth/permissions";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: AuthUser;
  };
};

export type SendPublicLoginOtpRequest = {
  email: string;
  phone: string;
  country_code: string;
  first_name?: string;
  last_name?: string;
};

export type SendPublicLoginOtpResponse = {
  success: boolean;
  message: string;
  data: {
    email: string;
  };
};

export type VerifyPublicLoginOtpRequest = {
  email: string;
  otp: string;
};

export type AboutMeOrganisation = {
  id?: number;
  name?: string | null;
  logo?: string | null;
  profile_image?: string | null;
};

export type AboutMeUser = AuthUser & {
  organisation_approve_status?: boolean;
  permissions?: PermissionMap;
  /** Flat organisation name when API does not nest `organisation`. */
  organisation_name?: string | null;
  organisation?: AboutMeOrganisation | null;
};

export type AboutMeResponse = {
  success: boolean;
  message: string;
  data: {
    user: AboutMeUser;
  };
};

export type ProfileDetails = {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  country_code?: string | null;
  country?: string | null;
  profile_image?: string | null;
  status?: string | null;
};

export type ProfileResponse = {
  success: boolean;
  message: string;
  data: ProfileDetails;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "organisation/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, {
          error: true,
        });
      },
    }),
    platformLogin: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "platform/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, {
          error: true,
        });
      },
    }),
    sendPublicLoginOtp: build.mutation<SendPublicLoginOtpResponse, SendPublicLoginOtpRequest>({
      query: (body) => ({
        url: "public/send-login-otp",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, {
          success: true,
          error: true,
        });
      },
    }),
    verifyPublicLoginOtp: build.mutation<LoginResponse, VerifyPublicLoginOtpRequest>({
      query: (body) => ({
        url: "public/verify-login-otp",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, {
          success: true,
          error: true,
        });
      },
    }),
    getAboutMe: build.query<AboutMeResponse, void>({
      query: () => "about-me",
      providesTags: ["Auth"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
    getProfile: build.query<ProfileResponse, void>({
      query: () => "profile/details",
      providesTags: ["Auth"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
  }),
});

export const {
  useLoginMutation,
  usePlatformLoginMutation,
  useSendPublicLoginOtpMutation,
  useVerifyPublicLoginOtpMutation,
  useGetAboutMeQuery,
  useGetProfileQuery,
  useLazyGetProfileQuery,
} = authApi;
