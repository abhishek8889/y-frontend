const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v", ".avi", ".mkv", ".ogg"];

export type MediaLike = {
  url?: string | null;
  path?: string | null;
  mime?: string | null;
  media_type?: string | null;
};

function pathLooksLikeVideo(value: string) {
  const clean = value.split("?")[0].split("#")[0].trim().toLowerCase();
  if (!clean) return false;
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

/** True when media_type / mime / URL indicates video. */
export function isVideoMedia(media: MediaLike | null | undefined) {
  if (!media) return false;

  const mediaType = media.media_type?.trim().toLowerCase();
  // Explicit API type wins — images must never get player controls.
  if (mediaType === "image") return false;
  if (mediaType === "video") return true;

  const mime = media.mime?.trim().toLowerCase();
  if (mime?.startsWith("video/")) return true;
  if (mime?.startsWith("image/")) return false;

  return pathLooksLikeVideo(media.url || "") || pathLooksLikeVideo(media.path || "");
}
