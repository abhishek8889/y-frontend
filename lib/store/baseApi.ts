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

const rawBaseQuery = fetchBaseQuery({
  baseUrl: normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL),
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

function isApiFailureBody(data: unknown): data is { success: false; message?: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    (data as { success?: unknown }).success === false
  );
}

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const requestUrl = typeof args === "string" ? args : args.url;
  const authRequestPrefixes = [
    "organisation/login",
    "platform/login",
    "public/send-login-otp",
    "public/verify-login-otp",
  ];
  const isAuthRequest = authRequestPrefixes.some(
    (prefix) => requestUrl === prefix || requestUrl.startsWith(`${prefix}?`),
  );

  if (result.error?.status === 401 && !isAuthRequest) {
    clearAuthSession();

    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  // Backend often returns HTTP 2xx with `{ success: false, message }` for business errors.
  // Treat those as RTK Query errors so withQueryToast / unwrap() surface the message.
  if (!result.error && isApiFailureBody(result.data)) {
    return {
      error: {
        status: "CUSTOM_ERROR",
        data: result.data,
        error:
          typeof result.data.message === "string" && result.data.message.trim()
            ? result.data.message
            : "Request failed",
      },
    };
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "Auth",
    "Events",
    "EventCategories",
    "EventTickets",
    "Venues",
    "venuePageOverview",
    "Customers",
    "Roles",
    "RolePermissions",
    "PublicEvents",
    "Wishlist",
  ],
  endpoints: () => ({}),
});
