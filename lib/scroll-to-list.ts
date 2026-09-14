/**
 * Smooth-scrolls the catalogue list section (id="list") into view. Shared by the
 * header submenu and the sidebar category tree so picking a category always
 * lands on the top of the filtered list rather than the page hero or a browser
 * scroll-clamp.
 *
 * Uses window.scrollTo to an absolute target (not scrollIntoView, which skips
 * the scroll when the element is judged already "in view" — that made it work
 * scrolling up but not down). The gap below the sticky header is read from the
 * element's CSS `scroll-margin-top` (see the `#list` rule in globals.css), so
 * that single value stays the one place to tune the offset, per breakpoint.
 *
 * Deferred one frame: the caller changes the filter first, which re-renders the
 * tree (toggling panel `hidden`) and reflows the page. Measuring and scrolling
 * on the next animation frame lets that layout settle so the smooth animation
 * runs to the final position instead of being cut short by the reflow.
 */
export function scrollToList(id = "list"): void {
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const marginTop = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const top = el.getBoundingClientRect().top + window.scrollY - marginTop;
    window.scrollTo({ top, behavior: "smooth" });
  });
}

/**
 * Smooth-scrolls the window back to the very top. Used by the header submenu so
 * a filter picked in the nav always lands at the page top, matching where a
 * cross-page click on the same entry would leave the visitor.
 *
 * Deferred one frame for the mobile drawer: closing it releases the body scroll
 * lock (`overflow: hidden`) in a layout effect, and a scroll requested while the
 * lock is still applied would be dropped.
 */
export function scrollToTop(): void {
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
}
