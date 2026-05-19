"use server";

import { updateTag } from "next/cache";
import { eq, sql } from "drizzle-orm";
import DOMPurify from "isomorphic-dompurify";
import { defineAdminAction } from "@/lib/auth/define-admin-action";
import { logAudit } from "@/app/admin/_actions/audit";
import { news } from "@/lib/db/schema/catalog";
import { newsInput, type NewsInput } from "@/lib/validation/news-schema";
import type { I18nText } from "@/lib/db/schema/catalog";

// Tags allowed in stored news body HTML (defense-in-depth sanitization at write time)
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s",
  "ul", "ol", "li",
  "h1", "h2", "h3", "h4",
  "a", "img",
  "blockquote", "code", "pre", "hr",
];
const ALLOWED_ATTR = ["href", "src", "alt", "title", "rel", "target"];

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Block javascript: and data: URIs in href/src
    ALLOWED_URI_REGEXP: /^(?:(?:https?:|mailto:|\/)|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  });
}

function sanitizeBodyHtml(bodyHtml: { vi?: string; en?: string } | undefined): I18nText {
  return {
    vi: sanitizeHtml(bodyHtml?.vi ?? ""),
    en: bodyHtml?.en ? sanitizeHtml(bodyHtml.en) : undefined,
  };
}

export const createNews = defineAdminAction(
  ["admin", "editor"],
  async ({ session, tx }, input: NewsInput) => {
    const parsed = newsInput.parse(input);
    const sanitized = sanitizeBodyHtml(parsed.bodyHtml);

    const [row] = await tx
      .insert(news)
      .values({
        slug: parsed.slug,
        category: parsed.category,
        title: parsed.title as I18nText,
        excerpt: parsed.excerpt as I18nText,
        bodyHtml: sanitized,
        bodyJson: parsed.bodyJson ?? null,
        coverImage: parsed.coverImage ?? null,
        tags: parsed.tags,
        status: parsed.status,
        publishedAt: parsed.publishedAt ?? null,
        updatedBy: session.user.id,
      })
      .returning({ slug: news.slug });

    await logAudit(
      {
        actorUserId: session.user.id,
        action: "create",
        entity: "news",
        entityId: row.slug,
        diff: { slug: parsed.slug, status: parsed.status },
      },
      tx,
    );

    updateTag("news");
    updateTag(`news:${parsed.slug}`);
    return { slug: row.slug };
  },
);

export const updateNews = defineAdminAction(
  ["admin", "editor"],
  async ({ session, tx }, slug: string, input: NewsInput) => {
    const parsed = newsInput.parse(input);
    const sanitized = sanitizeBodyHtml(parsed.bodyHtml);

    await tx
      .update(news)
      .set({
        category: parsed.category,
        title: parsed.title as I18nText,
        excerpt: parsed.excerpt as I18nText,
        bodyHtml: sanitized,
        bodyJson: parsed.bodyJson ?? null,
        coverImage: parsed.coverImage ?? null,
        tags: parsed.tags,
        status: parsed.status,
        publishedAt: parsed.publishedAt ?? null,
        updatedBy: session.user.id,
        updatedAt: new Date(),
      })
      .where(eq(news.slug, slug));

    await logAudit(
      {
        actorUserId: session.user.id,
        action: "update",
        entity: "news",
        entityId: slug,
        diff: { status: parsed.status, slug: parsed.slug },
      },
      tx,
    );

    updateTag("news");
    updateTag(`news:${slug}`);
    if (parsed.slug !== slug) updateTag(`news:${parsed.slug}`);
    return { slug };
  },
);

export const deleteNews = defineAdminAction(
  ["admin"],
  async ({ session, tx }, slug: string) => {
    await tx.delete(news).where(eq(news.slug, slug));

    await logAudit(
      {
        actorUserId: session.user.id,
        action: "delete",
        entity: "news",
        entityId: slug,
      },
      tx,
    );

    updateTag("news");
    updateTag(`news:${slug}`);
    return { slug };
  },
);

// No auth guard needed — returns only distinct tag strings, no PII
export async function getTagSuggestions(): Promise<string[]> {
  const { db } = await import("@/lib/db/client");
  const rows = await db.execute(
    sql`SELECT DISTINCT unnest(tags) AS tag FROM news ORDER BY 1`,
  );
  return (rows as unknown as Array<{ tag: string }>).map((r) => r.tag).filter(Boolean);
}
