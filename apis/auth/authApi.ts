import { baseApi } from "@/lib/store/baseApi";
import type { AuthUser } from "@/lib/auth/session";

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
  useLoginMutation,
  useGetAboutMeQuery,
  useGetProfileQuery,
  useLazyGetProfileQuery,
} = authApi;
