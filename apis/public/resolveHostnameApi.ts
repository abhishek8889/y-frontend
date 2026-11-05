import { baseApi } from "@/lib/store/baseApi";

export type HostType = "public" | "microsite";

export type ResolvedMedia = {
  path: string;
  url: string;
} | null;

export type ResolvedNavigationItem = {
  id?: string;
  name: string;
  redirect_link: string;
};

export type ResolvedBanner = {
  id: number;
  feature_type?: string | null;
  feature_target_id?: number | null;
  feature_image_target?: string | null;
  custom_headline?: string | null;
  image_url?: string | null;
  media_type?: "image" | "video" | string | null;
  cta_button_1_label?: string | null;
  cta_button_1_url?: string | null;
};

export type HostResolutionPayload = {
  host_type: HostType;
  hostname: string;
  organisation: {
    id: number;
    unique_id: string;
    name?: string | null;
    logo?: ResolvedMedia;
  } | null;
  site: {
    id: number;
    unique_id: string;
    name: string;
    slug?: string | null;
    status?: string | null;
    logo?: ResolvedMedia;
    navigation?: ResolvedNavigationItem[];
    feature_object?: {
      event_category?: string;
      news_category?: string;
    } | null;
  } | null;
  domain: {
    hostname: string;
    status?: string | null;
  } | null;
  banners?: ResolvedBanner[];
};

export type ResolveHostnameResponse = {
  success: boolean;
  message: string;
  data: HostResolutionPayload;
};

function normalizeApiBaseUrl(url: string | undefined) {
  if (!url) return "";
  return url.endsWith("/") ? url : `${url}/`;
}

/** Normalize a host string the same way the backend expects. */
export function normalizeHostnameParam(raw: string): string {
  let hostname = raw.trim().toLowerCase();
  hostname = hostname.replace(/^https?:\/\//, "");
  hostname = hostname.split("/")[0] ?? hostname;
  hostname = hostname.split("?")[0] ?? hostname;
  hostname = hostname.split("#")[0] ?? hostname;
  if (hostname.includes(":")) {
    hostname = hostname.split(":")[0] ?? hostname;
  }
  return hostname.replace(/\.$/, "");
}

/**
 * Server-friendly resolve (RSC / layout) — no RTK, no auth cookies required.
 */
export async function fetchResolveHostname(
  hostname: string,
  init?: RequestInit,
): Promise<HostResolutionPayload | null> {
  const trimmed = normalizeHostnameParam(hostname);
  if (!trimmed) return null;

  const base = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
  if (!base) return null;

  const url = new URL("public/resolve-hostname", base);
  url.searchParams.set("hostname", trimmed);

  try {
    const response = await fetch(url.toString(), {
      ...init,
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(init?.headers ?? {}),
      },
      next: init?.cache ? undefined : { revalidate: 60 },
    });

    if (!response.ok) return null;

    const body = (await response.json()) as ResolveHostnameResponse;
    if (!body?.success || !body.data?.host_type) return null;
    return body.data;
  } catch {
    return null;
  }
}

export const resolveHostnameApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    resolveHostname: build.query<ResolveHostnameResponse, string>({
      query: (hostname) => ({
        url: "public/resolve-hostname",
        params: { hostname: normalizeHostnameParam(hostname) },
      }),
    }),
  }),
});

export const { useResolveHostnameQuery, useLazyResolveHostnameQuery } = resolveHostnameApi;
