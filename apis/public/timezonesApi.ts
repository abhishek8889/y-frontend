import { baseApi } from "@/lib/store/baseApi";

export type PublicTimezone = {
  timezone: string;
  country_code: string | null;
  country: string | null;
};

export type PublicTimezonesResponse = {
  success: boolean;
  message: string;
  data: PublicTimezone[];
};

/** Extra search terms so e.g. "england" matches Europe/London. */
const TIMEZONE_SEARCH_ALIASES: Record<string, string[]> = {
  "Europe/London": ["england", "britain", "uk", "united kingdom", "great britain", "gb"],
  "Europe/Dublin": ["ireland", "eire", "irish"],
  "Europe/Paris": ["france"],
  "Europe/Berlin": ["germany", "deutschland"],
  "Europe/Madrid": ["spain", "espana"],
  "Europe/Rome": ["italy", "italia"],
  "Europe/Amsterdam": ["netherlands", "holland"],
  "America/New_York": ["usa", "united states", "east coast", "eastern"],
  "America/Chicago": ["usa", "united states", "central"],
  "America/Denver": ["usa", "united states", "mountain"],
  "America/Los_Angeles": ["usa", "united states", "west coast", "pacific", "california"],
  "Asia/Kolkata": ["india", "bharat"],
  "Asia/Dubai": ["uae", "emirates"],
  "Asia/Tokyo": ["japan"],
  "Australia/Sydney": ["australia"],
};

export function timezoneSearchKeywords(item: PublicTimezone) {
  const aliases = TIMEZONE_SEARCH_ALIASES[item.timezone] ?? [];
  return [item.timezone, item.country, item.country_code, ...aliases]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export const timezonesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPublicTimezones: build.query<PublicTimezonesResponse, void>({
      query: () => "public/timezones",
    }),
  }),
});

export const { useGetPublicTimezonesQuery } = timezonesApi;
