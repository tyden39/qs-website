export type NotFoundLabels = {
  tag: string;
  heading: string;
  body: string;
  home: string;
  contact: string;
};

// Presentational 404 body, shared by the locale-tree not-found (reached via
// notFound()) and the root not-found that the static export writes to
// out/404.html — the file Cloudflare serves for every unmatched URL.
//
// Plain anchors and explicit locale-prefixed hrefs on purpose: the root copy
// renders outside the i18n routing tree, where next-intl's <Link> does not
// apply. The data-nf hooks let the root copy swap its copy to English
// client-side, since a single 404.html has to answer for both locales.
export default function NotFoundContent({
  labels,
  homeHref,
  contactHref,
}: {
  labels: NotFoundLabels;
  homeHref: string;
  contactHref: string;
}) {
  return (
    <section
      className="relative overflow-hidden bg-paper grid items-center"
      style={{ padding: "96px 0", minHeight: "calc(100dvh - 380px)" }}
    >
      <div className="absolute inset-0 qs-grid-bg opacity-40"></div>
      <div className="relative max-w-wrap mx-auto px-5 sm:px-8 lg:px-12 text-center flex flex-col items-center gap-2">
        <div
          data-nf="tag"
          className="font-mono text-label text-gold-1 tracking-[.2em] uppercase flex gap-3 items-center
                     before:content-[''] before:w-8 before:h-px before:bg-gold before:opacity-60
                     after:content-[''] after:w-8 after:h-px after:bg-gold after:opacity-60"
        >
          {labels.tag}
        </div>

        <div
          className="relative font-display font-bold leading-[.9] tracking-[-.04em] mt-3.5
                     bg-gold-grad bg-clip-text text-transparent"
          style={{ fontSize: "clamp(160px, 22vw, 280px)" }}
        >
          404
          <span
            className="absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full"
            style={{ bottom: "8%", background: "#c8553d", boxShadow: "0 0 0 6px rgba(200,85,61,.18)" }}
          ></span>
        </div>

        <h1
          data-nf="heading"
          className="font-display font-bold tracking-[-.015em] text-ink mt-3.5"
          style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
        >
          {labels.heading}
        </h1>
        <p data-nf="body" className="text-body leading-[1.7] text-[#4a4842] mt-3.5 max-w-[48ch]">
          {labels.body}
        </p>
        <div className="flex gap-2.5 mt-8">
          <a data-nf="home" className="qs-btn qs-btn-gold" href={homeHref}>
            {labels.home}
          </a>
          <a data-nf="contact" className="qs-btn qs-btn-ghost" href={contactHref}>
            {labels.contact}
          </a>
        </div>
      </div>
    </section>
  );
}
