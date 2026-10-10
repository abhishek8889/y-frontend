import { baseApi } from "@/lib/store/baseApi";
import type { AuthUser } from "@/lib/auth/session";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterOrganiserRequest = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code: string;
  country: string;
  password: string;
  confirm_password: string;
  org_organiser_name: string;
  org_name: string;
  org_email: string;
  org_country_calling_code: string;
  org_country_code: string;
  org_phone: string;
  org_country: string;
  org_city: string;
  org_address1: string;
  org_address2: string;
  org_postal_code: string;
};

export type RegisterOrganiserResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

export type VerifyOrganiserEmailRequest = {
  email: string;
  otp: string;
};

export type VerifyOrganiserEmailResponse = {
  success?: boolean;
  message?: string;
  data?: {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: AuthUser;
  };
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

export type AboutMeUser = AuthUser & {
  organisation_approve_status?: boolean;
  permissions?: Record<string, string[]>;
};

export type AboutMeResponse = {
  success: boolean;
  message: string;
  data: {
    user: AboutMeUser;
  };
};

export type ProfileResponse = AuthUser;

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    registerOrganiser: build.mutation<
      RegisterOrganiserResponse,
      RegisterOrganiserRequest
    >({
      query: (body) => ({
        url: "organiser/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    verifyOrganiserEmail: build.mutation<
      VerifyOrganiserEmailResponse,
      VerifyOrganiserEmailRequest
    >({
      query: (body) => ({
        url: "organiser/verify-email",
        method: "POST",
        body,
      }),
    }),
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "organisation/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    getAboutMe: build.query<AboutMeResponse, void>({
      query: () => "about-me",
      providesTags: ["Auth"],
    }),
    getProfile: build.query<ProfileResponse, void>({
      query: () => "get-profile",
      providesTags: ["Auth"],
    }),
  }),
});

export const {
  useRegisterOrganiserMutation,
  useVerifyOrganiserEmailMutation,
  useLoginMutation,
  useGetAboutMeQuery,
  useGetProfileQuery,
  useLazyGetProfileQuery,
} = authApi;
