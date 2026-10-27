import type { MediaPlayerMedia } from "@/components/common/MediaPlayer";

export type GalleryMediaItem = MediaPlayerMedia & {
  alt?: string | null;
  id?: number | string;
  path?: string | null;
};

export type MediaGalleryLightboxProps = {
  open: boolean;
  /** Index of the slide to open on. */
  index: number;
  items: GalleryMediaItem[];
  onClose: () => void;
};
