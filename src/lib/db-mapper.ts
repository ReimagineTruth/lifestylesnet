import { asc, desc, eq } from "drizzle-orm";
import type { Product, ProductVariant } from "@/lib/catalog-data";
import { getVariant as getCatalogVariant, migrateLegacyCartId } from "@/lib/catalog-data";
import { ensureDbReady } from "@/db/index";
import * as schema from "@/db/schema";

function rowToProduct(
  row: typeof schema.products.$inferSelect,
  variants: (typeof schema.productVariants.$inferSelect)[],
): Product {
  return {
    slug: row.slug,
    cateId: row.cateId,
    name: row.name,
    tagline: row.tagline,
    image: row.image,
    short: row.short,
    description: JSON.parse(row.description) as string[],
    benefits: JSON.parse(row.benefits) as string[],
    ingredients: row.ingredients,
    directions: row.directions,
    variants: variants.map(
      (v): ProductVariant => ({
        id: v.id,
        code: v.code,
        label: v.label,
        points: v.points,
        price: v.price,
        size: v.size,
      }),
    ),
  };
}

export async function dbListProducts() {
  const db = await ensureDbReady();
  const rows = await db.select().from(schema.products).orderBy(asc(schema.products.name));
  const allVariants = await db.select().from(schema.productVariants);
  return rows.map((row) =>
    rowToProduct(
      row,
      allVariants.filter((v) => v.productSlug === row.slug),
    ),
  );
}

export async function dbGetProduct(slug: string) {
  const db = await ensureDbReady();
  const [row] = await db.select().from(schema.products).where(eq(schema.products.slug, slug));
  if (!row) return undefined;
  const variants = await db
    .select()
    .from(schema.productVariants)
    .where(eq(schema.productVariants.productSlug, slug));
  return rowToProduct(row, variants);
}

export async function dbGetVariant(variantId: string) {
  const resolvedId = migrateLegacyCartId(variantId);
  const db = await ensureDbReady();

  for (const id of new Set([resolvedId, variantId])) {
    const [variant] = await db
      .select()
      .from(schema.productVariants)
      .where(eq(schema.productVariants.id, id));
    if (!variant) continue;
    const product = await dbGetProduct(variant.productSlug);
    if (!product) continue;
    const v = product.variants.find((item) => item.id === variant.id);
    if (v) return { product, variant: v };
  }

  return getCatalogVariant(resolvedId);
}

export async function dbAllVariants() {
  const list = await dbListProducts();
  return list.flatMap((product) => product.variants.map((variant) => ({ product, variant })));
}

export function newId(prefix = "") {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function dbListFeedbackThreads() {
  const db = await ensureDbReady();
  const threads = await db
    .select()
    .from(schema.feedbackThreads)
    .orderBy(desc(schema.feedbackThreads.updatedAt));
  const messages = await db.select().from(schema.feedbackMessages);
  return threads.map((thread) => {
    const threadMessages = messages
      .filter((m) => m.threadId === thread.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const lastMessage = threadMessages[threadMessages.length - 1];
    return {
      threadId: thread.id,
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            threadId: lastMessage.threadId,
            text: lastMessage.text,
            from: lastMessage.sender as "user" | "support",
            name: lastMessage.senderName ?? undefined,
            createdAt: lastMessage.createdAt,
          }
        : {
            id: thread.id,
            threadId: thread.id,
            text: "",
            from: "user" as const,
            createdAt: thread.createdAt,
          },
      count: threadMessages.length,
    };
  });
}
