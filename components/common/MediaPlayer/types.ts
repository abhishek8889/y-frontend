import type { ReactNode } from "react";
import type { MediaLike } from "@/lib/media/isVideoMedia";

export type MediaPlayerMedia = MediaLike & {
  url?: string | null;
};

export type MediaPlayerProps = {
  /** Image or video media. Detection uses media_type, mime, then URL/path. */
  media: MediaPlayerMedia | null | undefined;
  alt?: string;
  /**
   * When true and media is video, autoplay muted.
   * When false, video stays paused at the start (controls still shown).
   */
  active?: boolean;
  /**
   * Show pause/mute/progress controls. Only applies to video.
   * Images never show controls. Default true for video.
   */
  controls?: boolean;
  /**
   * Show the seek/progress bar under video controls.
   * Default true. Set false for compact surfaces like event list cards.
   */
  showProgress?: boolean;
  /** Loop video playback. Default true. */
  loop?: boolean;
  /** Extra classes on the outer frame. */
  className?: string;
  /**
   * Aspect / sizing classes for the frame.
   * Default: `aspect-[1.75] w-full` (override with page CSS classes on home/detail).
   */
  frameClassName?: string;
  /**
   * Extra classes on the video controls shell (play/pause + mute).
   * Use with `.media-player__control` to size buttons responsively.
   */
  controlsClassName?: string;
  /** Optional placeholder when there is no media URL. */
  placeholder?: ReactNode;
};
