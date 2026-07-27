"use client";

import { useState } from "react";

/**
 * Lazy YouTube player for the product overview. Renders a poster + play button
 * (a "facade") and only injects the YouTube iframe after the first click, so the
 * page ships no third-party embed weight until the visitor asks for the video.
 * Uses the privacy-friendly `youtube-nocookie.com` host.
 */
export function ProductVideo({
  youtubeId,
  title,
  playLabel,
}: {
  youtubeId: string;
  title: string;
  playLabel: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative aspect-video bg-black border border-line">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerated-fullscreen; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={playLabel}
      className="group relative aspect-video w-full overflow-hidden bg-black border border-line cursor-pointer"
    >
      {/* Poster: `hqdefault` always exists for any public video. */}
      <img
        src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
        alt={title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
      />
      <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
      <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold-2 text-ink shadow-[0_18px_44px_-18px_rgba(0,0,0,.7)] transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}
