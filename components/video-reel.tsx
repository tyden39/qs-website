"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export type VideoItem = {
  /** YouTube video id, e.g. "dQw4w9WgXcQ" — drives the poster, embed, and watch link. */
  youtubeId: string;
  title: string;
  /** Optional duration label, e.g. "02:14". Omit to hide the badge. */
  duration?: string;
};

const INTERVAL = 6000; // ms each clip stays featured before auto-advancing

/**
 * YouTube poster URL from a video id. `max` = 1280×720 16:9 (feature) but only exists for
 * HD uploads — it 404s otherwise, so the feature falls back to `hq`. `hq` = 480×360 (always
 * present). `mq` = 320×180 16:9 (playlist thumb).
 */
const poster = (id: string, size: "max" | "hq" | "mq") => {
  const file = size === "max" ? "maxresdefault" : size === "hq" ? "hqdefault" : "mqdefault";
  return `https://i.ytimg.com/vi/${id}/${file}.jpg`;
};

/**
 * Showreel — the active clip fills the cinematic feature screen on the left while the
 * playlist on the right lists every clip with a thumbnail. Autoplay walks the list and
 * swaps the feature still (re-keyed → replays the qs-rise cross-fade); hovering/focusing
 * the reel pauses the cycle and lets the pointer pick which clip is featured.
 *
 * Mirrors the Newsroom feed: each row's gold edge bar shows on hover only (uniform),
 * while the *active* row is marked by a lit thumbnail, gold title, a "▶ Đang phát" tag,
 * and an autoplay progress seam. Honours prefers-reduced-motion (no autoplay, static
 * progress). First clip renders on the server for the initial HTML.
 */
export default function VideoReel({ items }: { items: VideoItem[] }) {
  const t = useTranslations("home.showreel");
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animate, setAnimate] = useState(true);
  // Which clip (if any) is actively playing its YouTube embed in the feature screen.
  const [playing, setPlaying] = useState(false);
  // Video ids whose maxresdefault poster 404'd → fall back to hqdefault on the feature screen.
  const [noMaxres, setNoMaxres] = useState<Record<string, boolean>>({});

  // Honour prefers-reduced-motion: no autoplay, no progress bar.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setAnimate(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Auto-advance the featured clip; pause while hovered/focused or a clip is playing.
  useEffect(() => {
    if (!animate || paused || playing || items.length < 2) return;
    const id = window.setInterval(
      () => setActive((a) => (a + 1) % items.length),
      INTERVAL,
    );
    return () => window.clearInterval(id);
  }, [animate, paused, playing, active, items.length]);

  const feat = items[active];

  // Feature a clip; `play` jumps straight into the embed (used by clicks, not hover).
  const select = (i: number, play: boolean) => {
    setActive(i);
    setPlaying(play);
  };

  return (
    <div
      className="grid md:grid-cols-[1.25fr_1fr] gap-8 lg:gap-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* FEATURE SCREEN — 16:9 (HD) still that swaps to the YouTube embed on play (facade: iframe only loads on click) */}
      <div className="group relative aspect-video overflow-hidden rounded-[6px] bg-ink-2 border border-line shadow-[0_18px_50px_-28px_rgba(0,0,0,.55)]">
        {playing ? (
          <>
            <iframe
              key={feat.youtubeId}
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${feat.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={feat.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
            <button
              type="button"
              onClick={() => setPlaying(false)}
              aria-label={t("closeVideo")}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full grid place-items-center bg-ink/70 text-white border border-white/20 hover:bg-ink transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </>
        ) : (
          <>
            <Image
              key={active}
              src={poster(feat.youtubeId, noMaxres[feat.youtubeId] ? "hq" : "max")}
              alt={feat.title}
              fill
              sizes="(max-width:1024px) 100vw, 52vw"
              onError={() => setNoMaxres((m) => ({ ...m, [feat.youtubeId]: true }))}
              onLoad={(e) => {
                // YouTube serves a 120×90 gray placeholder (HTTP 200, not 404) when a video
                // has no maxresdefault — detect it by size and fall back to hqdefault.
                if (e.currentTarget.naturalWidth <= 120) {
                  setNoMaxres((m) => ({ ...m, [feat.youtubeId]: true }));
                }
              }}
              className="qs-rise object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(10,10,8,.9) 2%,rgba(10,10,8,.1) 42%,transparent 72%)" }} />
            {/* broadcast scan-line + ember breathe — mirrors the Newsroom lead */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] qs-scan" aria-hidden="true" />
            <div className="qs-breathe pointer-events-none absolute inset-x-0 bottom-0 h-1/2" style={{ background: "radial-gradient(ellipse 72% 82% at 28% 124%, rgba(232,200,120,.22), transparent 70%)" }} aria-hidden="true" />
            {/* light sheen sweeping across the still on hover */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1000ms] ease-out" style={{ background: "linear-gradient(115deg, transparent 40%, rgba(255,255,255,.16) 50%, transparent 60%)" }} aria-hidden="true" />
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
              aria-label={`${t("playVideo")}: ${feat.title}`}
              className="qs-play absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full grid place-items-center cursor-pointer text-ink transition-transform duration-200 hover:scale-105"
              style={{ background: "rgba(232,200,120,.96)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            </button>
            <div className="absolute inset-x-0 bottom-0 px-6 py-5 flex items-center gap-3.5">
              {feat.duration && <span className="font-mono text-label bg-gold text-ink py-0.5 px-2 font-semibold tracking-[.04em]">{feat.duration}</span>}
              <span className="font-display text-meta font-medium text-white">{feat.title}</span>
            </div>
          </>
        )}
      </div>

      {/* PLAYLIST — every clip with a thumbnail; active row drives the feature screen */}
      <div className="flex flex-col">
        <div className="relative flex items-center justify-between pb-3 mb-1 border-b border-line">
          <span className="qs-trace pointer-events-none absolute left-0 right-0 bottom-[-1px] h-px" aria-hidden="true" />
          <span className="font-mono text-label-xs tracking-[.18em] uppercase text-muted inline-flex items-center gap-2"><span className="qs-live-dot" />{t("playlist")}</span>
          <span className="font-mono text-label-xs tracking-[.14em] text-gold-1">{String(items.length).padStart(2, "0")} video</span>
        </div>
        {items.map((v, i) => (
          <button
            key={v.title + i}
            type="button"
            data-active={i === active ? "true" : undefined}
            onMouseEnter={() => { if (!playing) setActive(i); }}
            onClick={() => select(i, true)}
            className="qs-wire group relative grid grid-cols-[auto_1fr_auto] gap-4 items-center text-left py-4 border-b border-line transition-[padding] duration-300 hover:pl-3 qs-rise"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* gold edge bar — hover only, identical for every row */}
            <span className="absolute left-0 inset-y-3 w-[2px] bg-gold-2 origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
            {/* thumbnail with a small play glyph; lit when this clip is featured */}
            <span className="relative w-[78px] h-[58px] shrink-0 overflow-hidden rounded-[3px] border border-line transition-colors duration-300 group-hover:border-gold-2/70 group-data-[active=true]:border-gold-2/70">
              <Image src={poster(v.youtubeId, "mq")} alt="" fill sizes="78px" className="object-cover transition-transform duration-500 group-hover:scale-105 group-data-[active=true]:scale-105" />
              <span className="absolute inset-0 bg-ink/35 transition-opacity duration-300 group-hover:opacity-0 group-data-[active=true]:opacity-0" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full grid place-items-center text-ink" style={{ background: "rgba(232,200,120,.92)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </span>
            <div className="min-w-0">
              <span className="font-mono text-label-xs text-muted tracking-[.16em] uppercase block mb-1 group-data-[active=true]:text-gold-1 transition-colors">
                {i === active ? t("nowPlaying") : t("video")}{v.duration ? ` · ${v.duration}` : ""}
              </span>
              <h4 className="font-display font-semibold text-meta leading-[1.35] m-0 tracking-[-.005em] text-ink line-clamp-2 transition-colors group-hover:text-gold-1 group-data-[active=true]:text-gold-1">{v.title}</h4>
            </div>
            <span className="font-mono text-gold-1 text-meta opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">▶</span>
            {/* autoplay progress seam — only under the active row while cycling (hidden once a clip is playing) */}
            {i === active && (
              <span className="pointer-events-none absolute left-0 right-0 bottom-0 h-[2px] bg-line/60 overflow-hidden">
                {animate && !paused && !playing && items.length > 1 ? (
                  <span key={active} className="block h-full bg-gold-2" style={{ animation: `qs-progress ${INTERVAL}ms linear forwards` }} />
                ) : (
                  <span className="block h-full w-2/5 bg-gold-2/70" />
                )}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
