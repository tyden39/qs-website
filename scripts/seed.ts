import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

// Lazy bindings so the DB pool reads env after dotenv has injected values.
let db: typeof import("../lib/db/client").db;
let product: typeof import("../lib/db/schema/catalog").product;
let news: typeof import("../lib/db/schema/catalog").news;
let application: typeof import("../lib/db/schema/catalog").application;
let service: typeof import("../lib/db/schema/catalog").service;
let datasheet: typeof import("../lib/db/schema/catalog").datasheet;
let seedProducts: typeof import("../data/products").products;
let seedNews: typeof import("../data/news").news;
let seedApplications: typeof import("../data/applications").applications;
let seedServices: typeof import("../data/services").services;
let seedDatasheets: typeof import("../data/datasheets").datasheets;
let DOMPurify: typeof import("isomorphic-dompurify").default;

const now = () => new Date();

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "a", "blockquote", "cite",
  "code", "pre",
  "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td",
  "hr", "span",
];

const ALLOWED_ATTR = ["href", "title", "id", "class", "src", "alt", "loading", "decoding"];

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "svg"],
    FORBID_ATTR: ["onload", "onerror", "onclick", "onmouseover", "style"],
  });
}

async function seedProductTable() {
  for (const [i, p] of seedProducts.entries()) {
    await db
      .insert(product)
      .values({
        slug: p.slug,
        series: p.series,
        axes: p.axes,
        display: p.display,
        badge: p.badge ?? null,
        tag: { vi: p.tag },
        name: { vi: p.name },
        desc: { vi: p.desc },
        bullets: p.bullets.map((b) => ({ vi: b })),
        specs: p.specs,
        images: [],
        status: "published",
        sort: i,
        publishedAt: now(),
      })
      .onConflictDoUpdate({
        target: product.slug,
        set: {
          series: p.series,
          axes: p.axes,
          display: p.display,
          badge: p.badge ?? null,
          tag: { vi: p.tag },
          name: { vi: p.name },
          desc: { vi: p.desc },
          bullets: p.bullets.map((b) => ({ vi: b })),
          specs: p.specs,
          status: "published",
          sort: i,
          updatedAt: now(),
        },
      });
  }
  return seedProducts.length;
}

async function seedNewsTable() {
  for (const n of seedNews) {
    const safeBody = sanitizeHtml(n.body);
    await db
      .insert(news)
      .values({
        slug: n.slug,
        title: { vi: n.title },
        excerpt: { vi: n.excerpt },
        bodyHtml: { vi: safeBody },
        bodyJson: null,
        coverImage: null,
        category: n.cat,
        tags: n.tags ?? [],
        status: "published",
        publishedAt: now(),
      })
      .onConflictDoUpdate({
        target: news.slug,
        set: {
          title: { vi: n.title },
          excerpt: { vi: n.excerpt },
          bodyHtml: { vi: safeBody },
          category: n.cat,
          tags: n.tags ?? [],
          status: "published",
          updatedAt: now(),
        },
      });
  }
  return seedNews.length;
}

async function seedApplicationTable() {
  for (const [i, a] of seedApplications.entries()) {
    const workflow = a.workflow.map((s) => ({
      n: s.n,
      label: { vi: s.label },
      title: { vi: s.title },
      desc: { vi: s.desc },
    }));
    const specs = a.specs.map((s) => ({
      label: { vi: s.label },
      value: { vi: s.value },
    }));
    const deployments = a.deployments.map((d) => ({
      name: d.name,
      loc: { vi: d.loc },
    }));
    await db
      .insert(application)
      .values({
        slug: a.slug,
        title: { vi: a.machine },
        summary: { vi: a.summary },
        heroImage: null,
        workflow,
        specs,
        deployments,
        status: "published",
        sort: i,
        publishedAt: now(),
      })
      .onConflictDoUpdate({
        target: application.slug,
        set: {
          title: { vi: a.machine },
          summary: { vi: a.summary },
          workflow,
          specs,
          deployments,
          status: "published",
          sort: i,
          updatedAt: now(),
        },
      });
  }
  return seedApplications.length;
}

async function seedServiceTable() {
  for (const [i, s] of seedServices.entries()) {
    const headline = `${s.hero.line1} ${s.hero.emphasis} ${s.hero.line2}`.trim();
    const heroVal = {
      headline: { vi: headline },
      subhead: { vi: s.lede },
      ctaPrimary: { vi: s.cta.title },
      ctaSecondary: { vi: s.cta.desc },
    };
    const stats = s.stats.map(([label, value]) => ({
      label: { vi: label },
      value: { vi: value },
    }));
    const intro = s.includesIntro.map((p) => ({ vi: p }));
    const process = s.process.map((p) => ({
      num: p.num,
      day: { vi: p.day },
      title: { vi: p.title },
      desc: { vi: p.desc },
      duration: { vi: p.duration },
    }));
    const included = s.includes.map((it) => ({
      has: it.has,
      name: { vi: it.name },
      note: { vi: it.note },
      tag: { vi: it.tag },
    }));
    const faqs = s.faqs.map((f) => ({
      q: { vi: f.q },
      a: { vi: f.a },
    }));
    const tiers = s.packages.map((pkg) => ({
      name: pkg.name,
      title: { vi: pkg.title },
      price: { vi: pkg.price },
      priceNote: { vi: pkg.priceNote },
      features: pkg.features.map((f) => ({ vi: f })),
      cta: { vi: pkg.cta },
      featured: pkg.featured ?? false,
    }));
    await db
      .insert(service)
      .values({
        slug: s.slug,
        title: { vi: s.name },
        hero: heroVal,
        stats,
        intro,
        process,
        included,
        faqs,
        tiers,
        status: "published",
        sort: i,
        publishedAt: now(),
      })
      .onConflictDoUpdate({
        target: service.slug,
        set: {
          title: { vi: s.name },
          hero: heroVal,
          stats,
          intro,
          process,
          included,
          faqs,
          tiers,
          status: "published",
          sort: i,
          updatedAt: now(),
        },
      });
  }
  return seedServices.length;
}

async function seedDatasheetTable() {
  for (const [i, d] of seedDatasheets.entries()) {
    await db
      .insert(datasheet)
      .values({
        slug: d.slug,
        name: { vi: d.title },
        fileUrl: d.fileUrl,
        productSlug: d.productSlug ?? null,
        category: d.category,
        series: d.series,
        lang: d.lang,
        ext: d.ext,
        version: d.version,
        docDate: new Date(d.date),
        sizeBytes: d.sizeBytes,
        status: "published",
        featured: d.featured ? "true" : null,
        sort: i,
      })
      .onConflictDoUpdate({
        target: datasheet.slug,
        set: {
          name: { vi: d.title },
          fileUrl: d.fileUrl,
          productSlug: d.productSlug ?? null,
          category: d.category,
          series: d.series,
          lang: d.lang,
          ext: d.ext,
          version: d.version,
          docDate: new Date(d.date),
          sizeBytes: d.sizeBytes,
          status: "published",
          featured: d.featured ? "true" : null,
          sort: i,
          updatedAt: now(),
        },
      });
  }
  return seedDatasheets.length;
}

async function main() {
  ({ db } = await import("../lib/db/client"));
  ({ product, news, application, service, datasheet } = await import("../lib/db/schema/catalog"));
  ({ products: seedProducts } = await import("../data/products"));
  ({ news: seedNews } = await import("../data/news"));
  ({ applications: seedApplications } = await import("../data/applications"));
  ({ services: seedServices } = await import("../data/services"));
  ({ datasheets: seedDatasheets } = await import("../data/datasheets"));
  DOMPurify = (await import("isomorphic-dompurify")).default;

  const p = await seedProductTable();
  const n = await seedNewsTable();
  const a = await seedApplicationTable();
  const s = await seedServiceTable();
  const ds = await seedDatasheetTable();
  console.log(
    `Seeded: ${p} products, ${n} news, ${a} applications, ${s} services, ${ds} datasheets`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
