import { eq } from "drizzle-orm";
import { catalogProducts } from "@/lib/catalog-seed-data";
import { TEST_PRODUCT_SETTING_KEY, TEST_PRODUCT_SLUG } from "@/lib/test-product";
import type { AppDb } from "./types";
import * as schema from "./schema";

async function insertProduct(db: AppDb, product: (typeof catalogProducts)[number]) {
  await db.insert(schema.products).values({
    slug: product.slug,
    cateId: product.cateId,
    name: product.name,
    tagline: product.tagline,
    image: product.image,
    short: product.short,
    description: JSON.stringify(product.description),
    benefits: JSON.stringify(product.benefits),
    ingredients: product.ingredients,
    directions: product.directions,
  });

  for (const variant of product.variants) {
    await db.insert(schema.productVariants).values({
      id: variant.id,
      productSlug: product.slug,
      code: variant.code,
      label: variant.label,
      points: variant.points,
      price: variant.price,
      size: variant.size,
    });
  }
}

async function seedCatalog(db: AppDb) {
  for (const product of catalogProducts) {
    await insertProduct(db, product);
  }
}

export async function ensureTestProductCatalog(db: AppDb) {
  const [existing] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.slug, TEST_PRODUCT_SLUG));
  if (existing) return;

  const testProduct = catalogProducts.find((p) => p.slug === TEST_PRODUCT_SLUG);
  if (!testProduct) return;
  await insertProduct(db, testProduct);
}

export async function ensureDefaultSettings(db: AppDb) {
  const [existing] = await db
    .select()
    .from(schema.appSettings)
    .where(eq(schema.appSettings.key, TEST_PRODUCT_SETTING_KEY));
  if (existing) return;
  await db.insert(schema.appSettings).values({
    key: TEST_PRODUCT_SETTING_KEY,
    value: "true",
  });
}

export async function seedIfEmpty(db: AppDb) {
  const [row] = await db.select().from(schema.products).limit(1);
  if (row) {
    await ensureTestProductCatalog(db);
    await ensureDefaultSettings(db);
    return;
  }
  await seedCatalog(db);
  await ensureDefaultSettings(db);
}
