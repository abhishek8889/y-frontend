import { baseApi } from "@/lib/store/baseApi";

/**
 * Starter events API.
 * Replace response types and paths when backend contracts are ready.
 */
export type EventListItem = {
  id: string;
  title: string;
  category?: string;
  venue?: string;
  startDateTime?: string;
};

export type EventsListResponse = {
  data: EventListItem[];
};

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEvents: build.query<EventsListResponse, { search?: string } | void>({
      query: (params) => {
        const search = params && "search" in params ? params.search : undefined;
        return {
          url: "events",
          params: search ? { search } : undefined,
        };
      },
      providesTags: ["Events"],
    }),
    getEventById: build.query<EventListItem, string>({
      query: (id) => `events/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Events", id }],
    }),
  }),
});

export const { useGetEventsQuery, useGetEventByIdQuery } = eventsApi;
