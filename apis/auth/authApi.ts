import { baseApi } from "@/lib/store/baseApi";
import type { AuthUser } from "@/lib/api/authStorage";

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

export type ProfileResponse = AuthUser;

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    getProfile: build.query<ProfileResponse, void>({
      query: () => "get-profile",
      providesTags: ["Auth"],
    }),
  }),
});

export const { useLoginMutation, useGetProfileQuery, useLazyGetProfileQuery } = authApi;
