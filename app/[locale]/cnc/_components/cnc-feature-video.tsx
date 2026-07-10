"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Single feature video with a YouTube facade: the poster still renders immediately
 * and the iframe only loads on play (same pattern as the home VideoReel feature
 * screen, without the playlist). Falls back from maxresdefault to hqdefault when
 * the HD poster is missing.
 */
export default function CncFeatureVideo({ youtubeId }: { youtubeId: string }) {
  const t = useTranslations("cnc.video");
  const [playing, setPlaying] = useState(false);
  const [noMaxres, setNoMaxres] = useState(false);

  const poster = `https://i.ytimg.com/vi/${youtubeId}/${noMaxres ? "hqdefault" : "maxresdefault"}.jpg`;

  return (
    <div className="group relative aspect-video overflow-hidden rounded-[6px] bg-ink-2 border border-[#2a2620] shadow-[0_28px_70px_-30px_rgba(0,0,0,.7)]">
      {playing ? (
        <>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={t("title")}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
          <button
            type="button"
            onClick={() => setPlaying(false)}
            aria-label={t("close")}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full grid place-items-center bg-ink/70 text-white border border-white/20 hover:bg-ink transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </>
      ) : (
        <>
          <Image
            src={poster}
            alt={t("title")}
            fill
            sizes="(max-width:1024px) 100vw, 960px"
            onError={() => setNoMaxres(true)}
            onLoad={(e) => {
              // YouTube returns a 120×90 gray placeholder (HTTP 200) when a video
              // has no maxresdefault — detect it by size and fall back to hqdefault.
              if (e.currentTarget.naturalWidth <= 120) setNoMaxres(true);
            }}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(10,10,8,.9) 2%,rgba(10,10,8,.1) 42%,transparent 72%)" }} />
          {/* broadcast scan-line + ember breathe, mirroring the home showreel */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] qs-scan" aria-hidden="true" />
          <div className="qs-breathe pointer-events-none absolute inset-x-0 bottom-0 h-1/2" style={{ background: "radial-gradient(ellipse 72% 82% at 28% 124%, rgba(232,200,120,.22), transparent 70%)" }} aria-hidden="true" />
          {/* registration frame */}
          <div className="pointer-events-none absolute inset-4 border border-white/12 transition-colors duration-500 group-hover:border-gold-2/50">
            <span className="absolute -top-px -left-px w-3.5 h-3.5 border-t border-l border-gold-2" />
            <span className="absolute -top-px -right-px w-3.5 h-3.5 border-t border-r border-gold-2" />
            <span className="absolute -bottom-px -left-px w-3.5 h-3.5 border-b border-l border-gold-2" />
            <span className="absolute -bottom-px -right-px w-3.5 h-3.5 border-b border-r border-gold-2" />
          </div>
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`${t("play")}: ${t("title")}`}
            className="qs-play absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full grid place-items-center cursor-pointer text-ink transition-transform duration-200 hover:scale-105"
            style={{ background: "rgba(232,200,120,.96)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          </button>
          <div className="absolute inset-x-0 bottom-0 px-6 py-5">
            <span className="font-display text-sm font-medium text-white">{t("title")}</span>
          </div>
        </>
      )}
    </div>
  );
}
