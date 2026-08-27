import type { AbstractIntlMessages } from "next-intl";

/**
 * The message paths that actually cross to the browser.
 *
 * `NextIntlClientProvider` serialises whatever it is given into the RSC flight
 * payload of every page. Handed the whole catalogue it inlines ~78 KB of JSON
 * into each document, most of it for namespaces only ever read on the server —
 * `application.detailPage` alone is 30 KB, and no client component can reach it.
 * Listing the paths here instead cuts roughly 60% of that.
 *
 * A path earns its place only when a `"use client"` component calls
 * `useTranslations` with it (or with something under it). Each is tagged with the
 * component that needs it, so the next person can tell when one becomes dead.
 * Server components read messages through `getTranslations` and never need an
 * entry.
 *
 * Granularity is the namespace the hook scopes to, not the individual keys: a
 * component that does `useTranslations("cnc")` can build a key at runtime
 * (`t(\`machines.categories.${cat}\`)`), so anything narrower than its own scope
 * could break on a value that only appears for some data. Where a component
 * scopes itself tightly the path may follow it down — `application.index` is
 * the whole of what Header can see, so the 30 KB sibling stays behind.
 */
export const CLIENT_MESSAGE_PATHS = [
  "common", // rail-nudge, floating-contact
  "nav", // Header
  "auth", // Header — LoginModal, AccountMenu
  "product", // Header — product.page.types.*
  "cnc", // Header — cnc.machines.categories.*
  "application.index", // Header
  "search", // SearchPanel, search-results
  "home", // hero-slider, video-reel, app-deck
  "news", // news-feed, news-list-filter
  "contact", // contact-form
] as const;

/**
 * Narrows the full message catalogue to {@link CLIENT_MESSAGE_PATHS}, keeping
 * each path at its original position so `useTranslations("application.index")`
 * still resolves.
 *
 * Throws on a path that resolves to nothing. This runs while prerendering every
 * page, so a stale entry fails the build rather than shipping a document whose
 * client components silently fall back to rendering raw key paths.
 */
export function pickClientMessages(all: AbstractIntlMessages): AbstractIntlMessages {
  const picked: Record<string, unknown> = {};

  for (const path of CLIENT_MESSAGE_PATHS) {
    const segments = path.split(".");

    let source: unknown = all;
    for (const segment of segments) {
      source =
        source && typeof source === "object"
          ? (source as Record<string, unknown>)[segment]
          : undefined;
    }
    if (source === undefined) {
      throw new Error(
        `[client-messages] "${path}" is listed as a client message path but no such message exists. ` +
          `Drop it from CLIENT_MESSAGE_PATHS, or fix the path.`,
      );
    }

    let branch = picked;
    for (const segment of segments.slice(0, -1)) {
      branch = (branch[segment] ??= {}) as Record<string, unknown>;
    }
    branch[segments[segments.length - 1]] = source;
  }

  return picked as AbstractIntlMessages;
}
