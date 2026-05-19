"use server";

import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { defineAdminAction } from "@/lib/auth/define-admin-action";
import { product } from "@/lib/db/schema/catalog";
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/lib/validation/product-schema";
import { logAudit } from "@/app/admin/_actions/audit";

// ── helpers ──────────────────────────────────────────────────────────────────

async function slugExists(
  tx: Parameters<Parameters<typeof import("@/lib/db/client").db.transaction>[0]>[0],
  slug: string,
  excludeSlug?: string,
): Promise<boolean> {
  const rows = await tx
    .select({ slug: product.slug })
    .from(product)
    .where(eq(product.slug, slug))
    .limit(1);
  if (rows.length === 0) return false;
  return rows[0].slug !== excludeSlug;
}

function revalidateProduct(slug: string) {
  // Second arg is the cache-life profile; {} means "expire immediately"
  revalidateTag("products", {});
  revalidateTag(`product:${slug}`, {});
}

// ── createProduct ─────────────────────────────────────────────────────────────

export const createProduct = defineAdminAction(
  ["admin", "editor"],
  async ({ session, tx }, input: CreateProductInput) => {
    const parsed = createProductSchema.parse(input);

    if (await slugExists(tx, parsed.slug)) {
      return { ok: false as const, error: "Slug already taken" };
    }

    const [row] = await tx
      .insert(product)
      .values({
        slug: parsed.slug,
        series: parsed.series,
        axes: parsed.axes,
        display: parsed.display,
        badge: parsed.badge ?? null,
        tag: parsed.tag,
        name: parsed.name,
        desc: parsed.desc,
        bullets: parsed.bullets,
        specs: parsed.specs,
        images: parsed.images,
        status: parsed.status,
        sort: parsed.sort,
        updatedBy: session.user.id,
      })
      .returning({ slug: product.slug });

    await logAudit(
      {
        actorUserId: session.user.id,
        action: "create",
        entity: "product",
        entityId: row.slug,
        diff: parsed,
      },
      tx,
    );

    revalidateProduct(row.slug);
    return { ok: true as const, slug: row.slug };
  },
);

// ── updateProduct ─────────────────────────────────────────────────────────────

export const updateProduct = defineAdminAction(
  ["admin", "editor"],
  async ({ session, tx }, input: UpdateProductInput) => {
    const parsed = updateProductSchema.parse(input);
    const currentSlug = parsed.id; // id = the current slug (PK)

    // Fetch old values for diff
    const [old] = await tx
      .select()
      .from(product)
      .where(eq(product.slug, currentSlug))
      .limit(1);

    if (!old) {
      return { ok: false as const, error: "Product not found" };
    }

    // Slug change: check uniqueness against other rows
    if (parsed.slug !== currentSlug) {
      if (await slugExists(tx, parsed.slug, currentSlug)) {
        return { ok: false as const, error: "Slug already taken" };
      }
    }

    const [updated] = await tx
      .update(product)
      .set({
        slug: parsed.slug,
        series: parsed.series,
        axes: parsed.axes,
        display: parsed.display,
        badge: parsed.badge ?? null,
        tag: parsed.tag,
        name: parsed.name,
        desc: parsed.desc,
        bullets: parsed.bullets,
        specs: parsed.specs,
        images: parsed.images,
        status: parsed.status,
        sort: parsed.sort,
        updatedBy: session.user.id,
        updatedAt: new Date(),
      })
      .where(eq(product.slug, currentSlug))
      .returning({ slug: product.slug });

    await logAudit(
      {
        actorUserId: session.user.id,
        action: "update",
        entity: "product",
        entityId: updated.slug,
        diff: { before: old, after: parsed },
      },
      tx,
    );

    revalidateProduct(updated.slug);
    // If slug changed also invalidate the old tag
    if (updated.slug !== currentSlug) {
      revalidateTag(`product:${currentSlug}`, {});
    }
    return { ok: true as const, slug: updated.slug };
  },
);

// ── deleteProduct ─────────────────────────────────────────────────────────────

export const deleteProduct = defineAdminAction(
  ["admin", "editor"],
  async ({ session, tx }, slug: string) => {
    if (!slug) return { ok: false as const, error: "Slug required" };

    const [old] = await tx
      .select({ slug: product.slug, name: product.name })
      .from(product)
      .where(eq(product.slug, slug))
      .limit(1);

    if (!old) {
      return { ok: false as const, error: "Product not found" };
    }

    // Soft-delete via status=archived (avoids breaking datasheet FK references)
    await tx
      .update(product)
      .set({ status: "archived", updatedBy: session.user.id, updatedAt: new Date() })
      .where(eq(product.slug, slug));

    await logAudit(
      {
        actorUserId: session.user.id,
        action: "delete",
        entity: "product",
        entityId: slug,
        diff: { name: old.name },
      },
      tx,
    );

    revalidateProduct(slug);
    return { ok: true as const };
  },
);
