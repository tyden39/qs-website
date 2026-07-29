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
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
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
 * rendered *after* the figures so they are already parsed, flips the selected
 * group's images to eager and high fetch priority. The other groups keep their
 * lazy images, which never intersect while hidden and so cost no bytes —
 * marking every group `priority` instead would preload four to six full-size
 * renders on every visit.
 *
 * Figures opt in by carrying `data-f-hero="<group id>"`; `param`/`def` mirror
 * the `PrePaintKey` the page uses for the same dimension.
 *
 * next/image's dev-only LCP warning still fires on such a link: it compares the
 * `loading` value the component rendered with, which is `lazy` for every group
 * but the default, and never re-reads the attribute this script rewrites. The
 * image does load eagerly — the warning is the false positive, so it is not a
 * reason to hand every group `priority`.
 */
export function PrePaintHeroImage({ param, def }: { param: string; def?: string }) {
  const code = `(function(){try{var v=(new URLSearchParams(location.search).get(${JSON.stringify(
    param,
  )})||${JSON.stringify(
    def ?? "",
  )}).replace(/[^a-z0-9-]/gi,"");if(!v)return;var n=document.querySelectorAll('[data-f-hero~="'+v+'"] img');for(var i=0;i<n.length;i++){n[i].loading="eager";n[i].setAttribute("fetchpriority","high")}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
