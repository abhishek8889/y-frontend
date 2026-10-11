import { withQueryToast } from "@/lib/api/queryToast";
import { baseApi } from "@/lib/store/baseApi";

export type MediaUploadData = {
  path: string;
  url: string;
  mime: string | null;
  size: number;
  original_name: string;
  driver: string;
};

export type MediaUploadResponse = {
  success: boolean;
  message: string;
  data: MediaUploadData;
};

export type UploadMediaArgs = {
  file: File;
  context?: string;
};

export const mediaApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    uploadMedia: build.mutation<MediaUploadResponse, UploadMediaArgs>({
      query: ({ file, context }) => {
        const body = new FormData();
        body.append("file", file);
        if (context) body.append("context", context);

        return {
          url: "media/upload",
          method: "POST",
          body,
        };
      },
      async onQueryStarted(_, { queryFulfilled }) {
        await withQueryToast(queryFulfilled, { error: true });
      },
    }),
  }),
});

export const { useUploadMediaMutation } = mediaApi;
