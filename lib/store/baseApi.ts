import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { clearAuthSession } from "@/lib/api/authStorage";
import { getAuthToken } from "@/lib/api/token";

function normalizeBaseUrl(url: string | undefined) {
  if (!url) return "";
  return url.endsWith("/") ? url : `${url}/`;
}

const apiBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  prepareHeaders: (headers) => {
    const token = getAuthToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Accept", "application/json");
    // Ngrok free tier interstitial bypass for local/API testing.
    headers.set("ngrok-skip-browser-warning", "true");
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  if (!apiBaseUrl) {
    return {
      error: {
        status: "CUSTOM_ERROR",
        error:
          "API is not configured. Set NEXT_PUBLIC_API_BASE_URL to your backend API URL and restart the app.",
      },
    };
  }

  const result = await rawBaseQuery(args, api, extraOptions);
  const requestUrl = typeof args === "string" ? args : args.url;
  const isAuthRequest =
    requestUrl === "organisation/login" ||
    requestUrl.startsWith("organisation/login?") ||
    requestUrl === "organiser/register" ||
    requestUrl.startsWith("organiser/register?");

  if (result.error?.status === 401 && !isAuthRequest) {
    clearAuthSession();

    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Auth", "Events", "Venues", "Customers"],
  endpoints: () => ({}),
});
