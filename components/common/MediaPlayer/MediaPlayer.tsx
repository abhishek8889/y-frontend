"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { isVideoMedia } from "@/lib/media/isVideoMedia";
import type { MediaPlayerProps } from "./types";

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="media-player__icon">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="media-player__icon">
      <path d="M8 5.5v13l11-6.5L8 5.5Z" />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="media-player__icon">
      <path d="M5.5 9.5h2.3L12 5.8v12.4l-4.2-3.7H5.5a1 1 0 0 1-1-1v-2.5a1 1 0 0 1 1-1Z" />
      <path
        d="M15.1 9.2a3.1 3.1 0 0 1 0 5.6M17.4 7a5.6 5.6 0 0 1 0 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4.2 4.2 19.8 19.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UnmuteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="media-player__icon">
      <path d="M5.5 9.5h2.3L12 5.8v12.4l-4.2-3.7H5.5a1 1 0 0 1-1-1v-2.5a1 1 0 0 1 1-1Z" />
      <path
        d="M15.1 9.2a3.1 3.1 0 0 1 0 5.6M17.4 7a5.6 5.6 0 0 1 0 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Shared image / custom video player for organiser, admin, and public surfaces.
 * Images render as `<img>`; videos get progress + pause/mute controls (muted by default).
 */
export function MediaPlayer({
  media,
  alt = "Media",
  active = false,
  controls = true,
  showProgress = true,
  loop = true,
  className = "",
  frameClassName = "aspect-[1.75] w-full",
  controlsClassName = "",
  placeholder = null,
}: MediaPlayerProps) {
  const src = media?.url?.trim() || "";
  const isVideo = Boolean(src) && isVideoMedia(media);
  const showControls = isVideo && controls;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const frameClass = `media-player ${frameClassName} ${className}`.trim();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    video.muted = true;
    setMuted(true);

    if (active) {
      const playPromise = video.play();
      if (playPromise) {
        void playPromise.catch(() => {
          setPaused(true);
        });
      }
    } else {
      video.pause();
      video.currentTime = 0;
      setPaused(true);
      setProgress(0);
    }
  }, [active, isVideo, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    const onTimeUpdate = () => {
      const duration = video.duration || 0;
      setProgress(duration > 0 ? (video.currentTime / duration) * 100 : 0);
    };
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    const onEnded = () => {
      setPaused(true);
      setProgress(100);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [isVideo, src]);

  function stopBubble(event: MouseEvent | PointerEvent) {
    event.stopPropagation();
  }

  function togglePlay(event: MouseEvent) {
    stopBubble(event);
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }

  function toggleMute(event: MouseEvent) {
    stopBubble(event);
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function seek(event: MouseEvent<HTMLDivElement>) {
    stopBubble(event);
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
    setProgress(ratio * 100);
  }

  if (!src) {
    return (
      <div className={frameClass} role="img" aria-label={alt}>
        {placeholder}
      </div>
    );
  }

  if (!isVideo) {
    return (
      <div className={frameClass} role="img" aria-label={alt}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="media-player__image" />
      </div>
    );
  }

  return (
    <div className={frameClass}>
      <video
        ref={videoRef}
        src={src}
        className="media-player__video"
        muted
        playsInline
        preload="metadata"
        loop={loop}
        aria-label={alt}
      />

      {showControls ? (
        <div
          className={`media-player__controls${showProgress ? " media-player__controls--progress" : ""} ${controlsClassName}`.trim()}
        >
          {showProgress ? (
            <div
              role="slider"
              aria-label="Video progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              tabIndex={0}
              className="media-player__progress"
              onClick={seek}
              onKeyDown={(event) => {
                const video = videoRef.current;
                if (!video || !video.duration) return;
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  event.stopPropagation();
                  video.currentTime = Math.min(video.duration, video.currentTime + 2);
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  event.stopPropagation();
                  video.currentTime = Math.max(0, video.currentTime - 2);
                }
              }}
            >
              <div
                className="media-player__progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : null}

          <div
            className={`media-player__control-row${showProgress ? " media-player__control-row--with-progress" : ""}`}
          >
            <button
              type="button"
              aria-label={paused ? "Play video" : "Pause video"}
              onClick={togglePlay}
              onPointerDown={stopBubble}
              className="media-player__control"
            >
              {paused ? <PlayIcon /> : <PauseIcon />}
            </button>
            <button
              type="button"
              aria-label={muted ? "Unmute video" : "Mute video"}
              onClick={toggleMute}
              onPointerDown={stopBubble}
              className="media-player__control"
            >
              {muted ? <MuteIcon /> : <UnmuteIcon />}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
