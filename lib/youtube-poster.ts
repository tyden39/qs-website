"use client";

import { useEffect, useState } from "react";

/**
 * YouTube poster stills for a 16:9 feature box, sharpest first.
 *
 * - `maxresdefault` — 1280×720, true 16:9. Only exists for HD uploads.
 * - `sddefault` — 640×480, 4:3 letterbox (the 16:9 frame is 640×360 after cropping).
 * - `hqdefault` — 480×360, 4:3 letterbox (480×270 cropped). The only file guaranteed
 *   to exist for every public video.
 *
 * Landing on the bottom rung means the still is upscaled ~2× inside a ~960px-wide
 * feature box, which reads as a torn, blocky image — hence always starting at the top
 * and stepping down only when a file is genuinely missing.
 */
const POSTER_FILES = ["maxresdefault", "sddefault", "hqdefault"] as const;

/** Poster URL for a video id and still name (`mqdefault` = 320×180, for small thumbs). */
export const posterUrl = (youtubeId: string, file: string) =>
  `https://i.ytimg.com/vi/${youtubeId}/${file}.jpg`;

/**
 * A missing still is NOT a plain 404 body: YouTube answers with a decodable 120×90 grey
 * placeholder, so the browser fires `load`, not `error`, and renders the grey block
 * blown up to full width. Detecting it by natural size is the only reliable signal.
 */
const PLACEHOLDER_MAX_WIDTH = 120;

/**
 * Resolves the sharpest poster still a video actually has, and returns the `src` to put
 * on an `<img>` (or `next/image`). It starts at `maxresdefault` and steps down a rung
 * whenever the current file turns out to be missing, settling on the best real still.
 *
 * Each rung is checked with a detached probe image rather than `onLoad`/`onError` on the
 * rendered element: the poster sits in the prerendered HTML, so the browser often
 * finishes loading it before React hydrates and attaches handlers — the event fires into
 * the void and the page is left showing the grey placeholder stretched to full width.
 * The probe runs after mount, so it cannot be missed, and it costs no extra traffic
 * because it hits the same URL already in the HTTP cache.
 *
 * Rungs are remembered per video id, so a component that swaps between several clips
 * does not re-probe one it has already resolved.
 */
export function useYoutubePoster(youtubeId: string) {
  const [rungs, setRungs] = useState<Record<string, number>>({});
  const rung = rungs[youtubeId] ?? 0;
  const src = posterUrl(youtubeId, POSTER_FILES[rung]);

  useEffect(() => {
    if (rung >= POSTER_FILES.length - 1) return;

    let cancelled = false;
    const dropRung = () => {
      if (!cancelled) setRungs((m) => ({ ...m, [youtubeId]: (m[youtubeId] ?? 0) + 1 }));
    };

    const probe = new window.Image();
    probe.onload = () => {
      if (probe.naturalWidth <= PLACEHOLDER_MAX_WIDTH) dropRung();
    };
    probe.onerror = dropRung;
    probe.src = src;

    return () => {
      cancelled = true;
    };
  }, [youtubeId, rung, src]);

  return { src };
}
