import { readFileSync } from "node:fs";
import path from "node:path";

export type ImageSize = { width: number; height: number };

const cache = new Map<string, ImageSize | null>();

/** Parses the WebP container header (lossy VP8, lossless VP8L, extended VP8X). */
function webpSize(buf: Buffer): ImageSize | null {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = buf.toString("ascii", 12, 16);

  if (chunk === "VP8X") {
    return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  }
  if (chunk === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8 ") {
    // Key-frame start code 9D 01 2A precedes the 14-bit width/height pair.
    const start = buf.indexOf(Buffer.from([0x9d, 0x01, 0x2a]), 20);
    if (start < 0) return null;
    return { width: buf.readUInt16LE(start + 3) & 0x3fff, height: buf.readUInt16LE(start + 5) & 0x3fff };
  }
  return null;
}

function pngSize(buf: Buffer): ImageSize | null {
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf: Buffer): ImageSize | null {
  if (buf.readUInt16BE(0) !== 0xffd8) return null;
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) return null;
    const marker = buf[offset + 1];
    const length = buf.readUInt16BE(offset + 2);
    // SOF0..SOF15, skipping the non-frame markers DHT/JPG/DAC in that range.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { width: buf.readUInt16BE(offset + 7), height: buf.readUInt16BE(offset + 5) };
    }
    offset += 2 + length;
  }
  return null;
}

/**
 * Reads intrinsic dimensions of an asset under `public/` from its file header.
 * Root-relative src only (e.g. `/img/news/foo.webp`); returns null for remote
 * or unreadable files. Build-time only — the site is a static export.
 */
export function getPublicImageSize(src: string): ImageSize | null {
  if (!src.startsWith("/")) return null;
  if (cache.has(src)) return cache.get(src) ?? null;

  let size: ImageSize | null = null;
  try {
    const clean = src.split(/[?#]/)[0];
    const buf = readFileSync(path.join(process.cwd(), "public", decodeURIComponent(clean)));
    if (/\.webp$/i.test(clean)) size = webpSize(buf);
    else if (/\.png$/i.test(clean)) size = pngSize(buf);
    else if (/\.jpe?g$/i.test(clean)) size = jpegSize(buf);
  } catch {
    size = null;
  }

  cache.set(src, size);
  return size;
}
