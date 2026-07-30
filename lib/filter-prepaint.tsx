/**
 * Pre-paint filter primer.
 *
 * The catalogue lists mirror their filter state in the URL but are statically
 * generated, so the prerendered HTML carries the full, unfiltered list (see
 * `use-filter-params.ts`). Without help, a shared/bookmarked filter URL paints
 * that unfiltered list first and only snaps to the filtered view after React
 * hydrates — the visible "loads the default first" flash.
 *
 * This closes that gap: a tiny blocking script, rendered into the HTML *before*
 * the list, reads the URL during parse and injects a `<style>` that hides the
 * non-matching elements before the browser's first paint. Elements opt in by
 * carrying `data-f-<key>` attributes holding their filterable value(s)
 * (space-separated, matched with the CSS `~=` word operator). The static HTML
 * still holds every item, so crawlers and no-JS visitors are unaffected.
 *
 * Once React hydrates it re-renders from the same URL and owns the DOM, so the
 * primer style is redundant and must be removed before any client-side filter
 * change — `FilterPrePaintCleanup` (in `use-filter-params`) does that on mount.
 */

/**
 * Emits `code` as a parse-time classic script.
 *
 * React itself never renders a `<script>` element here. The App Router renders
 * this server component's output on the client for every soft navigation, and a
 * script element created during a client render is inert — React logs a console
 * error saying so. Handing React a wrapper whose inner HTML holds the script
 * keeps the initial document unchanged (the parser runs the script where it
 * sits, blocking on it, before the markup around it paints) while a client
 * render writes dead markup into a hidden node — which is all the primer is
 * worth after hydration, when `useFilterParams` owns the filter instead.
 *
 * The wrapper is `hidden`, so it takes no layout and no space in a flex or grid
 * parent. `code` must not contain the string `</script>`.
 */
function PrePaintScript({ code }: { code: string }) {
  return <div hidden dangerouslySetInnerHTML={{ __html: `<script>${code}</script>` }} />;
}

/** One filter dimension the primer should apply before paint. */
export type PrePaintKey = {
  /** Query param + `data-f-<key>` suffix, e.g. "g", "iface", "cat". */
  key: string;
  /** Value assumed when the param is absent (a dimension with a real default,
   *  like the first catalogue group). Omit for "absent = show everything". */
  def?: string;
  /** Also force-show the matching element, overriding a server-set `hidden`
   *  attribute. Needed for the group panels, which ship hidden by default. */
  unhide?: boolean;
};

/**
 * Blocking primer script for a page's filter dimensions. Render it in the HTML
 * *before* the filtered markup so the injected style is in place as the list is
 * parsed. Server component: it must reach the browser as static HTML that runs
 * during parse, so it is never placed inside a client boundary.
 */
export function FilterPrePaint({ keys }: { keys: PrePaintKey[] }) {
  const code = `(function(){try{var p=new URLSearchParams(location.search),K=${JSON.stringify(
    keys,
  )},c="";for(var i=0;i<K.length;i++){var k=K[i],v=(p.get(k.key)||k.def||"").replace(/[^a-z0-9-]/gi,"");if(!v)continue;var a="data-f-"+k.key;c+="["+a+']:not(['+a+'~="'+v+'"]){display:none!important}';if(k.unhide)c+="["+a+'~="'+v+'"]{display:block!important}';c+='[data-f-hide-when~="'+k.key+'"]{display:none!important}'}if(c){var s=document.createElement("style");s.id="qs-prefilter";s.textContent=c;document.head.appendChild(s)}}catch(e){}})();`;
  return <PrePaintScript code={code} />;
}

/**
 * Eager-loads the hero figure the URL actually selects.
 *
 * A catalogue hub mounts every group's hero figure and lets the primer above
 * reveal the one the query string names. Only the group shown by default can
 * carry next/image's `priority`, because the pages are statically exported and
 * the server never sees the query string — so on a shared `?g=…` link the
 * figure that becomes the page's largest element is still a lazy image, found
 * by the browser only once layout proves it visible.
 *
 * This closes that gap the same way the primer does: a blocking script,
 * rendered *after* the figures so they are already parsed, preloads the render
 * the URL selects. The other groups keep their lazy images, which never
 * intersect while hidden and so cost no bytes — marking every group `priority`
 * instead would preload four to six full-size renders on every visit.
 *
 * It injects a `<link rel="preload" as="image">` carrying the figure's own
 * `srcset`/`sizes`, which is exactly what next/image emits for a `priority`
 * image, rather than rewriting the image's `loading`/`fetchpriority`
 * attributes. Rewriting them tripped a hydration mismatch: a priority image
 * ships with neither attribute set (its preload link does the work), so the
 * values written here no longer matched the props React hydrated the `<img>`
 * with, and React reported the difference as server/client drift.
 *
 * Figures opt in by carrying `data-f-hero="<group id>"`; `param`/`def` mirror
 * the `PrePaintKey` the page uses for the same dimension. The group named by
 * `def` is the one the page hands `priority` to, so an absent or default param
 * needs nothing here and the script exits. A group can tag one figure per
 * breakpoint (the mobile hero and the desktop bleed), so the script measures
 * each candidate and skips the ones the current viewport hides rather than
 * fetching a render nobody sees. Measuring is safe here: the primer has already
 * force-shown the selected group, pending stylesheets have loaded (parser-
 * blocking scripts wait on them), and the forced layout runs before first
 * paint, where it costs nothing extra.
 *
 * next/image's dev-only LCP warning still fires on such a link: it reads the
 * `loading` value the component rendered with, which is `lazy` for every group
 * but the default, and knows nothing of this preload. The bytes do start during
 * parse — the warning is the false positive, so it is not a reason to hand
 * every group `priority`.
 */
export function PrePaintHeroImage({ param, def }: { param: string; def?: string }) {
  const code = `(function(){try{var v=(new URLSearchParams(location.search).get(${JSON.stringify(
    param,
  )})||"").replace(/[^a-z0-9-]/gi,"");if(!v||v===${JSON.stringify(
    def ?? "",
  )})return;var n=document.querySelectorAll('[data-f-hero~="'+v+'"] img'),seen={};for(var i=0;i<n.length;i++){var m=n[i];if(!m.getBoundingClientRect().width)continue;var ss=m.getAttribute("srcset")||"",src=m.getAttribute("src")||"",k=ss||src;if(!k||seen[k])continue;seen[k]=1;var l=document.createElement("link");l.rel="preload";l.as="image";l.setAttribute("fetchpriority","high");if(ss){l.setAttribute("imagesrcset",ss);var sz=m.getAttribute("sizes");if(sz)l.setAttribute("imagesizes",sz)}else{l.href=src}document.head.appendChild(l)}}catch(e){}})();`;
  return <PrePaintScript code={code} />;
}
